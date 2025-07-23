
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye, Edit, Trash2, FileText, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
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
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
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
    setTimeout(() => navigate(`/preview/${templateId}`), 500);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Legal': 'bg-blue-100 text-blue-800',
      'Business': 'bg-green-100 text-green-800',
      'HR': 'bg-purple-100 text-purple-800',
      'Sales': 'bg-orange-100 text-orange-800',
      'Real Estate': 'bg-red-100 text-red-800',
      'Healthcare': 'bg-teal-100 text-teal-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Education': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading templates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Document Management - Templates</h1>
            <p className="text-gray-600">Create and manage reusable document templates</p>
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
          <strong>Debug:</strong> {templates.length} templates loaded, {filteredTemplates.length} after filtering
        </div>

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
                    <Badge className={getCategoryColor(template.category)}>
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
