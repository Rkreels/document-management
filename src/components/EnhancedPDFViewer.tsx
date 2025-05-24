
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize, Grid, Move } from 'lucide-react';
import { DocumentField } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import * as pdfjsLib from 'pdfjs-dist';

const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface EnhancedPDFViewerProps {
  pdfData: string;
  fields: DocumentField[];
  onFieldClick?: (field: DocumentField) => void;
  onFieldMove?: (fieldId: string, x: number, y: number) => void;
  onFieldResize?: (fieldId: string, width: number, height: number) => void;
  signingMode?: boolean;
  editMode?: boolean;
}

export const EnhancedPDFViewer: React.FC<EnhancedPDFViewerProps> = ({
  pdfData,
  fields,
  onFieldClick,
  onFieldMove,
  onFieldResize,
  signingMode = false,
  editMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { speak, announceFieldFocus } = useVoice();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const renderPDF = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!pdfData) {
          setError('No PDF data available');
          return;
        }

        const decodedPdfData = atob(pdfData);
        const uint8Array = new Uint8Array(decodedPdfData.length);
        for (let i = 0; i < decodedPdfData.length; i++) {
          uint8Array[i] = decodedPdfData.charCodeAt(i);
        }

        const pdf = await pdfjsLib.getDocument(uint8Array).promise;
        setTotalPages(pdf.numPages);
        
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom, rotation });
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
        speak(`PDF rendered successfully. Page ${currentPage} of ${totalPages}`, 'low');
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
  }, [pdfData, zoom, rotation, currentPage, speak]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onFieldClick || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const clickedField = fields.find(field => {
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
    if (!canvasRef.current) return null;

    return fields.map(field => {
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
        userSelect: 'none'
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
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-1 rounded-bl">
              {field.type}
            </div>
          )}
        </div>
      );
    });
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom + 0.2);
    setZoom(newZoom);
    speak(`Zoom increased to ${Math.round(newZoom * 100)}%`, 'low');
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.3, zoom - 0.2);
    setZoom(newZoom);
    speak(`Zoom decreased to ${Math.round(newZoom * 100)}%`, 'low');
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
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.3}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
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
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
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
          <Button variant="outline" size="sm">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {(editMode || signingMode) && (
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

      {/* PDF Canvas Container */}
      <div 
        ref={containerRef}
        className="relative overflow-auto bg-gray-100 flex justify-center items-center min-h-96"
        style={{ height: '700px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
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
