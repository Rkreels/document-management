
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DocumentField } from '@/contexts/DocumentContext';

interface PDFViewerProps {
  pdfData: string;
  fields: DocumentField[];
  onFieldClick?: (fieldId: string) => void;
  selectedTool?: DocumentField['type'] | null;
  onCanvasClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  isSigningMode?: boolean;
  selectedFieldId?: string | null;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfData,
  fields,
  onFieldClick,
  selectedTool,
  onCanvasClick,
  isSigningMode = false,
  selectedFieldId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setContainerDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const isPDFValid = pdfData && pdfData.startsWith('data:application/pdf');

  if (!pdfData) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">No document loaded</h3>
            <p className="text-sm">Upload a PDF to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isPDFValid) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertDescription>
              Invalid PDF format. Please upload a valid PDF file.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-0 h-full relative">
        <div 
          ref={containerRef}
          className="relative h-full w-full overflow-hidden bg-gray-100 rounded-lg"
          onClick={onCanvasClick}
        >
          {/* PDF Display */}
          <iframe
            src={pdfData}
            className="w-full h-full border-0"
            title="PDF Document"
            style={{ pointerEvents: selectedTool ? 'none' : 'auto' }}
          />
          
          {/* Overlay for fields */}
          <div className="absolute inset-0 pointer-events-none">
            {fields.map((field) => (
              <div
                key={field.id}
                className={`absolute border-2 flex items-center justify-center text-xs font-medium cursor-pointer transition-all pointer-events-auto ${
                  isSigningMode 
                    ? 'border-green-500 bg-green-100 hover:bg-green-200' 
                    : 'border-blue-500 bg-blue-100 hover:bg-blue-200'
                } ${selectedFieldId === field.id ? 'ring-2 ring-blue-400' : ''} ${
                  field.value ? 'bg-opacity-80' : 'bg-opacity-50'
                }`}
                style={{
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  width: `${field.width}%`,
                  height: `${field.height}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onFieldClick?.(field.id);
                }}
                title={`${field.type} field${field.required ? ' (required)' : ''}`}
              >
                {field.value ? (
                  field.type === 'signature' ? (
                    <img src={field.value} alt="Signature" className="w-full h-full object-contain" />
                  ) : (
                    <span className="truncate px-1">{field.value}</span>
                  )
                ) : (
                  <span className="text-gray-600">
                    {field.type === 'signature' ? '✍️' : 
                     field.type === 'text' ? 'ABC' :
                     field.type === 'date' ? '📅' : '☑️'}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Tool selection indicator */}
          {selectedTool && (
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm pointer-events-none z-10">
              Click to place {selectedTool} field
            </div>
          )}
          
          {/* Signing mode indicator */}
          {isSigningMode && (
            <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm pointer-events-none z-10">
              Signing Mode - Click fields to complete them
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
