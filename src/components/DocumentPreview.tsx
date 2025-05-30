
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, Download, Edit, CheckCircle, Clock, Users, FileText, Share, Eye, History, MessageSquare, Shield, Settings } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentField } from '@/contexts/DocumentContext';
import { PDFViewer } from '@/components/PDFViewer';
import { SignaturePad } from '@/components/SignaturePad';
import { TextFieldInput } from '@/components/TextFieldInput';
import { DocumentSender } from '@/components/DocumentSender';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { DocumentHistory } from '@/components/DocumentHistory';
import { DocumentComments } from '@/components/DocumentComments';
import { DocumentSecurity } from '@/components/DocumentSecurity';

const DocumentPreview = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { speak, stop, announcePageChange, announceError } = useVoice();
  const { documents, updateDocument, currentDocument, setCurrentDocument } = useDocument();
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showSender, setShowSender] = useState(false);
  const [selectedField, setSelectedField] = useState<DocumentField | null>(null);
  const [signingMode, setSigningMode] = useState(false);
  const [currentFieldType, setCurrentFieldType] = useState<'signature' | 'text' | 'date' | 'checkbox'>('signature');
  const [activeTab, setActiveTab] = useState('preview');

  const document = documents.find(doc => doc.id === documentId) || currentDocument;

  useEffect(() => {
    stop();
    
    if (documentId && !document) {
      announceError('Document not found', 'The requested document could not be loaded. Redirecting to dashboard.');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }

    if (document) {
      setCurrentDocument(document);
      announcePageChange(
        'Document Preview',
        `Viewing ${document.title}. This document has ${document.fields.length} fields and ${document.signers.length} signers. Use the tabs to access different features like sending, history, and security settings.`
      );
    }
  }, [documentId, document, navigate, announcePageChange, announceError, stop, setCurrentDocument]);

  const handleFieldClick = (field: DocumentField) => {
    if (!signingMode || !document) return;

    setSelectedField(field);
    setCurrentFieldType(field.type as 'signature' | 'text' | 'date' | 'checkbox');

    if (field.type === 'signature') {
      speak('Opening signature pad. Draw your signature using your mouse or touch input.', 'high');
      setShowSignaturePad(true);
    } else if (field.type === 'text' || field.type === 'date') {
      speak(`Please enter the ${field.type === 'date' ? 'date' : 'text'} for this field.`, 'normal');
      setShowTextInput(true);
    } else if (field.type === 'checkbox') {
      const newValue = field.value === 'true' ? 'false' : 'true';
      updateDocument(document.id, {
        fields: document.fields.map(f => 
          f.id === field.id ? { ...f, value: newValue } : f
        )
      });
      speak(newValue === 'true' ? 'Checkbox checked' : 'Checkbox unchecked', 'normal');
    }
  };

  const handleSignatureSave = (signatureData: string) => {
    if (selectedField && document) {
      updateDocument(document.id, {
        fields: document.fields.map(f => 
          f.id === selectedField.id ? { ...f, value: signatureData } : f
        )
      });
      speak('Signature saved successfully', 'high');
    }
    setShowSignaturePad(false);
    setSelectedField(null);
  };

  const handleTextSave = (value: string) => {
    if (selectedField && document) {
      updateDocument(document.id, {
        fields: document.fields.map(f => 
          f.id === selectedField.id ? { ...f, value } : f
        )
      });
      speak('Text field updated successfully', 'normal');
    }
    setShowTextInput(false);
    setSelectedField(null);
  };

  const handleCancel = () => {
    setShowSignaturePad(false);
    setShowTextInput(false);
    setSelectedField(null);
    speak('Operation cancelled', 'normal');
  };

  const getCompletionPercentage = () => {
    if (!document || document.fields.length === 0) return 0;
    const completedFields = document.fields.filter(field => field.value).length;
    return Math.round((completedFields / document.fields.length) * 100);
  };

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
                <Badge variant="outline">{document.status}</Badge>
                <span className="text-sm text-gray-600">
                  Last updated {new Date(document.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSigningMode(!signingMode)}>
              {signingMode ? 'Exit Signing Mode' : 'Test Signing'}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/editor/${documentId}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {document.status === 'draft' && (
              <Button onClick={() => setShowSender(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send for Signing
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
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

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="preview">
              <FileText className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="signers">
              <Users className="h-4 w-4 mr-2" />
              Signers
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="send">
              <Send className="h-4 w-4 mr-2" />
              Send
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview">
            <Card>
              <CardContent className="p-0">
                {document.content ? (
                  <UniversalFileViewer
                    fileData={document.content}
                    fileName={document.title}
                    mimeType="application/pdf"
                    fields={document.fields}
                    onFieldClick={handleFieldClick}
                    signingMode={signingMode}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-600">No file content available for this document.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signers">
            <Card>
              <CardHeader>
                <CardTitle>Signers Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {document.signers.map((signer) => (
                    <div key={signer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{signer.name}</p>
                        <p className="text-sm text-gray-600">{signer.email}</p>
                        {signer.signedAt && (
                          <p className="text-xs text-green-600">
                            Signed on {new Date(signer.signedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          signer.status === 'signed' ? 'default' : 
                          signer.status === 'declined' ? 'destructive' : 'secondary'
                        }>
                          {signer.status}
                        </Badge>
                        <Badge variant="outline">
                          {signer.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <DocumentHistory document={document} />
          </TabsContent>

          <TabsContent value="comments">
            <DocumentComments document={document} />
          </TabsContent>

          <TabsContent value="security">
            <DocumentSecurity document={document} />
          </TabsContent>

          <TabsContent value="send">
            <DocumentSender
              document={document}
              onSent={() => {
                setActiveTab('preview');
                speak('Document sent successfully! All signers will receive email notifications.', 'high');
              }}
            />
          </TabsContent>
        </Tabs>
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
