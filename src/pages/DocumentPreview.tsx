
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Edit, Download, Users, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { SignaturePad } from '@/components/SignaturePad';
import { toast } from '@/hooks/use-toast';

const DocumentPreview = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { speak, stop } = useVoice();
  const { documents, setCurrentDocument, updateDocument, addSigner } = useDocument();
  
  const [document, setDocument] = useState(documents.find(d => d.id === documentId));
  const [isSigningMode, setIsSigningMode] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [newSignerName, setNewSignerName] = useState('');

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
    
    setSelectedFieldId(fieldId);
    const field = document?.fields.find(f => f.id === fieldId);
    if (field?.type === 'signature') {
      speak("Opening signature pad. Draw your signature and click 'Save' when you're done.", 'normal');
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
            {document.status === 'completed' && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Document Preview */}
          <div className="lg:col-span-8">
            <Card className="h-[800px]">
              <CardContent className="p-4 h-full">
                <div className="relative h-full border rounded-lg overflow-hidden bg-white">
                  <div
                    className="w-full h-full bg-gray-100"
                    style={{ 
                      backgroundImage: `url(${document.content})`, 
                      backgroundSize: 'contain', 
                      backgroundRepeat: 'no-repeat', 
                      backgroundPosition: 'center' 
                    }}
                  >
                    {/* Render fields */}
                    {document.fields.map((field) => (
                      <div
                        key={field.id}
                        className={`absolute border-2 flex items-center justify-center text-xs font-medium cursor-pointer transition-all ${
                          isSigningMode 
                            ? 'border-green-500 bg-green-100 hover:bg-green-200' 
                            : 'border-blue-500 bg-blue-100'
                        } ${selectedFieldId === field.id ? 'ring-2 ring-blue-400' : ''}`}
                        style={{
                          left: `${field.x}%`,
                          top: `${field.y}%`,
                          width: `${field.width}%`,
                          height: `${field.height}%`,
                        }}
                        onClick={() => handleFieldClick(field.id)}
                      >
                        {field.value || `${field.type} field`}
                      </div>
                    ))}
                  </div>
                  
                  {isSigningMode && (
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm">
                      Signing Mode - Click fields to complete them
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
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
                <CardTitle>Document Details</CardTitle>
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
      {selectedFieldId && isSigningMode && (
        <SignaturePad
          onSave={(signature) => {
            // Update field with signature
            setSelectedFieldId(null);
            speak("Signature saved successfully! You can continue signing other fields or finish the document.", 'normal');
          }}
          onCancel={() => setSelectedFieldId(null)}
        />
      )}
      
      <VoiceAssistant />
    </div>
  );
};

export default DocumentPreview;
