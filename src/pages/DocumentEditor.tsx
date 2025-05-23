
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Save, 
  Eye, 
  ArrowLeft, 
  Type, 
  Calendar, 
  PenTool, 
  CheckSquare,
  Users,
  Plus,
  Settings
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentField } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { PDFViewer } from '@/components/PDFViewer';
import { FieldEditor } from '@/components/FieldEditor';
import { toast } from '@/hooks/use-toast';

const DocumentEditor = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { speak, stop } = useVoice();
  const { documents, currentDocument, setCurrentDocument, createDocument, addField, updateField, removeField, addSigner } = useDocument();
  
  const [pdfData, setPdfData] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [selectedTool, setSelectedTool] = useState<DocumentField['type'] | null>(null);
  const [editingField, setEditingField] = useState<DocumentField | null>(null);
  const [newSignerName, setNewSignerName] = useState('');
  const [newSignerEmail, setNewSignerEmail] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    stop();
    
    if (documentId && documentId !== 'new') {
      const doc = documents.find(d => d.id === documentId);
      if (doc) {
        setCurrentDocument(doc);
        setDocumentTitle(doc.title);
        setPdfData(doc.content);
        speak(`Loading document "${doc.title}". I'll help you edit the signature fields and manage signers. You can drag new fields onto the document or modify existing ones.`, 'normal');
      }
    } else {
      speak("Welcome to the document editor! First, let's upload a PDF document. Click the 'Upload PDF' button to select a file from your computer. I'll guide you through adding signature fields once your document is uploaded.", 'high');
    }

    return () => stop();
  }, [documentId, documents, speak, stop, setCurrentDocument]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      speak("Oops! Please select a PDF file. Only PDF documents are supported for digital signatures.", 'high');
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPdfData(result);
      setDocumentTitle(file.name.replace('.pdf', ''));
      
      speak(`Great! "${file.name}" has been uploaded successfully. Now let's add a title and start placing signature fields. Use the tools on the left to add signature boxes, text fields, and date fields where signers need to complete information.`, 'high');
      
      toast({
        title: "Document uploaded",
        description: `${file.name} is ready for editing`
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = () => {
    if (!pdfData || !documentTitle.trim()) {
      speak("Please upload a PDF and give your document a title before saving.", 'high');
      return;
    }

    if (currentDocument) {
      speak("Document saved successfully! All your changes have been preserved.", 'normal');
    } else {
      const newDoc = createDocument(documentTitle, pdfData);
      setCurrentDocument(newDoc);
      speak("Document created and saved! Now you can add signature fields and signers. Let's start by adding some signature fields to your document.", 'high');
    }
    
    toast({
      title: "Document saved",
      description: "Your changes have been saved"
    });
  };

  const handlePreview = () => {
    if (!currentDocument) {
      speak("Please save your document first before previewing it.", 'high');
      return;
    }

    if (currentDocument.fields.length === 0) {
      speak("I notice you haven't added any signature fields yet. You might want to add some fields before previewing. Should I show you how to add signature fields?", 'normal');
    } else {
      speak("Opening document preview where you can see how signers will experience your document.", 'normal');
    }
    
    setTimeout(() => navigate(`/preview/${currentDocument.id}`), 1000);
  };

  const tools = [
    { type: 'signature' as const, icon: PenTool, label: 'Signature', description: 'Add signature field' },
    { type: 'text' as const, icon: Type, label: 'Text', description: 'Add text input field' },
    { type: 'date' as const, icon: Calendar, label: 'Date', description: 'Add date field' },
    { type: 'checkbox' as const, icon: CheckSquare, label: 'Checkbox', description: 'Add checkbox field' },
  ];

  const handleToolSelect = (toolType: DocumentField['type']) => {
    setSelectedTool(toolType);
    const toolName = tools.find(t => t.type === toolType)?.label || toolType;
    speak(`${toolName} tool selected. Now click on your document where you want to place this field. I'll help you position it correctly.`, 'normal');
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !currentDocument) return;

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newField: Omit<DocumentField, 'id'> = {
      type: selectedTool,
      x: Math.max(0, Math.min(95, x)),
      y: Math.max(0, Math.min(95, y)),
      width: selectedTool === 'signature' ? 15 : selectedTool === 'checkbox' ? 3 : 10,
      height: selectedTool === 'signature' ? 5 : 3,
      required: true,
    };

    addField(newField);
    setSelectedTool(null);
    
    const toolName = tools.find(t => t.type === selectedTool)?.label || selectedTool;
    speak(`${toolName} field added! You can click on it to modify its properties or drag it to reposition. Great job!`, 'normal');
  };

  const handleFieldClick = (fieldId: string) => {
    if (selectedTool) return; // Don't edit when placing new fields
    
    const field = currentDocument?.fields.find(f => f.id === fieldId);
    if (field) {
      setEditingField(field);
      speak("Opening field editor. Here you can adjust the position, size, and properties of this field.", 'normal');
    }
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<DocumentField>) => {
    updateField(fieldId, updates);
    speak("Field updated successfully!", 'normal');
  };

  const handleFieldDelete = (fieldId: string) => {
    removeField(fieldId);
    setEditingField(null);
    speak("Field deleted successfully!", 'normal');
  };

  const handleAddSigner = () => {
    if (!newSignerEmail.trim() || !newSignerName.trim()) {
      speak("Please enter both the signer's name and email address.", 'high');
      return;
    }

    if (!currentDocument) {
      speak("Please save your document first before adding signers.", 'high');
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
              <h1 className="text-2xl font-bold">Document Editor</h1>
              <p className="text-gray-600">Add fields and prepare your document for signing</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDocument}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handlePreview} disabled={!currentDocument}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Tools Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Document Tools</h3>
                
                {/* Upload Section */}
                {!pdfData && (
                  <div className="mb-6">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF
                    </Button>
                  </div>
                )}

                {/* Document Title */}
                {pdfData && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Document Title</label>
                    <Input
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="Enter document title"
                    />
                  </div>
                )}

                {/* Field Tools */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">Add Fields</h4>
                  {tools.map((tool) => (
                    <Button
                      key={tool.type}
                      variant={selectedTool === tool.type ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleToolSelect(tool.type)}
                    >
                      <tool.icon className="h-4 w-4 mr-2" />
                      {tool.label}
                    </Button>
                  ))}
                </div>

                {/* Quick Stats */}
                {currentDocument && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Document Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Fields:</span>
                        <Badge variant="secondary">{currentDocument.fields.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Signers:</span>
                        <Badge variant="secondary">{currentDocument.signers.length}</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Signers Management */}
            {currentDocument && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Signers
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {currentDocument.signers.map((signer) => (
                      <div key={signer.id} className="flex items-center justify-between p-2 border rounded text-sm">
                        <div>
                          <div className="font-medium">{signer.name}</div>
                          <div className="text-gray-600 text-xs">{signer.email}</div>
                        </div>
                        <Badge variant="outline">{signer.status}</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
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
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-9">
            <PDFViewer
              pdfData={pdfData}
              fields={currentDocument?.fields || []}
              onFieldClick={handleFieldClick}
              selectedTool={selectedTool}
              onCanvasClick={handleCanvasClick}
            />
          </div>
        </div>
      </div>

      {/* Field Editor Modal */}
      {editingField && (
        <FieldEditor
          field={editingField}
          signers={currentDocument?.signers || []}
          onUpdate={(updates) => handleFieldUpdate(editingField.id, updates)}
          onDelete={() => handleFieldDelete(editingField.id)}
          onClose={() => setEditingField(null)}
        />
      )}
      
      <VoiceAssistant />
    </div>
  );
};

export default DocumentEditor;
