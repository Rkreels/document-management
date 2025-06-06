
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, User, FileText, Send, AlertCircle, HelpCircle } from 'lucide-react';
import { useDocument, Document, DocumentField, Signer } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import { UniversalFileViewer } from './UniversalFileViewer';
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
  const { 
    speak, 
    announceFieldFocus, 
    announceFieldComplete, 
    announceProgress, 
    announceSuccess, 
    announceError,
    announceWorkflowStep,
    settings 
  } = useVoice();
  
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [hasAnnounced, setHasAnnounced] = useState(false);

  const signerFields = document.fields.filter(field => 
    field.signerId === currentSigner.id || !field.signerId
  );

  const requiredFields = signerFields.filter(field => field.required);
  const completedFields = requiredFields.filter(field => 
    fieldValues[field.id] || (typeof field.value === 'string' && field.value)
  );

  useEffect(() => {
    // Initialize field values from document
    const initialValues: Record<string, string> = {};
    document.fields.forEach(field => {
      if (typeof field.value === 'string') {
        initialValues[field.id] = field.value;
      }
    });
    setFieldValues(initialValues);
  }, [document.fields]);

  useEffect(() => {
    if (!hasAnnounced && settings.enabled) {
      const totalFields = requiredFields.length;
      const completedCount = completedFields.length;
      
      // Initial announcement
      setTimeout(() => {
        speak(`Welcome to the document signing interface for ${document.title}. You have ${totalFields} required fields to complete. ${completedCount} fields are already completed.`, 'high');
        
        if (totalFields > 0 && completedCount < totalFields) {
          setTimeout(() => {
            announceWorkflowStep(
              'Field Navigation',
              'Click on highlighted fields in the document to fill them out. Use Tab to navigate between fields, or use the arrow keys for field-by-field guidance.'
            );
          }, 3000);
        }
        
        setHasAnnounced(true);
      }, 1000);
    }
  }, [hasAnnounced, settings.enabled, document.title, requiredFields.length, completedFields.length]);

  useEffect(() => {
    // Announce progress when completion status changes
    if (hasAnnounced) {
      announceProgress(completedFields.length, requiredFields.length, 'Document signing');
    }
  }, [completedFields.length, requiredFields.length, hasAnnounced]);

  const handleFieldComplete = (fieldId: string, value: string) => {
    const field = document.fields.find(f => f.id === fieldId);
    if (!field) return;

    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    
    // Update document field
    updateDocument(document.id, {
      fields: document.fields.map(f =>
        f.id === fieldId ? { ...f, value } : f
      )
    });

    // Voice feedback for field completion
    announceFieldComplete(field.type, field.type === 'signature' ? undefined : value);

    // Move to next field
    if (currentFieldIndex < signerFields.length - 1) {
      const nextIndex = currentFieldIndex + 1;
      setCurrentFieldIndex(nextIndex);
      
      // Announce next field
      setTimeout(() => {
        const nextField = signerFields[nextIndex];
        if (nextField) {
          announceFieldFocus(nextField.type, nextField.label, nextField.required);
        }
      }, 1000);
    } else {
      // All fields completed
      setTimeout(() => {
        speak('All fields completed! You can now sign the document.', 'high');
      }, 1000);
    }

    setShowSignaturePad(false);
    setShowTextInput(false);
  };

  const handleSignDocument = () => {
    announceWorkflowStep('Final Signing', 'Processing your document signature...');
    
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
      announceSuccess('Document fully executed', 'All parties have signed the document successfully.');
    } else {
      announceSuccess('Your signature completed', 'The document will be sent to the next signer in sequence.');
    }

    onComplete();
  };

  const handleFieldClick = (field: DocumentField) => {
    if (field.signerId !== currentSigner.id && field.signerId) {
      announceError('Access denied', 'This field is assigned to another signer and cannot be modified.');
      return;
    }

    // Announce field interaction
    announceFieldFocus(field.type, field.label, field.required);
    
    if (field.type === 'signature') {
      setTimeout(() => {
        speak('Opening signature pad. Use your mouse, finger, or stylus to create your signature. Press Save when complete, or Cancel to close.', 'normal');
      }, 500);
      setShowSignaturePad(true);
    } else if (field.type === 'text' || field.type === 'date') {
      setTimeout(() => {
        const inputType = field.type === 'date' ? 'date picker' : 'text input';
        speak(`Opening ${inputType}. Enter your ${field.label || field.type} and press Save to confirm.`, 'normal');
      }, 500);
      setShowTextInput(true);
    } else if (field.type === 'checkbox') {
      const newValue = field.value === 'true' ? 'false' : 'true';
      handleFieldComplete(field.id, newValue);
    }
  };

  const canSign = completedFields.length === requiredFields.length;
  const progressPercentage = (completedFields.length / Math.max(requiredFields.length, 1)) * 100;
  const currentField = signerFields[currentFieldIndex];

  return (
    <div className="space-y-6" tabIndex={0}>
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

            {settings.enabled && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <HelpCircle className="h-4 w-4" />
                <span>Voice guidance active. Press Ctrl+H for help, Tab to navigate fields.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Field Instructions */}
      {currentField && !canSign && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Current: {currentField.label || currentField.type}</span>
              {currentField.required && <Badge variant="outline" className="text-xs">Required</Badge>}
            </div>
            <p className="text-blue-700 text-sm mt-1">
              {currentField.tooltip || `Click on the highlighted ${currentField.type} field in the document to continue.`}
            </p>
            {currentField.validation && (
              <p className="text-blue-600 text-xs mt-1">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {currentField.validation.message || 'Please ensure the format is correct.'}
              </p>
            )}
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
              <Button 
                onClick={handleSignDocument} 
                className="bg-green-600 hover:bg-green-700"
                onFocus={() => speak('Sign document button focused. Press Enter or Space to sign the document.', 'normal')}
              >
                <Send className="h-4 w-4 mr-2" />
                Sign Document
              </Button>
            </div>
            <p className="text-green-700 text-sm mt-1">
              All required fields have been completed. Click to finalize your signature on this document.
            </p>
          </CardContent>
        </Card>
      )}

      {/* PDF Viewer */}
      <Card>
        <CardContent className="p-0">
          <UniversalFileViewer
            fileData={document.content}
            fileName={document.title}
            mimeType="application/pdf"
            fields={document.fields}
            onFieldClick={handleFieldClick}
            signingMode={true}
            viewMode="signing"
          />
        </CardContent>
      </Card>

      {/* Modals */}
      {showSignaturePad && currentField && (
        <SignaturePad
          onSave={(signature) => handleFieldComplete(currentField.id, signature)}
          onCancel={() => {
            setShowSignaturePad(false);
            speak('Signature cancelled. You can try again or move to the next field.', 'normal');
          }}
        />
      )}

      {showTextInput && currentField && (
        <TextFieldInput
          fieldType={currentField.type === 'date' ? 'date' : 'text'}
          currentValue={fieldValues[currentField.id] || ''}
          onSave={(value) => handleFieldComplete(currentField.id, value)}
          onCancel={() => {
            setShowTextInput(false);
            speak('Input cancelled. You can try again or move to the next field.', 'normal');
          }}
        />
      )}
    </div>
  );
};
