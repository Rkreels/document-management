
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Send, Download, Edit, CheckCircle, Clock, Users } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentField } from '@/contexts/DocumentContext';
import { PDFViewer } from '@/components/PDFViewer';
import { SignaturePad } from '@/components/SignaturePad';
import { TextFieldInput } from '@/components/TextFieldInput';
import { VoiceAssistant } from '@/components/VoiceAssistant';

const DocumentPreview = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const { documents, updateDocument } = useDocument();
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [selectedField, setSelectedField] = useState<DocumentField | null>(null);
  const [signingMode, setSigningMode] = useState(false);
  const [currentFieldType, setCurrentFieldType] = useState<'signature' | 'text' | 'date' | 'checkbox'>('signature');

  const document = documents.find(doc => doc.id === documentId);

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      if (!document) {
        speak("Document not found. Let me take you back to the dashboard.", 'high');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      if (signingMode) {
        speak("You're now in signing mode. Click on any field to fill it out. I'll guide you through each step.", 'normal');
      } else {
        speak(`Viewing ${document.title}. This document has ${document.fields.length} fields and ${document.signers.length} signers. You can edit the document, send it for signing, or switch to signing mode to test the signing experience.`, 'normal');
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop, document, signingMode, navigate]);

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Document Not Found</h2>
            <p className="text-gray-600 mb-4">The document you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFieldClick = (field: DocumentField) => {
    if (!signingMode) return;

    setSelectedField(field);
    setCurrentFieldType(field.type as 'signature' | 'text' | 'date' | 'checkbox');

    if (field.type === 'signature') {
      speak("Let's add your signature here. Use your mouse or finger to sign in the signature pad.", 'high');
      setShowSignaturePad(true);
    } else if (field.type === 'text' || field.type === 'date') {
      speak(`Please enter the ${field.type === 'date' ? 'date' : 'text'} for this field.`, 'normal');
      setShowTextInput(true);
    } else if (field.type === 'checkbox') {
      // Convert to string since DocumentField.value is string type
      const newValue = field.value === 'true' ? 'false' : 'true';
      updateDocument(document.id, {
        fields: document.fields.map(f => 
          f.id === field.id ? { ...f, value: newValue } : f
        )
      });
      speak(newValue === 'true' ? "Checkbox checked!" : "Checkbox unchecked!", 'normal');
    }
  };

  const handleSignatureSave = (signatureData: string) => {
    if (selectedField) {
      updateDocument(document.id, {
        fields: document.fields.map(f => 
          f.id === selectedField.id ? { ...f, value: signatureData } : f
        )
      });
      speak("Signature saved successfully! Great job!", 'high');
    }
    setShowSignaturePad(false);
    setSelectedField(null);
  };

  const handleTextSave = (value: string) => {
    if (selectedField) {
      updateDocument(document.id, {
        fields: document.fields.map(f => 
          f.id === selectedField.id ? { ...f, value } : f
        )
      });
      speak("Text saved successfully!", 'normal');
    }
    setShowTextInput(false);
    setSelectedField(null);
  };

  const handleCancel = () => {
    setShowSignaturePad(false);
    setShowTextInput(false);
    setSelectedField(null);
    speak("Operation cancelled. You can click on another field to continue.", 'normal');
  };

  const handleSendDocument = () => {
    updateDocument(document.id, { 
      status: 'sent',
      updatedAt: new Date()
    });
    speak("Document sent for signing! The signers will receive an email with the signing link.", 'high');
  };

  const handleEditDocument = () => {
    speak("Taking you to the document editor where you can modify fields and signers.", 'normal');
    setTimeout(() => navigate(`/editor/${documentId}`), 1000);
  };

  const getCompletionPercentage = () => {
    if (document.fields.length === 0) return 0;
    const completedFields = document.fields.filter(field => field.value).length;
    return Math.round((completedFields / document.fields.length) * 100);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const, icon: Edit },
      sent: { label: 'Sent', variant: 'default' as const, icon: Clock },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
      declined: { label: 'Declined', variant: 'destructive' as const, icon: Clock },
    };
    
    const config = statusConfig[document.status];
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{document.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge()}
                <span className="text-sm text-gray-600">
                  Last updated {document.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSigningMode(!signingMode)}>
              {signingMode ? 'Exit Signing Mode' : 'Test Signing'}
            </Button>
            {!signingMode && (
              <>
                <Button variant="outline" onClick={handleEditDocument}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {document.status === 'draft' && (
                  <Button onClick={handleSendDocument}>
                    <Send className="h-4 w-4 mr-2" />
                    Send for Signing
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Document Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Signers</p>
                  <p className="text-lg font-semibold">{document.signers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Fields</p>
                  <p className="text-lg font-semibold">{document.fields.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={getCompletionPercentage()} className="flex-1" />
                  <span className="text-sm font-medium">{getCompletionPercentage()}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold capitalize">{document.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {signingMode && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Signing Mode Active</span>
              </div>
              <p className="text-blue-700 mt-1">Click on any field in the document to fill it out.</p>
            </CardContent>
          </Card>
        )}

        {/* PDF Viewer */}
        <Card>
          <CardContent className="p-0">
            <PDFViewer
              pdfData={document.content}
              fields={document.fields}
              onFieldClick={handleFieldClick}
              signingMode={signingMode}
            />
          </CardContent>
        </Card>

        {/* Signers List */}
        {document.signers.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Signers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.signers.map((signer) => (
                  <div key={signer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{signer.name}</p>
                      <p className="text-sm text-gray-600">{signer.email}</p>
                    </div>
                    <Badge variant="secondary">
                      {signer.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      {showSignaturePad && selectedField && (
        <SignaturePad
          onSave={handleSignatureSave}
          onCancel={handleCancel}
        />
      )}

      {showTextInput && selectedField && (
        <TextFieldInput
          fieldType={currentFieldType === 'date' ? 'date' : 'text'}
          currentValue={selectedField.value as string || ''}
          onSave={handleTextSave}
          onCancel={handleCancel}
        />
      )}
      
      <VoiceAssistant />
    </div>
  );
};

export default DocumentPreview;
