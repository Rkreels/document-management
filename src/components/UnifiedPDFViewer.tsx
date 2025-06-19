
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { DocumentField } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import * as pdfjsLib from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';
import { PDFControls } from './PDFControls';

// Configure PDF.js worker
const setupPDFWorker = () => {
  try {
    const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  } catch (error) {
    console.error('PDF.js worker setup failed:', error);
  }
};

setupPDFWorker();

interface UnifiedPDFViewerProps {
  pdfData: string;
  fields: DocumentField[];
  onFieldClick?: (field: DocumentField) => void;
  onFieldMove?: (fieldId: string, x: number, y: number) => void;
  onFieldResize?: (fieldId: string, width: number, height: number) => void;
  signingMode?: boolean;
  editMode?: boolean;
  viewMode?: 'signing' | 'editing' | 'preview';
}

export const UnifiedPDFViewer: React.FC<UnifiedPDFViewerProps> = ({
  pdfData,
  fields,
  onFieldClick,
  onFieldMove,
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
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const validatePDFData = (data: string): boolean => {
    if (!data || data.length < 100) {
      console.warn('PDF data too short:', data.length);
      return false;
    }
    
    try {
      const binaryString = atob(data);
      const pdfHeader = binaryString.substring(0, 4);
      if (pdfHeader !== '%PDF') {
        console.warn('Invalid PDF header:', pdfHeader);
        return false;
      }
      return true;
    } catch (error) {
      console.warn('PDF data validation failed:', error);
      return false;
    }
  };

  const loadPDF = useCallback(async () => {
    if (!pdfData) {
      setError('No PDF data provided');
      setIsLoading(false);
      return;
    }

    if (!validatePDFData(pdfData)) {
      setError('Invalid PDF file format. Please upload a valid PDF document.');
      setIsLoading(false);
      toast({
        title: 'Invalid PDF File',
        description: 'The uploaded file is not a valid PDF document. Please try uploading a different file.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const binaryString = atob(pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const loadingTask = pdfjsLib.getDocument({
        data: bytes,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
        verbosity: 0,
      });

      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      toast({
        title: 'PDF Loaded Successfully',
        description: `Document loaded with ${pdf.numPages} pages`,
      });
    } catch (err: any) {
      console.error("Error loading PDF:", err);
      const errorMessage = err.name === 'InvalidPDFException' 
        ? 'The PDF file appears to be corrupted or invalid.' 
        : err.name === 'MissingPDFException'
        ? 'PDF file is missing or corrupted'
        : `PDF loading error: ${err.message}`;
      
      setError(errorMessage);
      toast({
        title: 'PDF Loading Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [pdfData, toast]);

  const renderPage = useCallback(async () => {
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
    loadPDF();
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [loadPDF]);

  useEffect(() => {
    if (pdfDocument) {
      renderPage();
    }
  }, [pdfDocument, renderPage]);

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

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
    speak('Document rotated', 'low');
  };

  const renderFields = () => {
    if (!canvasRef.current) return null;

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

  if (error) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-red-700">PDF Loading Error</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p>This error typically occurs when:</p>
            <ul className="list-disc list-inside text-left max-w-md mx-auto">
              <li>The PDF file is corrupted or incomplete</li>
              <li>The file is not actually a PDF document</li>
              <li>The PDF was generated incorrectly</li>
            </ul>
          </div>
          <button 
            onClick={loadPDF} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <PDFControls
        zoom={zoom}
        currentPage={currentPage}
        totalPages={totalPages}
        onZoom={handleZoom}
        onPageChange={handlePageChange}
        onRotate={handleRotate}
      />

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
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}
        
        <div className="relative">
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
        </div>
      </div>
    </div>
  );
};
