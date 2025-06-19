
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize } from 'lucide-react';

interface PDFControlsProps {
  zoom: number;
  currentPage: number;
  totalPages: number;
  onZoom: (direction: 'in' | 'out') => void;
  onPageChange: (direction: 'prev' | 'next') => void;
  onRotate: () => void;
  onDownload?: () => void;
  onMaximize?: () => void;
}

export const PDFControls: React.FC<PDFControlsProps> = ({
  zoom,
  currentPage,
  totalPages,
  onZoom,
  onPageChange,
  onRotate,
  onDownload,
  onMaximize
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-gray-50">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onZoom('out')} disabled={zoom <= 0.3}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="outline" size="sm" onClick={() => onZoom('in')} disabled={zoom >= 3}>
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
          onClick={() => onPageChange('prev')}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange('next')}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRotate}>
          <RotateCw className="h-4 w-4" />
        </Button>
        {onDownload && (
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
        )}
        {onMaximize && (
          <Button variant="outline" size="sm" onClick={onMaximize}>
            <Maximize className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
