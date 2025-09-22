
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Send, 
  Edit, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  History,
  MessageSquare,
  Shield,
  Eye,
  Download,
  Share,
  Settings
} from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentField } from '@/contexts/DocumentContext';
import { BulletproofDocumentViewer } from '@/components/BulletproofDocumentViewer';
import { SignaturePad } from '@/components/SignaturePad';
import { TextFieldInput } from '@/components/TextFieldInput';
import { DocumentSender } from '@/components/DocumentSender';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { DocumentHistory } from '@/components/DocumentHistory';
import { DocumentComments } from '@/components/DocumentComments';
import { DocumentSecurity } from '@/components/DocumentSecurity';
import { SmartVoiceGuide } from '@/components/SmartVoiceGuide';

const DocumentPreview = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { speak, stop, announcePageChange, announceError } = useVoice();
  const { documents, updateDocument, currentDocument, setCurrentDocument } = useDocument();
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
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

  const downloadDocument = () => {
    if (document?.content) {
      const dataUrl = `data:application/pdf;base64,${document.content}`;
      const link = window.document.createElement('a');
      link.href = dataUrl;
      link.download = `${document.title}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      speak('Document downloaded successfully', 'normal');
    }
  };

  if (!document) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
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
    <div className="min-h-screen gradient-hero">
      <SmartVoiceGuide />
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
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
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSigningMode(!signingMode)}>
              {signingMode ? 'Exit Signing Mode' : 'Test Signing'}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/editor/${documentId}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={downloadDocument}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            {document.status === 'draft' && (
              <Button onClick={() => setActiveTab('send')}>
                <Send className="h-4 w-4 mr-2" />
                Send for Signing
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Signers</p>
                  <p className="text-2xl font-bold">{document.signers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fields</p>
                  <p className="text-2xl font-bold">{document.fields.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Completion</p>
                <div className="flex items-center gap-2">
                  <Progress value={getCompletionPercentage()} className="flex-1" />
                  <span className="text-sm font-bold">{getCompletionPercentage()}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-bold capitalize">{document.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signing Mode Alert */}
        {signingMode && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Signing Mode Active</span>
              </div>
              <p className="text-blue-700 mt-1">Click on any field in the document to fill it out. This simulates the signing experience.</p>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger value="signers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Signers</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comments</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <BulletproofDocumentViewer
                  fileData={document.content || ''}
                  fileName={document.title}
                  mimeType="application/pdf"
                  fields={document.fields}
                  onFieldClick={handleFieldClick}
                  signingMode={signingMode}
                  viewMode={signingMode ? 'signing' : 'preview'}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Signers Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {document.signers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No signers added yet.</p>
                      <Button onClick={() => navigate(`/editor/${documentId}`)}>
                        Add Signers
                      </Button>
                    </div>
                  ) : (
                    document.signers.map((signer) => (
                      <div key={signer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{signer.name}</p>
                            <p className="text-sm text-gray-600">{signer.email}</p>
                            {signer.signedAt && (
                              <p className="text-xs text-green-600">
                                Signed on {new Date(signer.signedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <DocumentHistory document={document} />
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <DocumentComments document={document} />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <DocumentSecurity document={document} />
          </TabsContent>

          <TabsContent value="send" className="mt-6">
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
