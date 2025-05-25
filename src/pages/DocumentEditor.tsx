import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Save, Trash2, FileText, Users, Settings, Bell, BarChart3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentField, Signer } from '@/contexts/DocumentContext';
import { PDFViewer } from '@/components/PDFViewer';
import { AdvancedFieldEditor } from '@/components/AdvancedFieldEditor';
import { WorkflowManager } from '@/components/WorkflowManager';
import { NotificationCenter } from '@/components/NotificationCenter';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

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
  const [editingField, setEditingField] = useState<DocumentField | null>(null);
  const [activeTab, setActiveTab] = useState('document');

  useEffect(() => {
    stop();

    if (documentId) {
      const currentDocument = document.documents.find(doc => doc.id === documentId);
      if (currentDocument) {
        document.setCurrentDocument(currentDocument);
        setTitle(currentDocument.title);
        setContent(currentDocument.content);
        speak(`Editing ${currentDocument.title}. You now have access to advanced features including workflow management, analytics, and notifications.`, 'normal');
      } else {
        speak("Document not found. Taking you back to the dashboard.", 'high');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } else {
      document.setCurrentDocument(null);
      setTitle('');
      setContent('');
      speak("Creating a new document with advanced features. Set up the document, add fields, configure workflow, and manage notifications.", 'normal');
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
        const base64Content = event.target.result.split(',')[1];
        setContent(base64Content);
        speak("PDF uploaded successfully. You can now see the document preview below.", 'normal');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSample = () => {
    const sampleData = `JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKFNhbXBsZSBEb2N1bWVudCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago6cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMxMiAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwNQolJUVPRg==`;
    setContent(sampleData);
    setTitle('Sample Contract Document');
    speak("Sample PDF loaded successfully. You can now see the document preview and add fields.", 'normal');
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
      speak("Document created successfully! You can now configure advanced features.", 'high');
    }
  };

  const handleDelete = () => {
    if (documentId && document.currentDocument) {
      if (confirm(`Are you sure you want to delete "${document.currentDocument.title}"?`)) {
        document.deleteDocument(documentId);
        navigate('/dashboard');
        toast({
          title: "Success",
          description: "Document deleted successfully.",
        });
        speak("Document deleted successfully! Taking you back to the dashboard.", 'high');
      }
    }
  };

  const handleAddField = () => {
    if (!selectedFieldType || !document.currentDocument) return;
    
    const newField: Omit<DocumentField, 'id'> = {
      type: selectedFieldType as DocumentField['type'],
      x: 10,
      y: 10,
      width: 15,
      height: 6,
      page: 1,
      signerId: selectedSigner || undefined,
      required: true,
      label: `${selectedFieldType} field`,
    };
    
    document.addField(newField);
    setSelectedFieldType('');
    speak(`${newField.type} field added. Click on it to configure advanced properties.`, 'normal');
  };

  const handleFieldClick = (field: DocumentField) => {
    setEditingField(field);
  };

  const handleFieldUpdate = (updates: Partial<DocumentField>) => {
    if (editingField) {
      document.updateField(editingField.id, updates);
      setEditingField(null);
    }
  };

  const handleFieldDelete = () => {
    if (editingField) {
      document.removeField(editingField.id);
      setEditingField(null);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'workflow':
        return <Users className="h-4 w-4" />;
      case 'notifications':
        return <Bell className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
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
          <div>
            <h1 className="text-2xl font-bold">
              {documentId ? 'Edit Document' : 'Create Document'}
            </h1>
            {document.currentDocument && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{document.currentDocument.status}</Badge>
                <Badge variant="secondary">
                  {document.currentDocument.signingOrder} signing
                </Badge>
              </div>
            )}
          </div>
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

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="document" className="flex items-center gap-2">
            {getTabIcon('document')}
            Document
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2" disabled={!document.currentDocument}>
            {getTabIcon('workflow')}
            Workflow
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2" disabled={!document.currentDocument}>
            {getTabIcon('notifications')}
            Notifications
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            {getTabIcon('analytics')}
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Document Tab */}
        <TabsContent value="document" className="space-y-6">
          {/* Document Details */}
          <Card>
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
                <div className="flex gap-2">
                  <Input type="file" id="content" accept=".pdf" onChange={handleContentChange} className="flex-1" />
                  <Button variant="outline" onClick={handleLoadSample}>
                    Load Sample PDF
                  </Button>
                </div>
                {content && (
                  <p className="text-sm text-green-600 mt-1">PDF loaded successfully</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Field Management */}
          <Card>
            <CardHeader>
              <CardTitle>Add Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fieldType">Field Type</Label>
                  <Select onValueChange={setSelectedFieldType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a field type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signature">Signature</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="radio">Radio Button Group</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                      <SelectItem value="formula">Formula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="signer">Assign to Signer (Optional)</Label>
                  <Select onValueChange={setSelectedSigner}>
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
              <Button 
                variant="secondary" 
                onClick={handleAddField}
                disabled={!selectedFieldType}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </CardContent>
          </Card>

          {/* PDF Preview */}
          {content && (
            <Card>
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PDFViewer
                  pdfData={content}
                  fields={document.currentDocument?.fields || []}
                  onFieldClick={handleFieldClick}
                />
              </CardContent>
            </Card>
          )}

          {!content && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No PDF Document</h3>
                <p className="text-gray-600 mb-4">Upload a PDF file or load a sample document to get started.</p>
                <Button onClick={handleLoadSample}>
                  Load Sample PDF
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow">
          {document.currentDocument && (
            <WorkflowManager document={document.currentDocument} />
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          {document.currentDocument && (
            <NotificationCenter document={document.currentDocument} />
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* Advanced Field Editor Modal */}
      {editingField && (
        <AdvancedFieldEditor
          field={editingField}
          signers={document.currentDocument?.signers || []}
          allFields={document.currentDocument?.fields || []}
          onUpdate={handleFieldUpdate}
          onDelete={handleFieldDelete}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
};

export default DocumentEditor;
