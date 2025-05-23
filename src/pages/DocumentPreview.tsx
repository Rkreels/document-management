
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Send, Edit, Download, Users, Plus, FileCheck, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { SignaturePad } from '@/components/SignaturePad';
import { TextFieldInput } from '@/components/TextFieldInput';
import { PDFViewer } from '@/components/PDFViewer';
import { toast } from '@/hooks/use-toast';

const DocumentPreview = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { speak, stop } = useVoice();
  const { documents, setCurrentDocument, updateDocument, updateField, addSigner } = useDocument();
  
  const [document, setDocument] = useState(documents.find(d => d.id === documentId));
  const [isSigningMode, setIsSigningMode] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [fieldInputType, setFieldInputType] = useState<'signature' | 'text' | 'date' | null>(null);
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [newSignerName, setNewSignerName] = useState('');

  useEffect(() => {
    const updatedDoc = documents.find(d => d.id === documentId);
    if (updatedDoc) {
      setDocument(updatedDoc);
    }
  }, [documents, documentId]);

  useEffect(() => {
    stop();
    
    if (!document) {
      speak("Document not found. Let me take you back to the dashboard.", 'high');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }

    setCurrentDocument(document);
    
    if (document.status === 'draft') {
      speak(`Previewing "${document.title}". This document has ${document.fields.length} fields and ${document.signers.length} signers. You can add more signers, test the signing experience, or send it for signatures. What would you like to do?`, 'normal');
    } else {
      speak(`Viewing "${document.title}". This document is currently ${document.status}. You can review the signatures and download the completed document.`, 'normal');
    }

    return () => stop();
  }, [document, speak, stop, navigate, setCurrentDocument]);

  const handleAddSigner = () => {
    if (!newSignerEmail.trim() || !newSignerName.trim()) {
      speak("Please enter both the signer's name and email address.", 'high');
      return;
    }

    addSigner({
      name: newSignerName,
      email: newSignerEmail,
      role: 'signer',
      status: 'pending'
    });

    setNewSignerEmail('');
    setNewSignerName('');
    
    speak(`${newSignerName} has been added as a signer. They'll receive the document at ${newSignerEmail} when you send it.`, 'normal');
    
    toast({
      title: "Signer added",
      description: `${newSignerName} has been added to the document`
    });
  };

  const handleTestSigning = () => {
    if (document?.fields.length === 0) {
      speak("This document doesn't have any signature fields yet. You'll need to add some fields before testing the signing experience.", 'high');
      return;
    }

    setIsSigningMode(true);
    speak("Entering test signing mode. This is how your signers will experience the document. Click on any signature field to sign it, or fill in text fields as needed.", 'normal');
  };

  const handleFieldClick = (fieldId: string) => {
    if (!isSigningMode) return;
    
    const field = document?.fields.find(f => f.id === fieldId);
    if (!field) return;

    setSelectedFieldId(fieldId);
    setFieldInputType(field.type);
    
    if (field.type === 'signature') {
      speak("Opening signature pad. Draw your signature and click 'Save' when you're done.", 'normal');
    } else if (field.type === 'text') {
      speak("Enter your text in the field and click 'Save' when finished.", 'normal');
    } else if (field.type === 'date') {
      speak("Select or enter a date for this field.", 'normal');
    } else if (field.type === 'checkbox') {
      // Toggle checkbox immediately
      updateField(fieldId, { value: field.value ? '' : 'checked' });
      speak(field.value ? "Checkbox unchecked." : "Checkbox checked.", 'normal');
    }
  };

  const handleSendDocument = () => {
    if (!document) return;

    if (document.signers.length === 0) {
      speak("You need to add at least one signer before sending the document. Use the 'Add Signer' section below.", 'high');
      return;
    }

    updateDocument(document.id, { status: 'sent' });
    speak("Document sent successfully! In a real DocuSign system, email notifications would be sent to all signers. For this demo, the document status has been updated to 'sent'.", 'high');
    
    toast({
      title: "Document sent",
      description: "All signers have been notified"
    });
  };

  const handleDownload = () => {
    if (!document) return;
    
    // Create a blob with document data
    const docData = {
      title: document.title,
      fields: document.fields,
      signers: document.signers,
      status: document.status,
      completedAt: document.completedAt
    };
    
    const blob = new Blob([JSON.stringify(docData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9]/gi, '_')}_completed.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    speak("Document downloaded successfully! In a real system, this would be a completed PDF with all signatures.", 'normal');
    
    toast({
      title: "Document downloaded",
      description: "Completed document saved to your device"
    });
  };

  const getCompletionProgress = () => {
    if (!document || document.fields.length === 0) return 0;
    const completedFields = document.fields.filter(field => field.value && field.value.trim()).length;
    return Math.round((completedFields / document.fields.length) * 100);
  };

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Document not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{document.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={document.status === 'completed' ? 'default' : 'secondary'}>
                  {document.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  {document.fields.length} fields • {document.signers.length} signers
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/editor/${document.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {document.status === 'draft' && (
              <>
                <Button variant="outline" onClick={handleTestSigning}>
                  Test Signing
                </Button>
                <Button onClick={handleSendDocument}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Document
                </Button>
              </>
            )}
            {(document.status === 'completed' || isSigningMode) && (
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Document Preview */}
          <div className="lg:col-span-8">
            <PDFViewer
              pdfData={document.content}
              fields={document.fields}
              onFieldClick={handleFieldClick}
              isSigningMode={isSigningMode}
              selectedFieldId={selectedFieldId}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Progress */}
            {isSigningMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Completion Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={getCompletionProgress()} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    {getCompletionProgress()}% complete ({document.fields.filter(f => f.value).length} of {document.fields.length} fields)
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Signers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Signers ({document.signers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {document.signers.map((signer) => (
                    <div key={signer.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{signer.name}</div>
                        <div className="text-xs text-gray-600">{signer.email}</div>
                      </div>
                      <Badge variant={signer.status === 'signed' ? 'default' : 'secondary'}>
                        {signer.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {document.status === 'draft' && (
                    <div className="space-y-2 pt-2 border-t">
                      <Input
                        placeholder="Signer name"
                        value={newSignerName}
                        onChange={(e) => setNewSignerName(e.target.value)}
                      />
                      <Input
                        placeholder="Signer email"
                        type="email"
                        value={newSignerEmail}
                        onChange={(e) => setNewSignerEmail(e.target.value)}
                      />
                      <Button onClick={handleAddSigner} size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Signer
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Document Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span>{document.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last modified:</span>
                  <span>{document.updatedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline">{document.status}</Badge>
                </div>
                {document.completedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed:</span>
                    <span>{document.completedAt.toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {selectedFieldId && fieldInputType === 'signature' && (
        <SignaturePad
          onSave={(signature) => {
            updateField(selectedFieldId, { value: signature });
            setSelectedFieldId(null);
            setFieldInputType(null);
            speak("Signature saved successfully! You can continue signing other fields or finish the document.", 'normal');
          }}
          onCancel={() => {
            setSelectedFieldId(null);
            setFieldInputType(null);
          }}
        />
      )}

      {/* Text/Date Input Modal */}
      {selectedFieldId && (fieldInputType === 'text' || fieldInputType === 'date') && (
        <TextFieldInput
          fieldType={fieldInputType}
          currentValue={document.fields.find(f => f.id === selectedFieldId)?.value || ''}
          onSave={(value) => {
            updateField(selectedFieldId, { value });
            setSelectedFieldId(null);
            setFieldInputType(null);
            speak(`${fieldInputType} field saved successfully!`, 'normal');
          }}
          onCancel={() => {
            setSelectedFieldId(null);
            setFieldInputType(null);
          }}
        />
      )}
      
      <VoiceAssistant />
    </div>
  );
};

export default DocumentPreview;
