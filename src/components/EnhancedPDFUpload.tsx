
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedPDFUploadProps {
  onPDFUpload: (base64Data: string, fileName: string, fileInfo: FileInfo) => void;
  maxSizeMB?: number;
  className?: string;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  pages?: number;
}

export const EnhancedPDFUpload: React.FC<EnhancedPDFUploadProps> = ({ 
  onPDFUpload, 
  maxSizeMB = 25,
  className 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Please select a PDF file only.';
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    // Check if file is not empty
    if (file.size === 0) {
      return 'The selected file is empty.';
    }

    return null;
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'Invalid File',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          if (result) {
            // Remove the data URL prefix to get just the base64 data
            const base64Data = result.split(',')[1];
            
            // Create file info object
            const fileInfo: FileInfo = {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
            };

            // Try to get page count using PDF.js
            try {
              const pdfjsLib = await import('pdfjs-dist');
              const pdfData = atob(base64Data);
              const uint8Array = new Uint8Array(pdfData.length);
              for (let i = 0; i < pdfData.length; i++) {
                uint8Array[i] = pdfData.charCodeAt(i);
              }
              
              const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
              fileInfo.pages = pdf.numPages;
            } catch (error) {
              console.warn('Could not determine page count:', error);
            }

            clearInterval(progressInterval);
            setUploadProgress(100);
            
            setTimeout(() => {
              onPDFUpload(base64Data, file.name, fileInfo);
              
              toast({
                title: 'PDF Uploaded Successfully',
                description: `${file.name} has been processed and is ready for editing.${fileInfo.pages ? ` Contains ${fileInfo.pages} pages.` : ''}`,
              });
              
              setIsUploading(false);
              setUploadProgress(0);
            }, 500);
          }
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      };

      reader.onerror = () => {
        clearInterval(progressInterval);
        throw new Error('Failed to read the PDF file.');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'There was an error uploading the PDF file.',
        variant: 'destructive',
      });
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    
    const files = Array.from(event.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      await processFile(pdfFile);
    } else if (files.length > 0) {
      toast({
        title: 'Invalid File Type',
        description: 'Please drop a PDF file only.',
        variant: 'destructive',
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
            ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'pointer-events-none opacity-75' : ''}
          `}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`p-3 rounded-full ${dragActive ? 'bg-blue-100' : 'bg-blue-50'}`}>
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              ) : (
                <Upload className="h-8 w-8 text-blue-600" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isUploading ? 'Processing PDF...' : 'Upload PDF Document'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isUploading 
                  ? 'Please wait while we process your document'
                  : 'Drag and drop your PDF file here, or click to browse'
                }
              </p>
              
              {isUploading && (
                <div className="mb-4">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-500 mt-1">{uploadProgress}% complete</p>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>PDF files up to {maxSizeMB}MB</span>
              </div>
            </div>
            
            {!isUploading && (
              <Button variant="outline" className="mt-2">
                Choose File
              </Button>
            )}
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="mt-4">
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Supported formats & requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>PDF files only (max {maxSizeMB}MB)</li>
                <li>Password-protected PDFs are not supported</li>
                <li>Fillable forms will be preserved</li>
                <li>All text content will be searchable</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
            <CheckCircle className="h-3 w-3" />
            <span>Your documents are processed securely and never stored permanently</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
