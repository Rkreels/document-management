import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  FileText,
  Send,
  Shield,
  RotateCcw
} from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import { DataValidation } from './DataValidation';
import { WorkflowEnhancement } from './WorkflowEnhancement';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: string[];
  category: 'simple' | 'standard' | 'complex';
}

interface AdvancedWorkflowManagerProps {
  document: Document;
  onWorkflowComplete?: () => void;
}

export const AdvancedWorkflowManager: React.FC<AdvancedWorkflowManagerProps> = ({
  document,
  onWorkflowComplete
}) => {
  const { updateDocument } = useDocument();
  const { speak } = useVoice();
  const [activeTab, setActiveTab] = useState('workflow');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [workflowSettings, setWorkflowSettings] = useState({
    autoProgress: true,
    stepDelay: 1,
    skipOptional: false,
    pauseOnError: true,
    sendNotifications: true,
    enableRetries: true,
    maxRetries: 3
  });

  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'simple',
      name: 'Simple Workflow',
      description: 'Basic validation and send',
      steps: ['validate', 'send'],
      category: 'simple'
    },
    {
      id: 'standard',
      name: 'Standard Workflow',
      description: 'Complete workflow with all checks',
      steps: ['validate', 'fields', 'signers', 'review', 'send'],
      category: 'standard'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Workflow',
      description: 'Full workflow with security and compliance',
      steps: ['validate', 'fields', 'signers', 'security', 'compliance', 'review', 'send'],
      category: 'complex'
    }
  ];

  const updateWorkflowSettings = (setting: string, value: any) => {
    setWorkflowSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = workflowTemplates.find(t => t.id === templateId);
    if (template) {
      speak(`Selected ${template.name} workflow template`, 'normal');
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Workflow Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="space-y-4">
              <WorkflowEnhancement 
                document={document} 
                onWorkflowComplete={onWorkflowComplete}
              />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4">
                <Label>Select Workflow Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a workflow template" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflowTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {template.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {workflowTemplates.map(template => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer border-2 ${
                      selectedTemplate === template.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => handleTemplateChange(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className={
                          template.category === 'simple' ? 'bg-green-100 text-green-800' :
                          template.category === 'standard' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }>
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.steps.map((step, index) => (
                          <Badge key={step} variant="secondary" className="text-xs">
                            {index + 1}. {step}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <DataValidation 
                document={document}
                fields={document.fields}
                signers={document.signers}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label>Auto Progress</Label>
                  <Switch
                    checked={workflowSettings.autoProgress}
                    onCheckedChange={(checked) => updateWorkflowSettings('autoProgress', checked)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Step Delay (seconds)</Label>
                  <Input
                    type="number"
                    value={workflowSettings.stepDelay}
                    onChange={(e) => updateWorkflowSettings('stepDelay', parseInt(e.target.value) || 1)}
                    min="0"
                    max="10"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Skip Optional Steps</Label>
                  <Switch
                    checked={workflowSettings.skipOptional}
                    onCheckedChange={(checked) => updateWorkflowSettings('skipOptional', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Pause on Error</Label>
                  <Switch
                    checked={workflowSettings.pauseOnError}
                    onCheckedChange={(checked) => updateWorkflowSettings('pauseOnError', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Send Notifications</Label>
                  <Switch
                    checked={workflowSettings.sendNotifications}
                    onCheckedChange={(checked) => updateWorkflowSettings('sendNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Retries</Label>
                  <Switch
                    checked={workflowSettings.enableRetries}
                    onCheckedChange={(checked) => updateWorkflowSettings('enableRetries', checked)}
                  />
                </div>

                {workflowSettings.enableRetries && (
                  <div className="grid gap-2">
                    <Label>Maximum Retries</Label>
                    <Input
                      type="number"
                      value={workflowSettings.maxRetries}
                      onChange={(e) => updateWorkflowSettings('maxRetries', parseInt(e.target.value) || 3)}
                      min="1"
                      max="10"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};