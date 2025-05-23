
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Users, Calendar, Trash2, Edit, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentTemplate } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';

const Templates = () => {
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const { templates, deleteTemplate, createDocumentFromTemplate } = useDocument();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      if (templates.length === 0) {
        speak("Welcome to the Templates library! Templates help you create documents faster by reusing common layouts and fields. You can create a new template or convert an existing document into a template.", 'normal');
      } else {
        speak(`You have ${templates.length} templates available. You can search through them, create new documents from templates, or manage existing templates.`, 'normal');
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop, templates.length]);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDocument = (template: DocumentTemplate) => {
    const title = `${template.name} - ${new Date().toLocaleDateString()}`;
    const newDocument = createDocumentFromTemplate(template.id, title);
    speak(`Creating a new document from the ${template.name} template. Taking you to the editor.`, 'high');
    setTimeout(() => navigate(`/editor/${newDocument.id}`), 1000);
  };

  const handleEditTemplate = (templateId: string) => {
    speak("Taking you to the template editor.", 'normal');
    setTimeout(() => navigate(`/template-editor/${templateId}`), 800);
  };

  const handleDeleteTemplate = (template: DocumentTemplate) => {
    if (confirm(`Are you sure you want to delete the "${template.name}" template?`)) {
      deleteTemplate(template.id);
      speak(`Template "${template.name}" deleted successfully.`, 'normal');
    }
  };

  const handleNewTemplate = () => {
    speak("Let's create a new template. You'll be able to upload a PDF and set up reusable fields.", 'high');
    setTimeout(() => navigate('/template-editor'), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Document Templates</h1>
            <p className="text-gray-600">Create and manage reusable document templates</p>
          </div>
          <Button onClick={handleNewTemplate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {templates.length === 0 ? "No templates yet" : "No templates found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {templates.length === 0 
                  ? "Start by creating your first template to speed up document creation."
                  : "Try adjusting your search terms."
                }
              </p>
              {templates.length === 0 && (
                <Button onClick={handleNewTemplate}>
                  Create Your First Template
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                    {template.category && (
                      <Badge variant="secondary">{template.category}</Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Fields:</span>
                      <span>{template.fields.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signers:</span>
                      <span>{template.signers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{template.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleCreateDocument(template)}
                      className="flex-1"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                    <Button 
                      onClick={() => handleEditTemplate(template.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteTemplate(template)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default Templates;
