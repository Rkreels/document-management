
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Download, RefreshCw } from 'lucide-react';
import { DocumentField } from '@/contexts/DocumentContext';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the PDF.js worker with fallback
const setupPDFWorker = () => {
  try {
    const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    console.log('PDF.js worker configured successfully');
  } catch (error) {
    console.error('PDF.js worker setup failed:', error);
  }
};

setupPDFWorker();

interface PDFViewerProps {
  pdfData: string;
  fields: DocumentField[];
  onFieldClick?: (field: DocumentField) => void;
  signingMode?: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfData,
  fields,
  onFieldClick,
  signingMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);

  const loadPDF = async () => {
    if (!pdfData || pdfData.trim() === '') {
      setError('No PDF content available. Please upload a PDF file or load sample content.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Reset document state
    setPdfDocument(null);
    setCurrentPage(1);
    setTotalPages(1);

    try {
      console.log('Loading PDF with data length:', pdfData.length);
      
      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      // Clean PDF data - remove data URL prefix if present
      let cleanPdfData = pdfData;
      if (pdfData.includes('data:application/pdf;base64,')) {
        cleanPdfData = pdfData.split('data:application/pdf;base64,')[1];
      } else if (pdfData.includes('base64,')) {
        cleanPdfData = pdfData.split('base64,')[1];
      }

      // Validate base64 format
      if (!cleanPdfData || cleanPdfData.length === 0) {
        setError('Invalid PDF data: Empty content');
        return;
      }

      // Decode base64 with better error handling
      let uint8Array: Uint8Array;
      try {
        const binaryString = atob(cleanPdfData);
        uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        console.log('PDF data decoded successfully, size:', uint8Array.length);
        
        // Basic PDF validation - check for PDF header
        if (uint8Array.length < 5 || String.fromCharCode(...uint8Array.slice(0, 4)) !== '%PDF') {
          setError('Invalid PDF format: Missing PDF header');
          return;
        }
      } catch (decodeError) {
        console.error('Error decoding base64 PDF data:', decodeError);
        setError('Invalid PDF data format. Please upload a valid PDF file.');
        return;
      }

      // Load PDF document with proper configuration
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`,
      });

      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Error loading PDF:", err);
      if (err.name === 'InvalidPDFException') {
        setError('Invalid PDF file. Please upload a valid PDF document.');
      } else if (err.name === 'MissingPDFException') {
        setError('PDF file is missing or corrupted. Please try uploading again.');
      } else if (err.name === 'UnexpectedResponseException') {
        setError('Network error loading PDF. Please check your connection.');
      } else {
        setError(`Error loading PDF: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async () => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(currentPage);
      const viewport = page.getViewport({ scale: zoom, rotation });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('Canvas context not available');
        return;
      }

      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      // Store the render task reference
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      
      console.log('Page rendered successfully');
      renderTaskRef.current = null;
    } catch (err: any) {
      if (err.name === 'RenderingCancelledException') {
        console.log('PDF rendering was cancelled');
        return;
      }
      console.error("Error rendering page:", err);
      setError(`Error rendering page: ${err.message || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    loadPDF();
    
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfData]);

  useEffect(() => {
    if (pdfDocument) {
      renderPage();
    }
  }, [pdfDocument, currentPage, zoom, rotation]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signingMode || !onFieldClick || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Find the field that was clicked
    const clickedField = fields.find(field => {
      if (field.page !== currentPage) return false;
      const fieldRight = field.x + field.width;
      const fieldBottom = field.y + field.height;
      return x >= field.x && x <= fieldRight && y >= field.y && y <= fieldBottom;
    });

    if (clickedField) {
      onFieldClick(clickedField);
    }
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
          border: signingMode ? '2px solid #3b82f6' : '2px dashed #6b7280',
          backgroundColor: signingMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          cursor: signingMode ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: signingMode ? '#1e40af' : '#374151',
          fontWeight: '500',
          pointerEvents: signingMode ? 'auto' : 'none',
          transition: 'all 0.2s ease',
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
            onClick={() => signingMode && onFieldClick && onFieldClick(field)}
            className={signingMode ? 'hover:bg-blue-200 hover:border-blue-400' : ''}
            title={field.label || field.type}
          >
            {getFieldContent()}
          </div>
        );
      });
  };

  const handleRetry = () => {
    setError(null);
    loadPDF();
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            disabled={zoom <= 0.5 || isLoading}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            disabled={zoom >= 3 || isLoading}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRotation((rotation + 90) % 360)}
            disabled={isLoading}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div 
        ref={containerRef}
        className="relative overflow-auto bg-gray-100 flex justify-center items-center min-h-96"
        style={{ height: '600px' }}
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
              cursor: signingMode ? 'crosshair' : 'default'
            }}
            className="shadow-lg bg-white"
          />
          {renderFields()}
        </div>
      </div>
    </div>
  );
};
