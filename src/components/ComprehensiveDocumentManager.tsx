
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, Users, Shield, Clock, Bell, BarChart3, 
  Send, Download, Eye, Lock, Unlock, Copy, 
  CheckCircle, AlertCircle, User, Mail, 
  Calendar, Signature, Edit3, Settings,
  Globe, Smartphone, RefreshCw, Zap,
  MessageSquare, FileCheck, History,
  Share2, Filter, Search
} from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/hooks/use-toast';

interface ComprehensiveDocumentManagerProps {
  document: Document;
}

export const ComprehensiveDocumentManager: React.FC<ComprehensiveDocumentManagerProps> = ({ document }) => {
  const { updateDocument, sendDocument, sendReminder, duplicateDocument } = useDocument();
  const { speak, announceFeatureIntroduction } = useVoice();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced DocuSign-like features state
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    frequency: 'daily',
    maxReminders: 3,
    customMessage: '',
    escalationEnabled: false,
    escalationDays: 7,
    escalationRecipients: [] as string[]
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireAuth: true,
    authMethod: 'email' as 'email' | 'sms' | 'phone' | 'id',
    allowPrinting: false,
    allowDownload: true,
    watermark: false,
    ipRestriction: false,
    allowedIPs: [] as string[],
    sessionTimeout: 30,
    requireReasonForDecline: true,
    preventForwarding: true
  });

  const [workflowSettings, setWorkflowSettings] = useState({
    enableConditionalRouting: false,
    parallelSigning: false,
    carbonCopyRecipients: [] as string[],
    witnessRequired: false,
    notaryRequired: false,
    approvalWorkflow: false
  });

  const [brandingSettings, setBrandingSettings] = useState({
    customLogo: '',
    brandColor: '#000000',
    customEmailTemplate: '',
    senderName: '',
    companyName: '',
    customDomain: ''
  });

  const handleAdvancedSend = () => {
    // Announce comprehensive sending process
    announceFeatureIntroduction(
      'Advanced Document Sending',
      'Configuring comprehensive document delivery with security, branding, and workflow settings',
      'This advanced sending process includes authentication requirements, custom branding, workflow routing, and comprehensive security measures similar to DocuSign enterprise features.'
    );

    sendDocument(document.id);
    speak('Document sent with comprehensive enterprise-grade settings applied', 'high');
    
    toast({
      title: 'Advanced Document Sent',
      description: `${document.title} sent with enterprise security and workflow features.`,
    });
  };

  const handleBulkActions = (action: string) => {
    speak(`Executing bulk action: ${action} for document management`, 'normal');
    
    switch (action) {
      case 'remind_all':
        document.signers.filter(s => s.status === 'pending').forEach(signer => {
          sendReminder(signer.id);
        });
        break;
      case 'download_audit':
        speak('Generating comprehensive audit trail with timestamps and IP addresses', 'normal');
        break;
      case 'export_data':
        speak('Exporting document data in multiple formats including PDF, CSV, and JSON', 'normal');
        break;
    }
  };

  const getSigningProgress = () => {
    const signed = document.signers.filter(s => s.status === 'signed').length;
    return Math.round((signed / document.signers.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Comprehensive Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {document.title}
                <Badge variant="outline" className="ml-2">Enterprise</Badge>
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={document.status === 'completed' ? 'default' : 'secondary'}>
                  {document.status}
                </Badge>
                <Badge variant="outline">
                  {workflowSettings.parallelSigning ? 'Parallel' : 'Sequential'} signing
                </Badge>
                {securitySettings.requireAuth && (
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    Auth Required
                  </Badge>
                )}
                <span className="text-sm text-gray-600">
                  Created {new Date(document.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkActions('download_audit')}>
                <History className="h-4 w-4 mr-1" />
                Audit Trail
              </Button>
              <Button variant="outline" size="sm" onClick={() => duplicateDocument(document.id)}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkActions('export_data')}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              {document.status === 'draft' && (
                <Button onClick={handleAdvancedSend}>
                  <Send className="h-4 w-4 mr-1" />
                  Advanced Send
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Comprehensive Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signers">Signers</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Enhanced Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Signing Progress</p>
                    <p className="text-xl font-bold">{getSigningProgress()}%</p>
                    <p className="text-xs text-gray-500">
                      {document.signers.filter(s => s.status === 'signed').length} of {document.signers.length} signed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Document Views</p>
                    <p className="text-xl font-bold">247</p>
                    <p className="text-xs text-gray-500">Unique views</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg. Sign Time</p>
                    <p className="text-xl font-bold">2.3 days</p>
                    <p className="text-xs text-gray-500">Industry: 3.1 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Security Score</p>
                    <p className="text-xl font-bold">98%</p>
                    <p className="text-xs text-gray-500">Enterprise grade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Real-time Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">John Doe signed the document</p>
                    <p className="text-sm text-gray-600">IP: 192.168.1.1 • 2 minutes ago</p>
                  </div>
                  <Badge variant="default">Signed</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Alice Smith viewed the document</p>
                    <p className="text-sm text-gray-600">IP: 192.168.1.5 • 1 hour ago</p>
                  </div>
                  <Badge variant="secondary">Viewed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Enterprise Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Authentication Method</Label>
                    <Select value={securitySettings.authMethod} onValueChange={(value: any) => 
                      setSecuritySettings(prev => ({ ...prev, authMethod: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Verification</SelectItem>
                        <SelectItem value="sms">SMS Verification</SelectItem>
                        <SelectItem value="phone">Phone Call Verification</SelectItem>
                        <SelectItem value="id">ID Document Verification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Prevent Document Forwarding</Label>
                      <p className="text-sm text-gray-600">Block email forwarding of signing invitations</p>
                    </div>
                    <Switch
                      checked={securitySettings.preventForwarding}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, preventForwarding: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Decline Reason</Label>
                      <p className="text-sm text-gray-600">Signers must provide reason for declining</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireReasonForDecline}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, requireReasonForDecline: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => 
                        setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))
                      }
                      min="5"
                      max="120"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP Address Restrictions</Label>
                      <p className="text-sm text-gray-600">Limit access to specific IP ranges</p>
                    </div>
                    <Switch
                      checked={securitySettings.ipRestriction}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, ipRestriction: checked }))
                      }
                    />
                  </div>

                  {securitySettings.ipRestriction && (
                    <div>
                      <Label>Allowed IP Addresses</Label>
                      <Textarea
                        placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                        value={securitySettings.allowedIPs.join('\n')}
                        onChange={(e) => setSecuritySettings(prev => ({ 
                          ...prev, 
                          allowedIPs: e.target.value.split('\n').filter(ip => ip.trim()) 
                        }))}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Advanced Workflow Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Conditional Routing</Label>
                      <p className="text-sm text-gray-600">Route based on form responses</p>
                    </div>
                    <Switch
                      checked={workflowSettings.enableConditionalRouting}
                      onCheckedChange={(checked) => 
                        setWorkflowSettings(prev => ({ ...prev, enableConditionalRouting: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Parallel Signing</Label>
                      <p className="text-sm text-gray-600">Allow simultaneous signing</p>
                    </div>
                    <Switch
                      checked={workflowSettings.parallelSigning}
                      onCheckedChange={(checked) => 
                        setWorkflowSettings(prev => ({ ...prev, parallelSigning: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Witness Required</Label>
                      <p className="text-sm text-gray-600">Require witness for signing</p>
                    </div>
                    <Switch
                      checked={workflowSettings.witnessRequired}
                      onCheckedChange={(checked) => 
                        setWorkflowSettings(prev => ({ ...prev, witnessRequired: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notary Required</Label>
                      <p className="text-sm text-gray-600">Require notarization</p>
                    </div>
                    <Switch
                      checked={workflowSettings.notaryRequired}
                      onCheckedChange={(checked) => 
                        setWorkflowSettings(prev => ({ ...prev, notaryRequired: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Approval Workflow</Label>
                      <p className="text-sm text-gray-600">Require approval before sending</p>
                    </div>
                    <Switch
                      checked={workflowSettings.approvalWorkflow}
                      onCheckedChange={(checked) => 
                        setWorkflowSettings(prev => ({ ...prev, approvalWorkflow: checked }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Carbon Copy Recipients</Label>
                    <Textarea
                      placeholder="Enter email addresses (one per line)"
                      value={workflowSettings.carbonCopyRecipients.join('\n')}
                      onChange={(e) => setWorkflowSettings(prev => ({ 
                        ...prev, 
                        carbonCopyRecipients: e.target.value.split('\n').filter(email => email.trim()) 
                      }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Custom Branding & White-labeling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      value={brandingSettings.companyName}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div>
                    <Label>Sender Name</Label>
                    <Input
                      value={brandingSettings.senderName}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, senderName: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label>Brand Color</Label>
                    <Input
                      type="color"
                      value={brandingSettings.brandColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, brandColor: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Custom Logo URL</Label>
                    <Input
                      value={brandingSettings.customLogo}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, customLogo: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <Label>Custom Domain</Label>
                    <Input
                      value={brandingSettings.customDomain}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, customDomain: e.target.value }))}
                      placeholder="sign.yourcompany.com"
                    />
                  </div>

                  <div>
                    <Label>Custom Email Template</Label>
                    <Textarea
                      value={brandingSettings.customEmailTemplate}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, customEmailTemplate: e.target.value }))}
                      placeholder="Custom email template with {signer_name}, {document_title} placeholders"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Reminders Tab */}
        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Advanced Reminder & Escalation System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Automatic Reminders</Label>
                    <p className="text-sm text-gray-600">Send periodic reminders to pending signers</p>
                  </div>
                  <Switch
                    checked={reminderSettings.enabled}
                    onCheckedChange={(checked) => setReminderSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                {reminderSettings.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Reminder Frequency</Label>
                        <Select
                          value={reminderSettings.frequency}
                          onValueChange={(value) => setReminderSettings(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="every-2-days">Every 2 days</SelectItem>
                            <SelectItem value="every-3-days">Every 3 days</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Maximum Reminders</Label>
                        <Input
                          type="number"
                          value={reminderSettings.maxReminders}
                          onChange={(e) => setReminderSettings(prev => ({ ...prev, maxReminders: parseInt(e.target.value) }))}
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Custom Reminder Message</Label>
                      <Textarea
                        placeholder="Custom reminder message with personalization"
                        value={reminderSettings.customMessage}
                        onChange={(e) => setReminderSettings(prev => ({ ...prev, customMessage: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Escalation</Label>
                          <p className="text-sm text-gray-600">Escalate to managers after delays</p>
                        </div>
                        <Switch
                          checked={reminderSettings.escalationEnabled}
                          onCheckedChange={(checked) => setReminderSettings(prev => ({ ...prev, escalationEnabled: checked }))}
                        />
                      </div>

                      {reminderSettings.escalationEnabled && (
                        <>
                          <div>
                            <Label>Escalation Delay (days)</Label>
                            <Input
                              type="number"
                              value={reminderSettings.escalationDays}
                              onChange={(e) => setReminderSettings(prev => ({ ...prev, escalationDays: parseInt(e.target.value) }))}
                              min="1"
                              max="30"
                            />
                          </div>

                          <div>
                            <Label>Escalation Recipients</Label>
                            <Textarea
                              placeholder="manager@company.com&#10;supervisor@company.com"
                              value={reminderSettings.escalationRecipients.join('\n')}
                              onChange={(e) => setReminderSettings(prev => ({ 
                                ...prev, 
                                escalationRecipients: e.target.value.split('\n').filter(email => email.trim()) 
                              }))}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comprehensive Analytics & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Views</p>
                      <p className="text-xl font-bold">1,247</p>
                      <p className="text-xs text-green-600">+12% vs last month</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="text-xl font-bold">94.2%</p>
                      <p className="text-xs text-green-600">+3.1% vs industry</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Avg. Time to Sign</p>
                      <p className="text-xl font-bold">1.8 days</p>
                      <p className="text-xs text-green-600">-0.5 days improvement</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Reminders Sent</p>
                      <p className="text-xl font-bold">89</p>
                      <p className="text-xs text-gray-600">This month</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Custom Reports</h4>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export Report
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <FileCheck className="h-5 w-5 mb-2" />
                    <span className="font-medium">Completion Analysis</span>
                    <span className="text-sm text-gray-600">Detailed completion metrics</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <Users className="h-5 w-5 mb-2" />
                    <span className="font-medium">Signer Performance</span>
                    <span className="text-sm text-gray-600">Individual signer metrics</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <Shield className="h-5 w-5 mb-2" />
                    <span className="font-medium">Security Audit</span>
                    <span className="text-sm text-gray-600">Security events and compliance</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enterprise Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Enterprise System Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">CRM Integrations</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <Globe className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Salesforce</p>
                          <p className="text-sm text-gray-600">Sync documents with opportunities</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded">
                          <Globe className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">HubSpot</p>
                          <p className="text-sm text-gray-600">Integrate with deals and contacts</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>

                  <h4 className="font-medium">Productivity Suites</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded">
                          <Globe className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Microsoft 365</p>
                          <p className="text-sm text-gray-600">SharePoint and Teams integration</p>
                        </div>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded">
                          <Globe className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Google Workspace</p>
                          <p className="text-sm text-gray-600">Drive and Gmail integration</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Business Systems</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded">
                          <Globe className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">NetSuite</p>
                          <p className="text-sm text-gray-600">ERP and financial integration</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded">
                          <Globe className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">SAP</p>
                          <p className="text-sm text-gray-600">Enterprise resource planning</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>

                  <h4 className="font-medium">API Management</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Webhook URL</p>
                        <Button variant="outline" size="sm">Test</Button>
                      </div>
                      <Input placeholder="https://api.yourcompany.com/webhook" />
                      <p className="text-xs text-gray-600 mt-1">
                        Receive real-time document status updates
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium mb-2">API Key</p>
                      <div className="flex gap-2">
                        <Input type="password" value="sk_live_..." readOnly />
                        <Button variant="outline" size="sm">Regenerate</Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Use this key for API access to your documents
                      </p>
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
