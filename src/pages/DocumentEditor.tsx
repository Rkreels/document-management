import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Save, Trash2, Edit, Users } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentField, Signer } from '@/contexts/DocumentContext';

const DocumentEditor = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak, stop } = useVoice();
  const document = useDocument();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFieldType, setSelectedFieldType] = useState<string>('');
  const [selectedSigner, setSelectedSigner] = useState<string | undefined>(undefined);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');

  useEffect(() => {
    stop();

    if (documentId) {
      const currentDocument = document.documents.find(doc => doc.id === documentId);
      if (currentDocument) {
        document.setCurrentDocument(currentDocument);
        setTitle(currentDocument.title);
        setContent(currentDocument.content);
        speak(`Editing ${currentDocument.title}. You can modify the title, fields, and signers.`, 'normal');
      } else {
        speak("Document not found. Taking you back to the dashboard.", 'high');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } else {
      document.setCurrentDocument(null);
      setTitle('');
      setContent('');
      speak("Creating a new document. Enter the title and upload a PDF to get started.", 'normal');
    }

    return () => stop();
  }, [documentId, document.documents, document.setCurrentDocument, navigate, speak, stop]);

  useEffect(() => {
    if (document.currentDocument) {
      setTitle(document.currentDocument.title);
      setContent(document.currentDocument.content);
    }
  }, [document.currentDocument]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setContent(event.target.result.split(',')[1]); // Extract base64 data
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Title and PDF content are required.",
        variant: "destructive",
      });
      speak("Please enter a title and upload a PDF file.", 'high');
      return;
    }

    if (documentId && document.currentDocument) {
      document.updateDocument(documentId, { title, content });
      toast({
        title: "Success",
        description: "Document updated successfully.",
      });
      speak("Document updated successfully!", 'high');
    } else {
      const newDocument = document.createDocument(title, content);
      navigate(`/editor/${newDocument.id}`);
      toast({
        title: "Success",
        description: "Document created successfully.",
      });
      speak("Document created successfully! Taking you to the editor.", 'high');
    }
  };

  const handleDelete = () => {
    if (documentId && document.currentDocument) {
      document.deleteDocument(documentId);
      navigate('/dashboard');
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });
      speak("Document deleted successfully! Taking you back to the dashboard.", 'high');
    }
  };

  const handleAddField = () => {
    if (!selectedFieldType || !document.currentDocument) return;
    
    const newField: Omit<DocumentField, 'id'> = {
      type: selectedFieldType as 'signature' | 'text' | 'date' | 'checkbox',
      x: 10,
      y: 10,
      width: 15,
      height: 6,
      signerId: selectedSigner || undefined,
      required: true,
    };
    
    document.addField(newField);
    setSelectedFieldType('');
    speak(`${newField.type} field added. You can now drag it to position.`, 'normal');
  };

  const addSigner = () => {
    if (signerName && signerEmail) {
      document.addSigner({
        name: signerName,
        email: signerEmail,
        role: 'signer',
        status: 'pending' // Add the missing required status property
      });
      setSignerName('');
      setSignerEmail('');
    }
  };

  const handleRemoveSigner = (signerId: string) => {
    document.removeSigner(signerId);
    speak("Signer removed.", 'normal');
  };

  const handleFieldTypeChange = (value: string) => {
    setSelectedFieldType(value);
    speak(`Selected field type: ${value}`, 'normal');
  };

  const handleSignerChange = (value: string) => {
    setSelectedSigner(value);
    speak(`Selected signer: ${value}`, 'normal');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">{documentId ? 'Edit Document' : 'Create Document'}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          {documentId && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Document Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input type="text" id="title" value={title} onChange={handleTitleChange} />
          </div>
          <div>
            <Label htmlFor="content">Upload PDF</Label>
            <Input type="file" id="content" accept=".pdf" onChange={handleContentChange} />
          </div>
        </CardContent>
      </Card>

      {/* Signers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Signers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Signer Name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Signer Email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={addSigner}>
            <Plus className="h-4 w-4 mr-2" />
            Add Signer
          </Button>
          <Separator className="my-4" />
          {document.currentDocument?.signers.map((signer) => (
            <div key={signer.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{signer.name}</p>
                <p className="text-sm text-gray-600">{signer.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveSigner(signer.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fieldType">Field Type</Label>
              <Select onValueChange={handleFieldTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="signature">Signature</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="signer">Assign to Signer (Optional)</Label>
              <Select onValueChange={handleSignerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a signer" />
                </SelectTrigger>
                <SelectContent>
                  {document.currentDocument?.signers.map((signer) => (
                    <SelectItem key={signer.id} value={signer.id}>
                      {signer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="secondary" onClick={handleAddField}>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentEditor;
