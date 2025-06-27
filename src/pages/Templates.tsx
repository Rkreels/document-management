
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Users, Calendar, Trash2, Edit, Copy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, DocumentTemplate } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { SmartVoiceGuide } from '@/components/SmartVoiceGuide';
import { defaultTemplates } from '@/utils/defaultTemplates';

const Templates = () => {
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const { templates, deleteTemplate, createDocumentFromTemplate, addTemplate } = useDocument();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize default templates
  useEffect(() => {
    console.log('Templates component mounted. Current templates count:', templates.length);
    console.log('Default templates count:', defaultTemplates.length);
    
    const initializeTemplates = async () => {
      if (templates.length === 0) {
        console.log('No templates found, initializing default templates...');
        
        // Add all default templates
        for (let i = 0; i < defaultTemplates.length; i++) {
          const template = defaultTemplates[i];
          console.log(`Adding template ${i + 1}/${defaultTemplates.length}:`, template.name);
          addTemplate(template);
        }
        
        console.log('All default templates added successfully');
      } else {
        console.log('Templates already exist:', templates.length);
      }
      
      setIsLoading(false);
    };

    initializeTemplates();
  }, [addTemplate, templates.length]);

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      const templateCount = templates.length;
      if (templateCount > 0) {
        speak(`You have ${templateCount} templates available. These include professional templates for contracts, agreements, forms, and official documents. You can search through them or create new documents from any template.`, 'normal');
      } else {
        speak("Welcome to the Templates library! I'm setting up comprehensive templates for official documents. You'll have 20+ professional templates for various business and legal needs.", 'normal');
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop, templates.length]);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (template.category && template.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateDocument = (template: DocumentTemplate) => {
    const title = `${template.name} - ${new Date().toLocaleDateString()}`;
    const newDocument = createDocumentFromTemplate(template.id, title);
    speak(`Creating a new document from the ${template.name} template. This template includes ${template.fields.length} pre-configured fields and ${template.signers?.length || 0} signers. Taking you to the editor to customize it.`, 'high');
    
    setTimeout(() => {
      (window as any).voiceGuide?.provideActionGuidance('template-created', { templateName: template.name });
    }, 1500);
    
    setTimeout(() => navigate(`/editor/${newDocument.id}`), 2000);
  };

  const handleEditTemplate = (templateId: string) => {
    speak("Taking you to the template editor where you can modify fields, signers, and other template settings.", 'normal');
    setTimeout(() => navigate(`/template-editor/${templateId}`), 800);
  };

  const handleDeleteTemplate = (template: DocumentTemplate) => {
    if (confirm(`Are you sure you want to delete the "${template.name}" template? This action cannot be undone.`)) {
      deleteTemplate(template.id);
      speak(`Template "${template.name}" deleted successfully. This will not affect any documents created from this template.`, 'normal');
    }
  };

  const handleNewTemplate = () => {
    speak("Let's create a new template. You'll be able to upload a PDF and set up reusable fields that can save you time when creating similar documents.", 'high');
    setTimeout(() => navigate('/template-editor'), 1000);
  };

  const handleBackToDashboard = () => {
    speak("Returning to your dashboard.", 'normal');
    setTimeout(() => navigate('/dashboard'), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SmartVoiceGuide />
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Document Templates</h1>
              <p className="text-gray-600">{templates.length} Professional templates for official documents</p>
            </div>
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
              onFocus={() => speak("Search templates by name, category, or description.", 'low')}
            />
          </div>
        </div>

        {/* Debug Information */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Debug Info: Templates loaded: {templates.length}, Default templates: {defaultTemplates.length}, 
            Filtered: {filteredTemplates.length}, Loading: {isLoading ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Loading templates...</h3>
              <p className="text-gray-600 mb-6">
                Setting up {defaultTemplates.length} professional templates for official documents.
              </p>
            </CardContent>
          </Card>
        ) : filteredTemplates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No templates found</h3>
              <p className="text-gray-600 mb-6">
                {templates.length === 0 
                  ? "No templates are available. Click 'New Template' to create your first template."
                  : "Try adjusting your search terms to find the template you need."
                }
              </p>
              <Button onClick={handleNewTemplate}>
                Create Your First Template
              </Button>
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
                      <span>{template.signers?.length || 0}</span>
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
                      onFocus={() => speak(`Use ${template.name} template button focused. This template has ${template.fields.length} fields ready to use.`, 'low')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                    <Button 
                      onClick={() => handleEditTemplate(template.id)}
                      variant="outline"
                      size="sm"
                      title="Edit template"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteTemplate(template)}
                      variant="outline"
                      size="sm"
                      title="Delete template"
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
