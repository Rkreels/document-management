import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DocumentField, Document, Signer } from '@/contexts/DocumentContext';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface DataValidationProps {
  document?: Document;
  fields?: DocumentField[];
  signers?: Signer[];
  onValidationComplete?: (result: ValidationResult) => void;
}

export const DataValidation: React.FC<DataValidationProps> = ({
  document,
  fields = [],
  signers = [],
  onValidationComplete
}) => {
  const validateDocument = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Document validation
    if (document) {
      if (!document.title?.trim()) {
        errors.push('Document title is required');
      }
      if (document.title && document.title.length > 100) {
        warnings.push('Document title is very long (over 100 characters)');
      }
    }

    // Fields validation
    fields.forEach((field, index) => {
      if (!field.id) {
        errors.push(`Field ${index + 1}: Missing field ID`);
      }
      if (!field.type) {
        errors.push(`Field ${index + 1}: Field type is required`);
      }
      if (field.x < 0 || field.x > 100) {
        errors.push(`Field ${index + 1}: X position must be between 0-100%`);
      }
      if (field.y < 0 || field.y > 100) {
        errors.push(`Field ${index + 1}: Y position must be between 0-100%`);
      }
      if (field.width <= 0 || field.width > 50) {
        errors.push(`Field ${index + 1}: Width must be between 1-50%`);
      }
      if (field.height <= 0 || field.height > 20) {
        errors.push(`Field ${index + 1}: Height must be between 1-20%`);
      }
      if (field.signerId && !signers.find(s => s.id === field.signerId)) {
        errors.push(`Field ${index + 1}: Assigned to non-existent signer`);
      }
    });

    // Signers validation
    signers.forEach((signer, index) => {
      if (!signer.name?.trim()) {
        errors.push(`Signer ${index + 1}: Name is required`);
      }
      if (!signer.email?.trim()) {
        errors.push(`Signer ${index + 1}: Email is required`);
      }
      if (signer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signer.email)) {
        errors.push(`Signer ${index + 1}: Invalid email format`);
      }
    });

    // Check for overlapping fields
    for (let i = 0; i < fields.length; i++) {
      for (let j = i + 1; j < fields.length; j++) {
        const field1 = fields[i];
        const field2 = fields[j];
        
        if (
          field1.x < field2.x + field2.width &&
          field1.x + field1.width > field2.x &&
          field1.y < field2.y + field2.height &&
          field1.y + field1.height > field2.y
        ) {
          warnings.push(`Fields overlap: ${field1.type} and ${field2.type}`);
        }
      }
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    onValidationComplete?.(result);
    return result;
  };

  const validation = validateDocument();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {validation.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          Validation Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validation.isValid && validation.warnings.length === 0 && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>All validations passed!</span>
          </div>
        )}

        {validation.errors.length > 0 && (
          <div className="space-y-2">
            <Badge variant="destructive" className="mb-2">
              {validation.errors.length} Error{validation.errors.length !== 1 ? 's' : ''}
            </Badge>
            {validation.errors.map((error, index) => (
              <div key={index} className="flex items-start gap-2 text-red-600">
                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            ))}
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="space-y-2">
            <Badge variant="outline" className="mb-2 border-yellow-400 text-yellow-700">
              {validation.warnings.length} Warning{validation.warnings.length !== 1 ? 's' : ''}
            </Badge>
            {validation.warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{warning}</span>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={validateDocument}
          variant="outline"
          className="w-full"
        >
          Re-validate
        </Button>
      </CardContent>
    </Card>
  );
};