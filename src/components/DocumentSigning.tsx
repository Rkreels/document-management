
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, User, FileText, Send } from 'lucide-react';
import { useDocument, Document, DocumentField, Signer } from '@/contexts/DocumentContext';
import { PDFViewer } from './PDFViewer';
import { SignaturePad } from './SignaturePad';
import { TextFieldInput } from './TextFieldInput';

interface DocumentSigningProps {
  document: Document;
  currentSigner: Signer;
  onComplete: () => void;
}

export const DocumentSigning: React.FC<DocumentSigningProps> = ({
  document,
  currentSigner,
  onComplete
}) => {
  const { updateDocument, updateSigner } = useDocument();
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const signerFields = document.fields.filter(field => 
    field.signerId === currentSigner.id || !field.signerId
  );

  const requiredFields = signerFields.filter(field => field.required);
  const completedFields = requiredFields.filter(field => 
    fieldValues[field.id] || field.value
  );

  useEffect(() => {
    // Initialize field values from document
    const initialValues: Record<string, string> = {};
    document.fields.forEach(field => {
      if (field.value) {
        initialValues[field.id] = field.value;
      }
    });
    setFieldValues(initialValues);
  }, [document.fields]);

  const handleFieldComplete = (fieldId: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    
    // Update document field
    updateDocument(document.id, {
      fields: document.fields.map(field =>
        field.id === fieldId ? { ...field, value } : field
      )
    });

    // Move to next field
    if (currentFieldIndex < signerFields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    }

    setShowSignaturePad(false);
    setShowTextInput(false);
  };

  const handleSignDocument = () => {
    // Mark signer as signed
    updateSigner(currentSigner.id, {
      status: 'signed',
      signedAt: new Date()
    });

    // Check if all signers have signed
    const allSigned = document.signers.every(signer => 
      signer.status === 'signed' || signer.id === currentSigner.id
    );

    if (allSigned) {
      updateDocument(document.id, {
        status: 'completed',
        completedAt: new Date()
      });
    }

    onComplete();
  };

  const canSign = completedFields.length === requiredFields.length;
  const progressPercentage = (completedFields.length / Math.max(requiredFields.length, 1)) * 100;

  const currentField = signerFields[currentFieldIndex];

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Signing: {document.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium">{completedFields.length} of {requiredFields.length} required fields</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">Signing as: {currentSigner.name}</span>
              <Badge variant="outline">{currentSigner.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Field Instructions */}
      {currentField && !canSign && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Next: {currentField.label || currentField.type}</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Click on the highlighted field in the document to continue.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sign Button */}
      {canSign && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Ready to Sign</span>
              </div>
              <Button onClick={handleSignDocument} className="bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4 mr-2" />
                Sign Document
              </Button>
            </div>
            <p className="text-green-700 text-sm mt-1">
              All required fields have been completed. Click to sign the document.
            </p>
          </CardContent>
        </Card>
      )}

      {/* PDF Viewer */}
      <Card>
        <CardContent className="p-0">
          <PDFViewer
            pdfData={document.content}
            fields={document.fields}
            onFieldClick={(field) => {
              if (field.signerId !== currentSigner.id && field.signerId) return;
              
              if (field.type === 'signature') {
                setShowSignaturePad(true);
              } else if (field.type === 'text' || field.type === 'date') {
                setShowTextInput(true);
              } else if (field.type === 'checkbox') {
                const newValue = field.value === 'true' ? 'false' : 'true';
                handleFieldComplete(field.id, newValue);
              }
            }}
            signingMode={true}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      {showSignaturePad && currentField && (
        <SignaturePad
          onSave={(signature) => handleFieldComplete(currentField.id, signature)}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}

      {showTextInput && currentField && (
        <TextFieldInput
          fieldType={currentField.type === 'date' ? 'date' : 'text'}
          currentValue={fieldValues[currentField.id] || ''}
          onSave={(value) => handleFieldComplete(currentField.id, value)}
          onCancel={() => setShowTextInput(false)}
        />
      )}
    </div>
  );
};
