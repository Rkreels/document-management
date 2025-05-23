
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
  Plus
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentField } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { toast } from '@/hooks/use-toast';

const DocumentEditor = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { speak, stop } = useVoice();
  const { documents, currentDocument, setCurrentDocument, createDocument, addField, updateField, removeField } = useDocument();
  
  const [pdfData, setPdfData] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [selectedTool, setSelectedTool] = useState<DocumentField['type'] | null>(null);
  const [draggedField, setDraggedField] = useState<DocumentField | null>(null);
  const [showSignerDialog, setShowSignerDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool || !currentDocument) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newField: Omit<DocumentField, 'id'> = {
      type: selectedTool,
      x,
      y,
      width: selectedTool === 'signature' ? 15 : 10,
      height: selectedTool === 'signature' ? 5 : 3,
      required: true,
    };

    addField(newField);
    setSelectedTool(null);
    
    const toolName = tools.find(t => t.type === selectedTool)?.label || selectedTool;
    speak(`${toolName} field added! You can drag it to reposition or click on it to modify its properties. Great job!`, 'normal');
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
          <div className="lg:col-span-3">
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
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-9">
            <Card className="h-[800px]">
              <CardContent className="p-4 h-full">
                {pdfData ? (
                  <div className="relative h-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      className="w-full h-full bg-white cursor-crosshair"
                      style={{ backgroundImage: `url(${pdfData})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
                    />
                    
                    {/* Render fields */}
                    {currentDocument?.fields.map((field) => (
                      <div
                        key={field.id}
                        className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-50 cursor-move flex items-center justify-center text-xs font-medium"
                        style={{
                          left: `${field.x}%`,
                          top: `${field.y}%`,
                          width: `${field.width}%`,
                          height: `${field.height}%`,
                        }}
                      >
                        {field.type}
                      </div>
                    ))}
                    
                    {selectedTool && (
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                        Click to place {selectedTool} field
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">Upload a PDF to get started</h3>
                      <p className="text-sm text-gray-600">Choose a PDF file to add signature fields and prepare for signing</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default DocumentEditor;
