import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Upload, 
  Save, 
  Eye, 
  FileText, 
  Calendar, 
  PenTool,
  Users,
  Plus,
  Trash2,
  CheckSquare
} from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentField, Signer } from '@/contexts/DocumentContext';
import { PDFViewer } from '@/components/PDFViewer';
import { FieldEditor } from '@/components/FieldEditor';
import { VoiceAssistant } from '@/components/VoiceAssistant';

const DocumentEditor = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const { documents, createDocument, updateDocument } = useDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [pdfData, setPdfData] = useState<string>('');
  const [fields, setFields] = useState<DocumentField[]>([]);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [draggedFieldType, setDraggedFieldType] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<DocumentField | null>(null);
  const [newSignerName, setNewSignerName] = useState('');
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [activeTab, setActiveTab] = useState('document');

  const isEditing = !!documentId;
  const document = isEditing ? documents.find(doc => doc.id === documentId) : null;

  useEffect(() => {
    stop();

    if (isEditing && document) {
      setTitle(document.title);
      setPdfData(document.content);
      setFields(document.fields);
      setSigners(document.signers);

      const timer = setTimeout(() => {
        speak(`Editing ${document.title}. You can modify the document details, add or reposition signature fields, and manage signers.`, 'normal');
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        speak("Let's create a new document! First, give it a title and upload a PDF file. Then, you can add signature fields and assign signers.", 'high');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [document, isEditing, speak, stop]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPdfData(content);
      speak("PDF uploaded successfully! Now you can add signature fields to the document.", 'high');
    };
    reader.readAsDataURL(file);
  };

  const handleAddSigner = () => {
    if (!newSignerName || !newSignerEmail) {
      speak("Please enter both the signer's name and email address.", 'normal');
      return;
    }

    const newSigner: Signer = {
      id: `signer-${Date.now()}`,
      name: newSignerName,
      email: newSignerEmail,
      role: 'signer'
    };

    setSigners(prev => [...prev, newSigner]);
    setNewSignerName('');
    setNewSignerEmail('');
    speak(`${newSignerName} added as a signer! You can now assign fields to this signer.`, 'normal');
  };

  const handleRemoveSigner = (id: string) => {
    setSigners(prev => prev.filter(signer => signer.id !== id));
    setFields(prev => prev.map(field => field.signerId === id ? { ...field, signerId: undefined } : field));
    speak("Signer removed successfully! Any fields assigned to this signer are now unassigned.", 'normal');
  };

  const handleSave = () => {
    if (!title || !pdfData) {
      speak("Please enter a document title and upload a PDF file before saving.", 'normal');
      return;
    }

    const documentData = {
      title,
      content: pdfData,
      fields,
      signers,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isEditing && document) {
      updateDocument(document.id, {
        title,
        content: pdfData,
        fields,
        signers,
        updatedAt: new Date()
      });
      speak("Document updated successfully!", 'high');
    } else {
      createDocument(documentData);
      speak("Document created successfully! Taking you to the document preview.", 'high');
      setTimeout(() => navigate('/dashboard'), 1500);
    }
  };

  const handlePreview = () => {
    if (isEditing && document) {
      speak("Taking you to the document preview.", 'normal');
      setTimeout(() => navigate(`/preview/${document.id}`), 1000);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedFieldType) return;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newField: DocumentField = {
      id: `field-${Date.now()}`,
      type: draggedFieldType as 'signature' | 'text' | 'date' | 'checkbox',
      x: Math.max(0, Math.min(95, x - 2.5)),
      y: Math.max(0, Math.min(95, y - 2.5)),
      width: 5,
      height: 3,
      required: true,
      page: 1
    };

    setFields(prev => [...prev, newField]);
    setDraggedFieldType(null);

    speak(`${draggedFieldType} field added! You can click on it to edit its properties or drag it to reposition.`, 'normal');
  };

  const fieldTypes = [
    { type: 'signature', icon: PenTool, label: 'Signature', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { type: 'text', icon: FileText, label: 'Text', color: 'bg-green-100 text-green-800 border-green-200' },
    { type: 'date', icon: Calendar, label: 'Date', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { type: 'checkbox', icon: CheckSquare, label: 'Checkbox', color: 'bg-orange-100 text-orange-800 border-orange-200' }
  ];

  
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
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Document' : 'Create New Document'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Modify your document settings and fields' : 'Upload a PDF and add signature fields'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            {isEditing && (
              <Button onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="fields" disabled={!pdfData}>Fields</TabsTrigger>
            <TabsTrigger value="signers">Signers</TabsTrigger>
          </TabsList>

          <TabsContent value="document" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>

                {!pdfData ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload PDF Document</h3>
                    <p className="text-gray-600 mb-4">
                      Select a PDF file to add signature fields and send for signing
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Choose PDF File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">PDF uploaded successfully</span>
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Replace PDF
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fields" className="mt-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Field Palette */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Field Types</CardTitle>
                  <p className="text-sm text-gray-600">Drag fields onto the document</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fieldTypes.map(({ type, icon: Icon, label, color }) => (
                    <div
                      key={type}
                      draggable
                      onDragStart={() => setDraggedFieldType(type)}
                      onDragEnd={() => setDraggedFieldType(null)}
                      className={`p-3 rounded-lg border-2 cursor-move transition-all hover:shadow-md ${color} ${
                        draggedFieldType === type ? 'shadow-lg scale-105' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* PDF Viewer */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Document Preview</CardTitle>
                      <Badge variant="secondary">
                        {fields.length} field{fields.length !== 1 ? 's' : ''} added
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div
                      onClick={handleCanvasClick}
                      className={`relative ${draggedFieldType ? 'cursor-crosshair' : 'cursor-default'}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleCanvasClick(e as any);
                      }}
                    >
                      <PDFViewer
                        pdfData={pdfData}
                        fields={fields}
                        onFieldClick={setEditingField}
                      />
                      {draggedFieldType && (
                        <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                          Click to place {draggedFieldType} field
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signers" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Add Signer */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Signer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="signerName">Full Name</Label>
                    <Input
                      id="signerName"
                      value={newSignerName}
                      onChange={(e) => setNewSignerName(e.target.value)}
                      placeholder="Enter signer's name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signerEmail">Email Address</Label>
                    <Input
                      id="signerEmail"
                      type="email"
                      value={newSignerEmail}
                      onChange={(e) => setNewSignerEmail(e.target.value)}
                      placeholder="Enter signer's email"
                    />
                  </div>
                  <Button onClick={handleAddSigner} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Signer
                  </Button>
                </CardContent>
              </Card>

              {/* Signers List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Signers ({signers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {signers.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">
                      No signers added yet. Add your first signer to get started.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {signers.map((signer) => (
                        <div key={signer.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{signer.name}</p>
                            <p className="text-sm text-gray-600">{signer.email}</p>
                            <Badge variant="outline" className="mt-1">
                              {signer.role}
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveSigner(signer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Field Editor Modal */}
      {editingField && (
        <FieldEditor
          field={editingField}
          signers={signers}
          onUpdate={(updates) => {
            setFields(prev => prev.map(f => 
              f.id === editingField.id ? { ...f, ...updates } : f
            ));
            setEditingField(null);
          }}
          onDelete={() => {
            setFields(prev => prev.filter(f => f.id !== editingField.id));
            setEditingField(null);
            speak("Field deleted successfully.", 'normal');
          }}
          onClose={() => setEditingField(null)}
        />
      )}
      
      <VoiceAssistant />
    </div>
  );
};

export default DocumentEditor;
