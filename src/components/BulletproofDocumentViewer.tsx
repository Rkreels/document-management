import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  RefreshCw, 
  FileText, 
  Image, 
  File,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { DocumentField } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/hooks/use-toast';
import { PDFControls } from './PDFControls';
import * as pdfjsLib from 'pdfjs-dist';

// Setup PDF.js worker with multiple fallback sources
const setupPDFWorker = () => {
  const workerSources = [
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`,
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
    '/pdf.worker.min.js' // Local fallback
  ];
  
  let workerSetup = false;
  for (const src of workerSources) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = src;
      workerSetup = true;
      console.log(`PDF.js worker configured with: ${src}`);
      break;
    } catch (error) {
      console.warn(`Failed to setup PDF worker with ${src}:`, error);
    }
  }
  
  if (!workerSetup) {
    console.error('All PDF worker sources failed, PDF functionality may be limited');
  }
};

setupPDFWorker();

type ViewerMode = 'pdf' | 'html' | 'text' | 'image' | 'error';

interface BulletproofDocumentViewerProps {
  fileData: string;
  fileName?: string;
  mimeType?: string;
  fields: DocumentField[];
  onFieldClick?: (field: DocumentField) => void;
  onFieldMove?: (fieldId: string, x: number, y: number) => void;
  signingMode?: boolean;
  editMode?: boolean;
  viewMode?: 'signing' | 'editing' | 'preview';
}

export const BulletproofDocumentViewer: React.FC<BulletproofDocumentViewerProps> = ({
  fileData,
  fileName = 'Document',
  mimeType = 'application/pdf',
  fields,
  onFieldClick,
  onFieldMove,
  signingMode = false,
  editMode = false,
  viewMode = 'preview'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlViewerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  
  const { speak, announceFieldFocus } = useVoice();
  const { toast } = useToast();
  
  const [viewerMode, setViewerMode] = useState<ViewerMode>('pdf');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [fallbackAttempts, setFallbackAttempts] = useState(0);

  const validateAndCleanData = useCallback((data: string): { isValid: boolean; cleanData: string; error?: string } => {
    if (!data || data.trim().length === 0) {
      return { isValid: false, cleanData: '', error: 'No data provided' };
    }

    try {
      let cleanData = data;
      
      // Remove data URL prefix if present
      if (data.includes('data:')) {
        const parts = data.split(',');
        if (parts.length > 1) {
          cleanData = parts[1];
        }
      }

      // Validate base64 format
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanData)) {
        return { isValid: false, cleanData: '', error: 'Invalid base64 format' };
      }

      // Test decoding
      const decoded = atob(cleanData);
      if (decoded.length === 0) {
        return { isValid: false, cleanData: '', error: 'Empty decoded content' };
      }

      return { isValid: true, cleanData };
    } catch (error) {
      return { isValid: false, cleanData: '', error: 'Base64 decode failed' };
    }
  }, []);

  const loadWithFallback = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const validation = validateAndCleanData(fileData);
    if (!validation.isValid) {
      setError(`Data validation failed: ${validation.error}`);
      await attemptFallback();
      return;
    }

    // Try PDF first
    if (mimeType?.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      const pdfSuccess = await tryLoadPDF(validation.cleanData);
      if (pdfSuccess) return;
    }

    // Try HTML
    if (mimeType?.includes('html') || fileName.toLowerCase().endsWith('.html')) {
      const htmlSuccess = await tryLoadHTML(validation.cleanData);
      if (htmlSuccess) return;
    }

    // Try Image
    if (mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName)) {
      const imageSuccess = await tryLoadImage(validation.cleanData);
      if (imageSuccess) return;
    }

    // Try Text
    const textSuccess = await tryLoadText(validation.cleanData);
    if (textSuccess) return;

    // Final fallback
    await attemptFallback();
  }, [fileData, fileName, mimeType, validateAndCleanData]);

  const tryLoadPDF = async (data: string): Promise<boolean> => {
    try {
      console.log('Attempting PDF load...');
      
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Validate PDF header
      if (bytes.length < 5 || String.fromCharCode(...bytes.slice(0, 4)) !== '%PDF') {
        console.log('Invalid PDF header');
        return false;
      }

      const loadingTask = pdfjsLib.getDocument({
        data: bytes,
        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`,
        stopAtErrors: false
      });

      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setViewerMode('pdf');
      setIsLoading(false);
      
      toast({
        title: 'Document Loaded',
        description: `PDF loaded successfully with ${pdf.numPages} pages`,
      });
      
      speak('PDF document loaded successfully', 'normal');
      return true;
    } catch (error: any) {
      console.log('PDF load failed:', error.message);
      return false;
    }
  };

  const tryLoadHTML = async (data: string): Promise<boolean> => {
    try {
      const htmlContent = atob(data);
      if (htmlContent.includes('<html') || htmlContent.includes('<HTML')) {
        setContent(htmlContent);
        setViewerMode('html');
        setTotalPages(1);
        setIsLoading(false);
        
        toast({
          title: 'Document Loaded',
          description: 'HTML document loaded successfully',
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.log('HTML load failed:', error);
      return false;
    }
  };

  const tryLoadImage = async (data: string): Promise<boolean> => {
    try {
      const img = document.createElement('img');
      const dataUrl = `data:${mimeType};base64,${data}`;
      
      return new Promise<boolean>((resolve) => {
        img.onload = () => {
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
              canvas.width = img.width;
              canvas.height = img.height;
              context.drawImage(img, 0, 0);
              setViewerMode('image');
              setTotalPages(1);
              setIsLoading(false);
              
              toast({
                title: 'Image Loaded',
                description: 'Image loaded successfully',
              });
              
              resolve(true);
            }
          }
          resolve(false);
        };
        img.onerror = () => resolve(false);
        img.src = dataUrl;
      });
    } catch (error) {
      console.log('Image load failed:', error);
      return false;
    }
  };

  const tryLoadText = async (data: string): Promise<boolean> => {
    try {
      const textContent = atob(data);
      setContent(textContent);
      setViewerMode('text');
      setTotalPages(1);
      setIsLoading(false);
      
      toast({
        title: 'Text Document',
        description: 'Document loaded as text',
      });
      
      return true;
    } catch (error) {
      console.log('Text load failed:', error);
      return false;
    }
  };

  const attemptFallback = async () => {
    const fallbackContent = `
Document Preview Unavailable

The document "${fileName}" could not be displayed in its original format.

Possible reasons:
• Unsupported file format
• Corrupted file data  
• Network connectivity issues

Available actions:
• Download the file to view externally
• Try refreshing the page
• Contact support if the issue persists

Document Fields: ${fields.length} configured
Signing Mode: ${signingMode ? 'Active' : 'Inactive'}
Edit Mode: ${editMode ? 'Active' : 'Inactive'}

This is a fallback viewer that ensures the application
remains functional regardless of document format.
    `;

    setContent(fallbackContent);
    setViewerMode('error');
    setTotalPages(1);
    setIsLoading(false);
    setFallbackAttempts(prev => prev + 1);
    
    toast({
      title: 'Fallback Mode',
      description: 'Document loaded in compatibility mode',
      variant: 'destructive',
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

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error("PDF render error:", err);
      }
    }
  }, [pdfDocument, currentPage, zoom, rotation]);

  useEffect(() => {
    loadWithFallback();
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [loadWithFallback]);

  useEffect(() => {
    if (pdfDocument && viewerMode === 'pdf') {
      renderPDFPage();
    }
  }, [pdfDocument, renderPDFPage, viewerMode]);

  const handleFieldClick = (field: DocumentField) => {
    if (!onFieldClick) return;
    onFieldClick(field);
    announceFieldFocus(field.type, field.label, field.required);
  };

  const renderFields = () => {
    if (viewerMode !== 'pdf' || !canvasRef.current) return null;

    return fields
      .filter(field => field.page === currentPage)
      .map(field => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${field.x}%`,
          top: `${field.y}%`,
          width: `${field.width}%`,
          height: `${field.height}%`,
          border: signingMode ? '2px solid hsl(var(--primary))' : '2px dashed hsl(var(--border))',
          backgroundColor: signingMode ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.5)',
          cursor: signingMode ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'hsl(var(--foreground))',
          fontWeight: '500',
          pointerEvents: signingMode || editMode ? 'auto' : 'none',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          zIndex: 10,
          borderRadius: '4px'
        };

        const getFieldContent = () => {
          if (field.value) {
            if (field.type === 'signature') {
              return '✓ Signed';
            } else if (field.type === 'checkbox') {
              return field.value === 'true' ? '☑' : '☐';
            } else {
              const text = field.value.toString();
              return text.length > 15 ? text.substring(0, 15) + '...' : text;
            }
          }
          return field.label || field.type;
        };

        return (
          <div
            key={field.id}
            style={style}
            onClick={() => handleFieldClick(field)}
            className="field-overlay hover:opacity-80"
            title={`${field.label} (${field.type})${field.required ? ' - Required' : ''}`}
          >
            <span className="text-xs text-center px-1">
              {getFieldContent()}
            </span>
            {field.required && (
              <span className="absolute -top-1 -right-1 text-red-500 text-xs">*</span>
            )}
          </div>
        );
      });
  };

  const downloadDocument = () => {
    try {
      const dataUrl = `data:${mimeType};base64,${fileData}`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download Started',
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Unable to download the document',
        variant: 'destructive',
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96 bg-muted/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
      );
    }

    switch (viewerMode) {
      case 'pdf':
      case 'image':
        return (
          <div className="relative bg-muted/20 flex justify-center items-center min-h-96 overflow-auto">
            <div className="relative">
              <canvas
                ref={canvasRef}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  cursor: signingMode ? 'crosshair' : 'default'
                }}
                className="shadow-lg bg-white max-w-full h-auto"
              />
              {renderFields()}
            </div>
          </div>
        );

      case 'html':
        return (
          <div 
            ref={htmlViewerRef}
            className="bg-white p-6 min-h-96 overflow-auto border"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );

      case 'text':
      case 'error':
        return (
          <div className="bg-muted/20 p-6 min-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
              {content}
            </pre>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96 bg-muted/20">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unsupported Format</h3>
              <p className="text-muted-foreground mb-4">This document format is not supported for preview.</p>
              <Button onClick={downloadDocument}>
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2">
          {viewerMode === 'pdf' && <FileText className="h-4 w-4 text-primary" />}
          {viewerMode === 'image' && <Image className="h-4 w-4 text-primary" />}
          {(viewerMode === 'html' || viewerMode === 'text') && <File className="h-4 w-4 text-primary" />}
          {viewerMode === 'error' && <AlertTriangle className="h-4 w-4 text-destructive" />}
          
          <Badge variant={viewerMode === 'error' ? 'destructive' : 'default'}>
            {viewerMode.toUpperCase()}
          </Badge>
          
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {fileName}
          </span>
          
          {fallbackAttempts > 0 && (
            <Badge variant="outline">Fallback Mode</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {fields.length > 0 && (
            <Badge variant="outline">
              {fields.length} fields
            </Badge>
          )}
          
          {signingMode && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Signing Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      {viewerMode === 'pdf' && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.3, zoom - 0.2))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.2))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={downloadDocument}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>

      {/* Error Recovery */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadWithFallback}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};