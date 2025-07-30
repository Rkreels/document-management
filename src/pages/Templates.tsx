
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye, Edit, Trash2, FileText, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { VoicePageAnnouncer } from '@/components/VoicePageAnnouncer';
import { PageHeader } from '@/components/PageHeader';
import { defaultTemplates } from '@/utils/defaultTemplates';

const Templates = () => {
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    stop();
    console.log('Templates component mounted');
    console.log('Default templates available:', defaultTemplates);
    
    // Initialize templates with a small delay to ensure proper rendering
    const initializeTemplates = () => {
      try {
        console.log('Initializing templates...');
        setTemplates(defaultTemplates);
        setLoading(false);
        console.log('Templates set successfully:', defaultTemplates.length, 'templates');
        
        // Voice announcement
        setTimeout(() => {
          speak(`Template library loaded with ${defaultTemplates.length} available templates. You can search, preview, or create new templates from here.`, 'normal');
        }, 500);
      } catch (error) {
        console.error('Error initializing templates:', error);
        setLoading(false);
      }
    };

    initializeTemplates();
  }, [speak, stop]);

  const filteredTemplates = templates.filter(template =>
    (template.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTemplate = () => {
    speak("Creating a new template. You'll be taken to the template editor.", 'normal');
    setTimeout(() => navigate('/template-editor'), 500);
  };

  const handleEditTemplate = (templateId: string) => {
    speak("Opening template for editing.", 'normal');
    setTimeout(() => navigate(`/template-editor/${templateId}`), 500);
  };

  const handlePreviewTemplate = (templateId: string) => {
    speak("Opening template preview.", 'normal');
    // Use template-preview route instead of document preview
    setTimeout(() => navigate(`/template-preview/${templateId}`), 500);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Legal': 'bg-blue-50 text-blue-700 border-blue-200',
      'Business': 'bg-green-50 text-green-700 border-green-200',
      'HR': 'bg-purple-50 text-purple-700 border-purple-200',
      'Sales': 'bg-orange-50 text-orange-700 border-orange-200',
      'Real Estate': 'bg-red-50 text-red-700 border-red-200',
      'Commercial': 'bg-teal-50 text-teal-700 border-teal-200',
      'Finance': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Education': 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Voice Page Announcer */}
        <VoicePageAnnouncer 
          title="Document Templates Library"
          description={`Professional template library with ${templates.length} ready-to-use document templates. Search through categories including legal contracts, NDAs, employment agreements, and more.`}
          features={[
            'Search and filter templates',
            'Preview template content',
            'Edit existing templates', 
            'Create custom templates',
            'Professional document formats'
          ]}
        />
        
        {/* Header */}
        <PageHeader 
          title="Document Templates"
          description="Create and manage reusable document templates"
        >
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </PageHeader>


        {/* Search */}
        <div className="mb-8">
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
        {filteredTemplates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription className="mt-2">{template.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{template.fields?.length || 0} fields</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{template.signers?.length || 0} signers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePreviewTemplate(template.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditTemplate(template.id)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms or create a new template."
                  : "Start by creating your first document template."
                }
              </p>
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default Templates;
