import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Settings, 
  Calendar,
  Clock,
  CheckCircle,
  X,
  Send,
  Eye,
  Trash2
} from 'lucide-react';
import { useDocument } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms' | 'push';
  trigger: 'document_sent' | 'reminder' | 'completed' | 'declined' | 'expired';
  enabled: boolean;
}

interface NotificationSchedule {
  id: string;
  documentId: string;
  signerId: string;
  type: 'reminder' | 'deadline';
  scheduledAt: Date;
  sent: boolean;
  templateId: string;
}

export const EnhancedNotificationSystem: React.FC = () => {
  const { documents } = useDocument();
  const { speak } = useVoice();
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 'reminder-1',
      name: 'First Reminder',
      subject: 'Action Required: Please sign your document',
      body: 'Hello {signer_name},\n\nYou have a document waiting for your signature. Please click the link below to review and sign.\n\nDocument: {document_title}\n\n{signing_link}\n\nThank you!',
      type: 'email',
      trigger: 'reminder',
      enabled: true
    },
    {
      id: 'completion',
      name: 'Document Completed',
      subject: 'Document signing completed',
      body: 'Hello {signer_name},\n\nGreat news! The document "{document_title}" has been completed by all parties.\n\nYou can download your copy using the link below.\n\n{download_link}\n\nThank you for your time!',
      type: 'email',
      trigger: 'completed',
      enabled: true
    },
    {
      id: 'sms-reminder',
      name: 'SMS Reminder',
      subject: '',
      body: 'Hi {signer_name}, you have a document waiting for signature. {signing_link}',
      type: 'sms',
      trigger: 'reminder',
      enabled: false
    }
  ]);

  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [newTemplate, setNewTemplate] = useState<Partial<NotificationTemplate>>({
    name: '',
    subject: '',
    body: '',
    type: 'email',
    trigger: 'reminder',
    enabled: true
  });
  const [isCreating, setIsCreating] = useState(false);

  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.body) return;

    const template: NotificationTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      subject: newTemplate.subject || '',
      body: newTemplate.body,
      type: newTemplate.type || 'email',
      trigger: newTemplate.trigger || 'reminder',
      enabled: newTemplate.enabled ?? true
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      subject: '',
      body: '',
      type: 'email',
      trigger: 'reminder',
      enabled: true
    });
    setIsCreating(false);
    speak('Notification template created successfully', 'normal');
  };

  const updateTemplate = (id: string, updates: Partial<NotificationTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    speak('Notification template deleted', 'normal');
  };

  const scheduleNotification = (documentId: string, signerId: string, templateId: string, scheduledAt: Date) => {
    const schedule: NotificationSchedule = {
      id: `schedule-${Date.now()}`,
      documentId,
      signerId,
      type: 'reminder',
      scheduledAt,
      sent: false,
      templateId
    };

    setSchedules(prev => [...prev, schedule]);
    speak('Notification scheduled successfully', 'normal');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'sms': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'push': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'document_sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'reminder': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'expired': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Enhanced Notification System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Notification Templates</h3>
                <Button onClick={() => setIsCreating(true)}>
                  <Bell className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>

              {isCreating && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Create New Template
                      <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Template Name</Label>
                        <Input
                          value={newTemplate.name || ''}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter template name"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <select
                          value={newTemplate.type || 'email'}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full p-2 border rounded"
                        >
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                          <option value="push">Push Notification</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Trigger</Label>
                        <select
                          value={newTemplate.trigger || 'reminder'}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, trigger: e.target.value as any }))}
                          className="w-full p-2 border rounded"
                        >
                          <option value="document_sent">Document Sent</option>
                          <option value="reminder">Reminder</option>
                          <option value="completed">Completed</option>
                          <option value="declined">Declined</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newTemplate.enabled ?? true}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, enabled: checked }))}
                        />
                        <Label>Enabled</Label>
                      </div>
                    </div>

                    {(newTemplate.type === 'email') && (
                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={newTemplate.subject || ''}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Email subject"
                        />
                      </div>
                    )}

                    <div>
                      <Label>Message Body</Label>
                      <Textarea
                        value={newTemplate.body || ''}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, body: e.target.value }))}
                        placeholder="Template message body. Use {signer_name}, {document_title}, {signing_link}, etc."
                        rows={6}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={createTemplate} className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Create Template
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(template.type)}
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge className={getTypeColor(template.type)}>
                            {template.type}
                          </Badge>
                          <Badge className={getTriggerColor(template.trigger)}>
                            {template.trigger.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={template.enabled}
                            onCheckedChange={(checked) => updateTemplate(template.id, { enabled: checked })}
                          />
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {template.subject && (
                        <p className="text-sm font-medium mb-1">Subject: {template.subject}</p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.body}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedules" className="space-y-4">
              <h3 className="text-lg font-semibold">Scheduled Notifications</h3>
              
              {schedules.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No scheduled notifications</h4>
                    <p className="text-muted-foreground">
                      Notifications will appear here when you schedule them for documents.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {schedule.type} for Document #{schedule.documentId.slice(-6)}
                            </span>
                            <Badge variant={schedule.sent ? 'default' : 'secondary'}>
                              {schedule.sent ? 'Sent' : 'Pending'}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {schedule.scheduledAt.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle>Global Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Email Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Enable SMS Notifications</Label>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Enable Push Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Send Reminders Automatically</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};