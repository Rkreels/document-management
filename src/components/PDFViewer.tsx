import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { DocumentField } from '@/contexts/DocumentContext';

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
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPDF = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // PDF.js setup
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        // Decode base64
        const decodedPdfData = atob(pdfData);

        // Convert decoded data to Uint8Array
        const uint8Array = new Uint8Array(decodedPdfData.length);
        for (let i = 0; i < decodedPdfData.length; i++) {
          uint8Array[i] = decodedPdfData.charCodeAt(i);
        }

        const pdf = await pdfjsLib.getDocument(uint8Array).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: zoom });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
      } catch (err: any) {
        console.error("Error rendering PDF:", err);
        setError(`Error rendering PDF: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (pdfData) {
      renderPDF();
    }
  }, [pdfData, zoom, rotation]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signingMode || !onFieldClick || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Find the field that was clicked
    const clickedField = fields.find(field => {
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

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return fields.map(field => {
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
        transition: 'all 0.2s ease'
      };

      const getFieldContent = () => {
        if (field.value) {
          if (field.type === 'signature') {
            return '✓ Signed';
          } else if (field.type === 'checkbox') {
            return field.value ? '☑' : '☐';
          } else {
            return field.value.toString().substring(0, 20) + (field.value.toString().length > 20 ? '...' : '');
          }
        }
        return field.type.charAt(0).toUpperCase() + field.type.slice(1);
      };

      return (
        <div
          key={field.id}
          style={style}
          onClick={() => signingMode && onFieldClick && onFieldClick(field)}
          className={signingMode ? 'hover:bg-blue-200 hover:border-blue-400' : ''}
        >
          {getFieldContent()}
        </div>
      );
    });
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
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
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            disabled={zoom >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRotation((rotation + 90) % 360)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
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
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
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
