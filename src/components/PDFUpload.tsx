
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFUploadProps {
  onPDFUpload: (base64Data: string, fileName: string) => void;
  className?: string;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onPDFUpload, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'Please select a PDF file smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Remove the data URL prefix to get just the base64 data
          const base64Data = result.split(',')[1];
          onPDFUpload(base64Data, file.name);
          toast({
            title: 'PDF Uploaded Successfully',
            description: `${file.name} has been uploaded and is ready for editing.`,
          });
        }
      };

      reader.onerror = () => {
        toast({
          title: 'Upload Failed',
          description: 'There was an error reading the PDF file. Please try again.',
          variant: 'destructive',
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading the PDF file. Please try again.',
        variant: 'destructive',
      });
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      await processFile(pdfFile);
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please drop a PDF file.',
        variant: 'destructive',
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload PDF Document</h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your PDF file here, or click to browse
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>PDF files up to 10MB</span>
              </div>
            </div>
            <Button variant="outline" className="mt-2">
              Choose File
            </Button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Supported formats:</p>
            <p>PDF files only. Maximum file size: 10MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
