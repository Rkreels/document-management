
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, Image, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedPDFUploadProps {
  onFileUpload: (base64Data: string, fileName: string, mimeType: string) => void;
  className?: string;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

export const EnhancedPDFUpload: React.FC<EnhancedPDFUploadProps> = ({ 
  onFileUpload, 
  className,
  acceptedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  maxSizeMB = 5
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getSupportedMimeTypes = () => {
    const mimeTypeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'html': 'text/html',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };

    return acceptedTypes.map(type => mimeTypeMap[type]).filter(Boolean);
  };

  const getAcceptAttribute = () => {
    const extensions = acceptedTypes.map(type => `.${type}`).join(',');
    const mimeTypes = getSupportedMimeTypes().join(',');
    return `${extensions},${mimeTypes}`;
  };

  const validateFile = (file: File): string | null => {
    const extension = file.name.toLowerCase().split('.').pop() || '';
    
    // Check file type
    if (!acceptedTypes.includes(extension)) {
      return `Unsupported file type: .${extension}. Supported types: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
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

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const base64Data = result.split(',')[1];
          onFileUpload(base64Data, file.name, file.type);
          toast({
            title: 'File Uploaded Successfully',
            description: `${file.name} has been uploaded and is ready for editing.`,
          });
        }
      };

      reader.onerror = () => {
        toast({
          title: 'Upload Failed',
          description: 'There was an error reading the file. Please try again.',
          variant: 'destructive',
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading the file. Please try again.',
        variant: 'destructive',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (files.length > 1) {
      toast({
        title: 'Multiple Files',
        description: 'Please drop only one file at a time.',
        variant: 'destructive',
      });
      return;
    }

    const file = files[0];
    if (file) {
      await processFile(file);
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Document</h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                {acceptedTypes.slice(0, 6).map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    .{type.toUpperCase()}
                  </Badge>
                ))}
                {acceptedTypes.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{acceptedTypes.length - 6} more
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Maximum file size: {maxSizeMB}MB
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
          accept={getAcceptAttribute()}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Supported file types:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span>PDFs, Word documents, Images, Text files</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-red-600" />
              <span>PDF Documents</span>
            </div>
            <div className="flex items-center gap-1">
              <Image className="h-3 w-3 text-blue-600" />
              <span>Images</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-blue-600" />
              <span>Word Docs</span>
            </div>
            <div className="flex items-center gap-1">
              <File className="h-3 w-3 text-gray-600" />
              <span>Text Files</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
