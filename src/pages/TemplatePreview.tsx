import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Users, Calendar } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { PageHeader } from '@/components/PageHeader';
import { defaultTemplates } from '@/utils/defaultTemplates';

const TemplatePreview = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    stop();
    
    const foundTemplate = defaultTemplates.find(t => t.id === templateId);
    if (foundTemplate) {
      setTemplate(foundTemplate);
      speak(`Previewing ${foundTemplate.name}. This ${foundTemplate.category} template has ${foundTemplate.fields?.length || 0} fields and ${foundTemplate.signers?.length || 0} signers.`, 'normal');
    } else {
      speak("Template not found. Redirecting back to templates.", 'high');
      setTimeout(() => navigate('/templates'), 2000);
    }
  }, [templateId, navigate, speak, stop]);

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Template Not Found</h2>
            <p className="text-muted-foreground mb-4">The template you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/templates')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Template Preview"
          description={template.name}
          backTo="/templates"
        >
          <Button onClick={() => navigate(`/template-editor/${template.id}`)}>
            Edit Template
          </Button>
        </PageHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="font-medium">Name</label>
                <p className="text-muted-foreground">{template.name}</p>
              </div>
              <div>
                <label className="font-medium">Description</label>
                <p className="text-muted-foreground">{template.description}</p>
              </div>
              <div>
                <label className="font-medium">Category</label>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <div className="flex gap-4 text-sm">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Fields</CardTitle>
            </CardHeader>
            <CardContent>
              {template.fields && template.fields.length > 0 ? (
                <div className="space-y-2">
                  {template.fields.map((field: any, index: number) => (
                    <div key={field.id || index} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{field.label}</span>
                      <Badge variant="secondary">{field.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No fields configured</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default TemplatePreview;