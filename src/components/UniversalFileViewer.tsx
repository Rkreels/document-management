
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize, Grid, Move, RefreshCw, FileText, Image, File } from 'lucide-react';
import { DocumentField } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import * as pdfjsLib from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';

const setupPDFWorker = () => {
  try {
    const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  } catch (error) {
    console.error('PDF.js worker setup failed:', error);
  }
};

setupPDFWorker();

type FileType = 'pdf' | 'image' | 'text' | 'word' | 'excel' | 'powerpoint' | 'unsupported';

interface UniversalFileViewerProps {
  fileData: string;
  fileName?: string;
  mimeType?: string;
  fields: DocumentField[];
  onFieldClick?: (field: DocumentField) => void;
  onFieldMove?: (fieldId: string, x: number, y: number) => void;
  onFieldResize?: (fieldId: string, width: number, height: number) => void;
  signingMode?: boolean;
  editMode?: boolean;
  viewMode?: 'signing' | 'editing' | 'preview';
}

export const UniversalFileViewer: React.FC<UniversalFileViewerProps> = ({
  fileData,
  fileName = '',
  mimeType = '',
  fields,
  onFieldClick,
  onFieldMove,
  onFieldResize,
  signingMode = false,
  editMode = false,
  viewMode = 'preview'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const { speak, announceFieldFocus } = useVoice();
  const { toast } = useToast();
  
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType>('unsupported');
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [fileContent, setFileContent] = useState<string>('');

  const detectFileType = useCallback((fileName: string, mimeType: string): FileType => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    
    // PDF files
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    }
    
    // Image files
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
      return 'image';
    }
    
    // Text files
    if (mimeType.startsWith('text/') || ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'ts'].includes(extension)) {
      return 'text';
    }
    
    // Word documents
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        mimeType === 'application/msword' || 
        ['doc', 'docx'].includes(extension)) {
      return 'word';
    }
    
    // Excel files
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        mimeType === 'application/vnd.ms-excel' || 
        ['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    }
    
    // PowerPoint files
    if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || 
        mimeType === 'application/vnd.ms-powerpoint' || 
        ['ppt', 'pptx'].includes(extension)) {
      return 'powerpoint';
    }
    
    return 'unsupported';
  }, []);

  const loadFile = useCallback(async () => {
    if (!fileData) {
      setError('No file data provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const detectedType = detectFileType(fileName, mimeType);
      setFileType(detectedType);

      switch (detectedType) {
        case 'pdf':
          await loadPDF();
          break;
        case 'image':
          await loadImage();
          break;
        case 'text':
          await loadText();
          break;
        case 'word':
        case 'excel':
        case 'powerpoint':
          await loadOfficeDocument(detectedType);
          break;
        default:
          setError(`Unsupported file type: ${fileName}`);
          toast({
            title: 'Unsupported File Type',
            description: `Cannot preview ${fileName}. Supported formats: PDF, Images, Text, Word, Excel, PowerPoint`,
            variant: 'destructive',
          });
      }
    } catch (err: any) {
      console.error("Error loading file:", err);
      setError(`Error loading file: ${err.message}`);
      toast({
        title: 'File Loading Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [fileData, fileName, mimeType, detectFileType, toast]);

  const loadPDF = async () => {
    const binaryString = atob(fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const loadingTask = pdfjsLib.getDocument({
      data: bytes,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
    });

    const pdf = await loadingTask.promise;
    setPdfDocument(pdf);
    setTotalPages(pdf.numPages);
    setCurrentPage(1);
    
    toast({
      title: 'PDF Loaded Successfully',
      description: `Document loaded with ${pdf.numPages} pages`,
    });
  };

  const loadImage = async () => {
    const img = document.createElement('img');
    const dataUrl = `data:${mimeType};base64,${fileData}`;
    
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
          }
        }
        setTotalPages(1);
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  const loadText = async () => {
    const textContent = atob(fileData);
    setFileContent(textContent);
    setTotalPages(1);
  };

  const loadOfficeDocument = async (type: FileType) => {
    // For Office documents, we'll show a download/preview message
    // In a real implementation, you'd use libraries like mammoth.js for Word docs
    setFileContent(`Preview not available for ${type} documents. Click download to view the file.`);
    setTotalPages(1);
    
    toast({
      title: 'Limited Preview',
      description: `${type} documents require download to view. Preview functionality can be enhanced with specialized libraries.`,
    });
  };

  const renderPDFPage = useCallback(async () => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(currentPage);
      const viewport = page.getViewport({ scale: zoom, rotation });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error("Error rendering page:", err);
        setError(`Error rendering page: ${err.message}`);
      }
    }
  }, [pdfDocument, currentPage, zoom, rotation]);

  useEffect(() => {
    loadFile();
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [loadFile]);

  useEffect(() => {
    if (pdfDocument && fileType === 'pdf') {
      renderPDFPage();
    }
  }, [pdfDocument, renderPDFPage, fileType]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onFieldClick || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const clickedField = fields.find(field => {
      if (field.page !== currentPage) return false;
      const fieldRight = field.x + field.width;
      const fieldBottom = field.y + field.height;
      return x >= field.x && x <= fieldRight && y >= field.y && y <= fieldBottom;
    });

    if (clickedField) {
      onFieldClick(clickedField);
      announceFieldFocus(clickedField.type, clickedField.label, clickedField.required);
    }
  };

  const handleFieldMouseDown = (event: React.MouseEvent, field: DocumentField) => {
    if (!editMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setDraggedField(field.id);
    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!draggedField || !editMode || !canvasRef.current || !onFieldMove) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    onFieldMove(draggedField, Math.max(0, Math.min(95, x)), Math.max(0, Math.min(95, y)));
  };

  const handleMouseUp = () => {
    if (draggedField) {
      speak('Field position updated', 'normal');
    }
    setDraggedField(null);
  };

  const renderFields = () => {
    if (!canvasRef.current || fileType !== 'pdf') return null;

    return fields
      .filter(field => field.page === currentPage)
      .map(field => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${field.x}%`,
          top: `${field.y}%`,
          width: `${field.width}%`,
          height: `${field.height}%`,
          border: editMode ? '2px solid #3b82f6' : signingMode ? '2px solid #10b981' : '2px dashed #6b7280',
          backgroundColor: editMode ? 'rgba(59, 130, 246, 0.1)' : signingMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          cursor: editMode ? 'move' : signingMode ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: editMode ? '#1e40af' : signingMode ? '#065f46' : '#374151',
          fontWeight: '500',
          pointerEvents: editMode || signingMode ? 'auto' : 'none',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          zIndex: 10
        };

        const getFieldContent = () => {
          if (field.value) {
            if (field.type === 'signature') {
              return '✓ Signed';
            } else if (field.type === 'checkbox') {
              return field.value === 'true' ? '☑' : '☐';
            } else {
              return field.value.toString().substring(0, 20) + (field.value.toString().length > 20 ? '...' : '');
            }
          }
          return field.label || field.type.charAt(0).toUpperCase() + field.type.slice(1);
        };

        return (
          <div
            key={field.id}
            style={style}
            onClick={() => !editMode && signingMode && onFieldClick && onFieldClick(field)}
            onMouseDown={editMode ? (e) => handleFieldMouseDown(e, field) : undefined}
            className={`field-overlay ${
              editMode ? 'hover:bg-blue-200 hover:border-blue-400' : 
              signingMode ? 'hover:bg-green-200 hover:border-green-400' : ''
            }`}
            title={field.label || field.type}
          >
            {getFieldContent()}
            {editMode && (
              <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                {field.type}
              </Badge>
            )}
            {field.required && (
              <span className="absolute -top-1 -right-1 text-red-500 text-xs">*</span>
            )}
          </div>
        );
      });
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' 
      ? Math.min(3, zoom + 0.2) 
      : Math.max(0.3, zoom - 0.2);
    setZoom(newZoom);
    speak(`Zoom ${direction === 'in' ? 'increased' : 'decreased'} to ${Math.round(newZoom * 100)}%`, 'low');
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    const newPage = direction === 'next' 
      ? Math.min(totalPages, currentPage + 1)
      : Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    speak(`Page ${newPage} of ${totalPages}`, 'low');
  };

  const getFileTypeIcon = () => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const downloadFile = () => {
    const dataUrl = `data:${mimeType || 'application/octet-stream'};base64,${fileData}`;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadFile} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={downloadFile} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          {getFileTypeIcon()}
          <Badge variant="outline">{fileType.toUpperCase()}</Badge>
          <span className="text-sm text-gray-600">{fileName}</span>
        </div>

        {fileType === 'pdf' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleZoom('out')} disabled={zoom <= 0.3}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={() => handleZoom('in')} disabled={zoom >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('next')}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {fileType === 'pdf' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((rotation + 90) % 360)}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={downloadFile}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {(editMode || signingMode) && fileType === 'pdf' && (
        <div className="px-4 py-2 bg-blue-50 border-b text-sm">
          {editMode && (
            <span className="text-blue-700">
              <Move className="inline h-4 w-4 mr-1" />
              Edit Mode: Drag fields to reposition them
            </span>
          )}
          {signingMode && (
            <span className="text-green-700">
              <Grid className="inline h-4 w-4 mr-1" />
              Signing Mode: Click on fields to fill them out
            </span>
          )}
        </div>
      )}

      {/* File Content Container */}
      <div 
        ref={containerRef}
        className="relative overflow-auto bg-gray-100 flex justify-center items-center min-h-96"
        style={{ height: '700px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading {fileType}...</p>
            </div>
          </div>
        )}
        
        <div className="relative">
          {fileType === 'pdf' || fileType === 'image' ? (
            <>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  cursor: editMode ? 'crosshair' : signingMode ? 'crosshair' : 'default'
                }}
                className="shadow-lg bg-white"
              />
              {renderFields()}
            </>
          ) : fileType === 'text' ? (
            <div className="bg-white p-6 shadow-lg rounded-lg max-w-4xl w-full">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {fileContent}
              </pre>
            </div>
          ) : (
            <div className="bg-white p-8 shadow-lg rounded-lg max-w-md text-center">
              <div className="mb-4">
                {getFileTypeIcon()}
              </div>
              <h3 className="text-lg font-semibold mb-2">{fileName}</h3>
              <p className="text-gray-600 mb-4">{fileContent}</p>
              <Button onClick={downloadFile}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
