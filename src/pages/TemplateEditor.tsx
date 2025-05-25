import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentTemplate } from '@/contexts/DocumentContext';

const TemplateEditor = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak, stop } = useVoice();
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useDocument();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');

  const currentTemplate = templateId ? templates.find(t => t.id === templateId) : null;

  useEffect(() => {
    stop();

    if (templateId) {
      if (currentTemplate) {
        setName(currentTemplate.name);
        setDescription(currentTemplate.description);
        setCategory(currentTemplate.category || '');
        setTags(currentTemplate.tags?.join(', ') || '');
        setContent(currentTemplate.content);
        speak(`Editing template: ${currentTemplate.name}. You can modify the template details and fields.`, 'normal');
      } else {
        speak("Template not found. Taking you back to templates.", 'high');
        setTimeout(() => navigate('/templates'), 2000);
      }
    } else {
      speak("Creating a new template. Enter the template details and upload a PDF to get started.", 'normal');
    }

    return () => stop();
  }, [templateId, currentTemplate, navigate, speak, stop]);

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
    if (!name || !description || !content) {
      toast({
        title: "Error",
        description: "Name, description, and PDF content are required.",
        variant: "destructive",
      });
      speak("Please fill in all required fields and upload a PDF.", 'high');
      return;
    }

    const templateData = {
      title: name, // Add title property
      name,
      description,
      content,
      category: category || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      fields: currentTemplate?.fields || [],
      signers: currentTemplate?.signers || [],
      isPublic: false,
      usageCount: 0,
    };

    if (templateId && currentTemplate) {
      updateTemplate(templateId, templateData);
      toast({
        title: "Success",
        description: "Template updated successfully.",
      });
      speak("Template updated successfully!", 'high');
    } else {
      const newTemplate = createTemplate(templateData);
      navigate(`/template-editor/${newTemplate.id}`);
      toast({
        title: "Success",
        description: "Template created successfully.",
      });
      speak("Template created successfully! You can now add fields and signers.", 'high');
    }
  };

  const handleDelete = () => {
    if (templateId && currentTemplate) {
      if (confirm(`Are you sure you want to delete the "${currentTemplate.name}" template?`)) {
        deleteTemplate(templateId);
        navigate('/templates');
        toast({
          title: "Success",
          description: "Template deleted successfully.",
        });
        speak("Template deleted successfully! Taking you back to templates.", 'high');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <h1 className="text-2xl font-bold">
            {templateId ? 'Edit Template' : 'Create Template'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          {templateId && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Template Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Employment Contract"
            />
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is used for..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="category">Category (Optional)</Label>
            <Input 
              type="text" 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., HR, Legal, Sales"
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input 
              type="text" 
              id="tags" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
            />
          </div>
          <div>
            <Label htmlFor="content">Upload PDF *</Label>
            <Input type="file" id="content" accept=".pdf" onChange={handleContentChange} />
            {content && (
              <p className="text-sm text-green-600 mt-1">PDF uploaded successfully</p>
            )}
          </div>
        </CardContent>
      </Card>

      {currentTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Template Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fields</p>
                <p className="text-lg font-semibold">{currentTemplate.fields.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Signers</p>
                <p className="text-lg font-semibold">{currentTemplate.signers.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-lg font-semibold">{currentTemplate.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-lg font-semibold">{currentTemplate.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateEditor;
