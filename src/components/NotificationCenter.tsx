
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, Mail, MessageSquare, Settings, Send, Clock, 
  Smartphone, Globe, Users, Shield, Zap, AlertTriangle,
  CheckCircle, Info, Calendar, Phone, Slack
} from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationCenterProps {
  document: Document;
}

interface NotificationEvent {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'teams';
  title: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  recipientEmail: string;
  sentAt: Date;
  read: boolean;
  metadata?: {
    deliveryTime?: number;
    clickCount?: number;
    ipAddress?: string;
  };
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ document }) => {
  const { updateDocument, sendReminder, createNotification } = useDocument();
  const { speak, announceFeatureIntroduction } = useVoice();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<NotificationEvent[]>([
    {
      id: '1',
      type: 'email',
      title: 'Document Sent',
      message: 'Contract sent to John Doe for signature',
      status: 'delivered',
      recipientEmail: 'john@example.com',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      metadata: { deliveryTime: 1.2, clickCount: 2, ipAddress: '192.168.1.1' }
    },
    {
      id: '2',
      type: 'sms',
      title: 'Reminder Sent',
      message: 'SMS reminder sent to Alice Smith',
      status: 'sent',
      recipientEmail: 'alice@example.com',
      sentAt: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      metadata: { deliveryTime: 0.3 }
    }
  ]);

  // Enhanced notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      enabled: true,
      templates: {
        invitation: 'Please review and sign the attached document.',
        reminder: 'This is a friendly reminder to complete your signature.',
        completion: 'All parties have signed the document.',
        expiration: 'The document will expire soon. Please sign immediately.'
      },
      branding: {
        logo: '',
        signature: 'Best regards,\nYour Company Name',
        colors: { primary: '#0066cc', secondary: '#f0f0f0' }
      }
    },
    sms: {
      enabled: true,
      templates: {
        reminder: 'Document signature required: {document_title}. Sign at: {link}',
        urgent: 'URGENT: Document expires in 24 hours. Sign now: {link}'
      }
    },
    push: {
      enabled: true,
      sound: true,
      badge: true
    },
    webhook: {
      enabled: false,
      url: '',
      events: ['sent', 'viewed', 'signed', 'completed', 'declined'],
      authentication: { type: 'bearer', token: '' }
    },
    slack: {
      enabled: false,
      channel: '#contracts',
      webhookUrl: ''
    },
    teams: {
      enabled: false,
      webhookUrl: ''
    }
  });

  const [bulkSettings, setBulkSettings] = useState({
    autoReminders: true,
    reminderFrequency: 'daily',
    maxReminders: 5,
    escalationEnabled: true,
    escalationDays: 7,
    notifyOnComplete: true,
    notifyOnDecline: true,
    notifyOnExpire: true
  });

  const handleSendBulkReminder = () => {
    announceFeatureIntroduction(
      'Bulk Reminder System',
      'Sending comprehensive reminders across multiple channels',
      'This advanced notification system will send reminders via email, SMS, and other configured channels with personalized messaging and delivery tracking.'
    );

    document.signers
      .filter(signer => signer.status === 'pending')
      .forEach(signer => {
        sendReminder(signer.id);
        
        // Create comprehensive notification record
        const newNotification: NotificationEvent = {
          id: `reminder-${Date.now()}-${signer.id}`,
          type: 'email',
          title: 'Bulk Reminder Sent',
          message: `Comprehensive reminder sent to ${signer.name}`,
          status: 'sent',
          recipientEmail: signer.email,
          sentAt: new Date(),
          read: false,
          metadata: { deliveryTime: 0, clickCount: 0 }
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        createNotification(newNotification);
      });
    
    speak('Bulk reminders sent via multiple channels with comprehensive tracking enabled', 'high');
    
    toast({
      title: 'Bulk Reminders Sent',
      description: 'Comprehensive reminders sent across all configured channels.',
    });
  };

  const handleWebhookTest = () => {
    speak('Testing webhook integration with real-time delivery confirmation', 'normal');
    
    if (notificationSettings.webhook.url) {
      fetch(notificationSettings.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${notificationSettings.webhook.authentication.token}`
        },
        body: JSON.stringify({
          event: 'test',
          document_id: document.id,
          timestamp: new Date().toISOString(),
          data: { test: true }
        })
      }).then(() => {
        toast({
          title: 'Webhook Test Successful',
          description: 'Webhook endpoint is responding correctly.',
        });
      }).catch(() => {
        toast({
          title: 'Webhook Test Failed',
          description: 'Unable to reach webhook endpoint.',
          variant: 'destructive'
        });
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return Smartphone;
      case 'webhook': return Globe;
      case 'slack': return MessageSquare;
      case 'teams': return Users;
      default: return Bell;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'sent': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Enterprise Notification Center
            <Badge variant="outline">Multi-Channel</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Email Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span className="text-sm">SMS Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Webhook Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Team Collaboration</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Sent</p>
                    <p className="text-xl font-bold">247</p>
                    <p className="text-xs text-green-600">+12% this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Rate</p>
                    <p className="text-xl font-bold">98.2%</p>
                    <p className="text-xs text-green-600">Above industry avg</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Response</p>
                    <p className="text-xl font-bold">2.3 hrs</p>
                    <p className="text-xs text-green-600">-30 min improvement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Notification Feed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Real-time Notification Feed</CardTitle>
                <Button onClick={handleSendBulkReminder} size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send Bulk Reminder
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <div key={notification.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'email' ? 'bg-blue-100' :
                        notification.type === 'sms' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        <IconComponent className={`h-4 w-4 ${
                          notification.type === 'email' ? 'text-blue-600' :
                          notification.type === 'sms' ? 'text-green-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                        </div>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {notification.sentAt.toLocaleString()}
                          </span>
                          {notification.metadata?.deliveryTime && (
                            <Badge variant="outline" className="text-xs">
                              {notification.metadata.deliveryTime}s delivery
                            </Badge>
                          )}
                          {notification.metadata?.clickCount && (
                            <Badge variant="outline" className="text-xs">
                              {notification.metadata.clickCount} clicks
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={
                        notification.status === 'delivered' ? 'default' :
                        notification.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {notification.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Email Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notification Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.email.enabled}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, enabled: checked }
                    }))
                  }
                />
              </div>

              {notificationSettings.email.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Invitation Email Template</Label>
                    <Textarea
                      value={notificationSettings.email.templates.invitation}
                      onChange={(e) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          email: {
                            ...prev.email,
                            templates: { ...prev.email.templates, invitation: e.target.value }
                          }
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Reminder Email Template</Label>
                    <Textarea
                      value={notificationSettings.email.templates.reminder}
                      onChange={(e) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          email: {
                            ...prev.email,
                            templates: { ...prev.email.templates, reminder: e.target.value }
                          }
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email Signature</Label>
                      <Textarea
                        value={notificationSettings.email.branding.signature}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({
                            ...prev,
                            email: {
                              ...prev.email,
                              branding: { ...prev.email.branding, signature: e.target.value }
                            }
                          }))
                        }
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Logo URL</Label>
                      <Input
                        value={notificationSettings.email.branding.logo}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({
                            ...prev,
                            email: {
                              ...prev.email,
                              branding: { ...prev.email.branding, logo: e.target.value }
                            }
                          }))
                        }
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Channel Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid gap-4">
            {/* SMS Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  SMS Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Send urgent notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.sms.enabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({
                        ...prev,
                        sms: { ...prev.sms, enabled: checked }
                      }))
                    }
                  />
                </div>

                {notificationSettings.sms.enabled && (
                  <div className="space-y-3">
                    <div>
                      <Label>SMS Reminder Template</Label>
                      <Textarea
                        value={notificationSettings.sms.templates.reminder}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({
                            ...prev,
                            sms: {
                              ...prev.sms,
                              templates: { ...prev.sms.templates, reminder: e.target.value }
                            }
                          }))
                        }
                        placeholder="Use {document_title} and {link} placeholders"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Webhook Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Webhook Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Webhook Notifications</Label>
                    <p className="text-sm text-gray-600">Send real-time events to your system</p>
                  </div>
                  <Switch
                    checked={notificationSettings.webhook.enabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({
                        ...prev,
                        webhook: { ...prev.webhook, enabled: checked }
                      }))
                    }
                  />
                </div>

                {notificationSettings.webhook.enabled && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={notificationSettings.webhook.url}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({
                            ...prev,
                            webhook: { ...prev.webhook, url: e.target.value }
                          }))
                        }
                        placeholder="https://api.yourcompany.com/webhook"
                        className="flex-1"
                      />
                      <Button onClick={handleWebhookTest} variant="outline">
                        Test
                      </Button>
                    </div>

                    <div>
                      <Label>Authentication Token</Label>
                      <Input
                        type="password"
                        value={notificationSettings.webhook.authentication.token}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({
                            ...prev,
                            webhook: {
                              ...prev.webhook,
                              authentication: { ...prev.webhook.authentication, token: e.target.value }
                            }
                          }))
                        }
                        placeholder="Bearer token for webhook authentication"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Collaboration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Team Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Slack Integration</Label>
                        <p className="text-sm text-gray-600">Post updates to Slack</p>
                      </div>
                      <Switch
                        checked={notificationSettings.slack.enabled}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({
                            ...prev,
                            slack: { ...prev.slack, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    
                    {notificationSettings.slack.enabled && (
                      <>
                        <Input
                          value={notificationSettings.slack.channel}
                          onChange={(e) => 
                            setNotificationSettings(prev => ({
                              ...prev,
                              slack: { ...prev.slack, channel: e.target.value }
                            }))
                          }
                          placeholder="#contracts"
                        />
                        <Input
                          value={notificationSettings.slack.webhookUrl}
                          onChange={(e) => 
                            setNotificationSettings(prev => ({
                              ...prev,
                              slack: { ...prev.slack, webhookUrl: e.target.value }
                            }))
                          }
                          placeholder="Slack webhook URL"
                        />
                      </>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Microsoft Teams</Label>
                        <p className="text-sm text-gray-600">Post updates to Teams</p>
                      </div>
                      <Switch
                        checked={notificationSettings.teams.enabled}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({
                            ...prev,
                            teams: { ...prev.teams, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    
                    {notificationSettings.teams.enabled && (
                      <Input
                        value={notificationSettings.teams.webhookUrl}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({
                            ...prev,
                            teams: { ...prev.teams, webhookUrl: e.target.value }
                          }))
                        }
                        placeholder="Teams webhook URL"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Intelligent Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Reminders</Label>
                      <p className="text-sm text-gray-600">Automatically send reminder notifications</p>
                    </div>
                    <Switch
                      checked={bulkSettings.autoReminders}
                      onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, autoReminders: checked }))}
                    />
                  </div>

                  {bulkSettings.autoReminders && (
                    <>
                      <div>
                        <Label>Reminder Frequency</Label>
                        <Select
                          value={bulkSettings.reminderFrequency}
                          onValueChange={(value) => setBulkSettings(prev => ({ ...prev, reminderFrequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="every-2-days">Every 2 days</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Maximum Reminders</Label>
                        <Input
                          type="number"
                          value={bulkSettings.maxReminders}
                          onChange={(e) => setBulkSettings(prev => ({ ...prev, maxReminders: parseInt(e.target.value) }))}
                          min="1"
                          max="10"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Escalation System</Label>
                      <p className="text-sm text-gray-600">Escalate to managers after delays</p>
                    </div>
                    <Switch
                      checked={bulkSettings.escalationEnabled}
                      onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, escalationEnabled: checked }))}
                    />
                  </div>

                  {bulkSettings.escalationEnabled && (
                    <div>
                      <Label>Escalation Delay (days)</Label>
                      <Input
                        type="number"
                        value={bulkSettings.escalationDays}
                        onChange={(e) => setBulkSettings(prev => ({ ...prev, escalationDays: parseInt(e.target.value) }))}
                        min="1"
                        max="30"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notify on Completion</Label>
                      <p className="text-sm text-gray-600">Alert when document is fully signed</p>
                    </div>
                    <Switch
                      checked={bulkSettings.notifyOnComplete}
                      onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, notifyOnComplete: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notify on Decline</Label>
                      <p className="text-sm text-gray-600">Alert when document is declined</p>
                    </div>
                    <Switch
                      checked={bulkSettings.notifyOnDecline}
                      onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, notifyOnDecline: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notify on Expiration</Label>
                      <p className="text-sm text-gray-600">Alert when document expires</p>
                    </div>
                    <Switch
                      checked={bulkSettings.notifyOnExpire}
                      onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, notifyOnExpire: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Notification Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email Open Rate</p>
                      <p className="text-xl font-bold">89.2%</p>
                      <p className="text-xs text-green-600">+2.1% vs last month</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">SMS Delivery</p>
                      <p className="text-xl font-bold">97.8%</p>
                      <p className="text-xs text-green-600">Industry leading</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                      <p className="text-xl font-bold">2.3 hrs</p>
                      <p className="text-xs text-green-600">-45 min improvement</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-xl font-bold">94.6%</p>
                      <p className="text-xs text-green-600">Above target</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
