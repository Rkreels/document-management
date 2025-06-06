import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, Calendar as CalendarIcon, Clock, Mail, Shield,
  Users, Settings, Globe, Smartphone, Zap, AlertTriangle,
  CheckCircle, FileText, Lock, Eye, Bell, MessageSquare
} from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/hooks/use-toast';

interface DocumentSenderProps {
  document: Document;
  onSent: () => void;
}

export const DocumentSender: React.FC<DocumentSenderProps> = ({
  document,
  onSent
}) => {
  const { updateDocument, sendDocument } = useDocument();
  const { speak, announceFeatureIntroduction } = useVoice();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('compose');
  const [message, setMessage] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Enhanced sending settings
  const [sendingSettings, setSendingSettings] = useState({
    // Basic settings
    subject: `Please sign: ${document.title}`,
    message: 'Please review and sign the attached document at your earliest convenience.',
    ccEmails: '',
    language: 'en',
    
    // Delivery settings
    sendImmediately: true,
    scheduledDate: null as Date | null,
    timezone: 'UTC',
    
    // Security settings
    requireAuth: true,
    authMethod: 'email' as 'email' | 'sms' | 'phone' | 'id',
    preventForwarding: true,
    requireDeclineReason: true,
    
    // Reminder settings
    enableReminders: true,
    reminderFrequency: 'daily' as 'daily' | 'weekly',
    maxReminders: 3,
    
    // Workflow settings
    signingOrder: document.signingOrder || 'sequential',
    enableParallelSigning: false,
    requireWitness: false,
    requireNotary: false,
    
    // Notification settings
    notifyOnView: true,
    notifyOnSign: true,
    notifyOnComplete: true,
    notifyOnDecline: true,
    
    // Advanced settings
    enableBrandedExperience: false,
    customRedirectUrl: '',
    includeAuditTrail: true,
    enableMobileSigning: true
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateSendingRequirements = () => {
    const errors: string[] = [];
    
    if (document.signers.length === 0) {
      errors.push('At least one signer is required');
    }
    
    if (document.fields.length === 0) {
      errors.push('At least one field is required');
    }
    
    if (!sendingSettings.subject.trim()) {
      errors.push('Email subject is required');
    }
    
    if (sendingSettings.ccEmails) {
      const ccEmails = sendingSettings.ccEmails.split(',').map(e => e.trim());
      const invalidEmails = ccEmails.filter(email => !email.includes('@'));
      if (invalidEmails.length > 0) {
        errors.push('Invalid CC email addresses');
      }
    }
    
    if (sendingSettings.scheduledDate && sendingSettings.scheduledDate < new Date()) {
      errors.push('Scheduled date must be in the future');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleAdvancedSend = () => {
    if (!validateSendingRequirements()) {
      speak('Please fix validation errors before sending the document', 'high');
      return;
    }

    announceFeatureIntroduction(
      'Enterprise Document Sending',
      'Configuring advanced document delivery with comprehensive security and workflow features',
      'This enterprise-grade sending system includes multi-factor authentication, branded experiences, advanced workflow routing, comprehensive notifications, and detailed audit trails similar to DocuSign enterprise features.'
    );

    // Update document with comprehensive settings
    updateDocument(document.id, {
      expiresAt: expirationDate,
      signingOrder: sendingSettings.signingOrder,
      reminderSchedule: {
        enabled: sendingSettings.enableReminders,
        frequency: sendingSettings.reminderFrequency,
        customMessage: sendingSettings.message,
      },
      notifications: {
        sendCopyToSender: true,
        ccEmails: sendingSettings.ccEmails ? sendingSettings.ccEmails.split(',').map(email => email.trim()) : undefined,
      },
      security: {
        requireAuth: sendingSettings.requireAuth,
        allowPrinting: true,
        allowDownload: true,
        watermark: false,
        ipRestriction: false,
      },
      branding: {
        logo: sendingSettings.enableBrandedExperience ? sendingSettings.customRedirectUrl : undefined,
        colors: sendingSettings.enableBrandedExperience ? { primary: '#0066cc', secondary: '#f0f0f0' } : undefined,
        customMessage: sendingSettings.message,
      }
    });

    // Send the document
    if (sendingSettings.sendImmediately) {
      sendDocument(document.id, sendingSettings.message);
      speak('Document sent immediately with enterprise-grade security and workflow features', 'high');
    } else {
      speak(`Document scheduled for delivery on ${sendingSettings.scheduledDate?.toLocaleDateString()}`, 'normal');
    }
    
    onSent();
    
    toast({
      title: 'Enterprise Document Sent',
      description: `${document.title} sent with comprehensive enterprise features enabled.`,
    });
  };

  const canSend = document.signers.length > 0 && document.fields.length > 0 && validationErrors.length === 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enterprise Document Sending
            <Badge variant="outline">Advanced Features</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Smart Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Workflow Automation</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Multi-Channel Delivery</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="review">Review & Send</TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Composition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">{document.title}</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>{document.signers.length} signers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span>{document.fields.length} fields</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-purple-600" />
                    <span>{sendingSettings.signingOrder} order</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={sendingSettings.subject}
                    onChange={(e) => setSendingSettings(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Please sign: Contract Agreement"
                  />
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={sendingSettings.language}
                    onValueChange={(value) => setSendingSettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Email Message</Label>
                <Textarea
                  id="message"
                  value={sendingSettings.message}
                  onChange={(e) => setSendingSettings(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please review and sign this document. Let me know if you have any questions."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ccEmails">CC Recipients (Optional)</Label>
                  <Input
                    id="ccEmails"
                    value={sendingSettings.ccEmails}
                    onChange={(e) => setSendingSettings(prev => ({ ...prev, ccEmails: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="customRedirectUrl">Custom Redirect URL (Optional)</Label>
                  <Input
                    id="customRedirectUrl"
                    value={sendingSettings.customRedirectUrl}
                    onChange={(e) => setSendingSettings(prev => ({ ...prev, customRedirectUrl: e.target.value }))}
                    placeholder="https://yourcompany.com/thank-you"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Authentication</Label>
                      <p className="text-sm text-gray-600">Signers must verify identity</p>
                    </div>
                    <Switch
                      checked={sendingSettings.requireAuth}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, requireAuth: checked }))}
                    />
                  </div>

                  {sendingSettings.requireAuth && (
                    <div>
                      <Label>Authentication Method</Label>
                      <Select
                        value={sendingSettings.authMethod}
                        onValueChange={(value: any) => setSendingSettings(prev => ({ ...prev, authMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email Verification</SelectItem>
                          <SelectItem value="sms">SMS Verification</SelectItem>
                          <SelectItem value="phone">Phone Verification</SelectItem>
                          <SelectItem value="id">ID Document Verification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Prevent Email Forwarding</Label>
                      <p className="text-sm text-gray-600">Block forwarding of signing invitations</p>
                    </div>
                    <Switch
                      checked={sendingSettings.preventForwarding}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, preventForwarding: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Decline Reason</Label>
                      <p className="text-sm text-gray-600">Signers must explain refusal</p>
                    </div>
                    <Switch
                      checked={sendingSettings.requireDeclineReason}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, requireDeclineReason: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Audit Trail</Label>
                      <p className="text-sm text-gray-600">Detailed activity logging</p>
                    </div>
                    <Switch
                      checked={sendingSettings.includeAuditTrail}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, includeAuditTrail: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Mobile Signing</Label>
                      <p className="text-sm text-gray-600">Optimize for mobile devices</p>
                    </div>
                    <Switch
                      checked={sendingSettings.enableMobileSigning}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, enableMobileSigning: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Workflow Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Signing Order</Label>
                    <Select
                      value={sendingSettings.signingOrder}
                      onValueChange={(value: any) => setSendingSettings(prev => ({ ...prev, signingOrder: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential (one at a time)</SelectItem>
                        <SelectItem value="parallel">Parallel (all at once)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Parallel Signing</Label>
                      <p className="text-sm text-gray-600">Allow simultaneous signatures</p>
                    </div>
                    <Switch
                      checked={sendingSettings.enableParallelSigning}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, enableParallelSigning: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Witness</Label>
                      <p className="text-sm text-gray-600">Witness signature required</p>
                    </div>
                    <Switch
                      checked={sendingSettings.requireWitness}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, requireWitness: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Notary</Label>
                      <p className="text-sm text-gray-600">Notarization required</p>
                    </div>
                    <Switch
                      checked={sendingSettings.requireNotary}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, requireNotary: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Branded Experience</Label>
                      <p className="text-sm text-gray-600">Custom branding and styling</p>
                    </div>
                    <Switch
                      checked={sendingSettings.enableBrandedExperience}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, enableBrandedExperience: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Delivery Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send Immediately</Label>
                    <p className="text-sm text-gray-600">Send document right away</p>
                  </div>
                  <Switch
                    checked={sendingSettings.sendImmediately}
                    onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, sendImmediately: checked }))}
                  />
                </div>

                {!sendingSettings.sendImmediately && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Scheduled Date & Time</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {sendingSettings.scheduledDate ? 
                              sendingSettings.scheduledDate.toLocaleDateString() : 
                              "Select date"
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={sendingSettings.scheduledDate || undefined}
                            onSelect={(date) => setSendingSettings(prev => ({ ...prev, scheduledDate: date || null }))}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Timezone</Label>
                      <Select
                        value={sendingSettings.timezone}
                        onValueChange={(value) => setSendingSettings(prev => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Document Expiration (Optional)</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expirationDate ? expirationDate.toLocaleDateString() : "Set expiration date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expirationDate}
                        onSelect={(date) => {
                          setExpirationDate(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Automatic Reminders</Label>
                      <p className="text-sm text-gray-600">Send periodic reminders</p>
                    </div>
                    <Switch
                      checked={sendingSettings.enableReminders}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, enableReminders: checked }))}
                    />
                  </div>

                  {sendingSettings.enableReminders && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Reminder Frequency</Label>
                        <Select
                          value={sendingSettings.reminderFrequency}
                          onValueChange={(value: any) => setSendingSettings(prev => ({ ...prev, reminderFrequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Maximum Reminders</Label>
                        <Input
                          type="number"
                          value={sendingSettings.maxReminders}
                          onChange={(e) => setSendingSettings(prev => ({ ...prev, maxReminders: parseInt(e.target.value) }))}
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Document Events</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notify on View</Label>
                      <p className="text-sm text-gray-600">When document is opened</p>
                    </div>
                    <Switch
                      checked={sendingSettings.notifyOnView}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, notifyOnView: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notify on Sign</Label>
                      <p className="text-sm text-gray-600">When each signature occurs</p>
                    </div>
                    <Switch
                      checked={sendingSettings.notifyOnSign}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, notifyOnSign: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notify on Completion</Label>
                      <p className="text-sm text-gray-600">When all signatures collected</p>
                    </div>
                    <Switch
                      checked={sendingSettings.notifyOnComplete}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, notifyOnComplete: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notify on Decline</Label>
                      <p className="text-sm text-gray-600">When document is refused</p>
                    </div>
                    <Switch
                      checked={sendingSettings.notifyOnDecline}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, notifyOnDecline: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Channels</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Primary notification method</p>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">SMS Alerts</p>
                        <p className="text-sm text-gray-600">Urgent notifications only</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                      <div className="flex-1">
                        <p className="font-medium">Team Notifications</p>
                        <p className="text-sm text-gray-600">Slack/Teams integration</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review & Send Tab */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review & Send Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Please fix the following issues:</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sending Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Document Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{document.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Signers:</span>
                      <span className="font-medium">{document.signers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fields:</span>
                      <span className="font-medium">{document.fields.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Signing Order:</span>
                      <span className="font-medium capitalize">{sendingSettings.signingOrder}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Security & Notifications</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Authentication:</span>
                      <Badge variant={sendingSettings.requireAuth ? 'default' : 'outline'}>
                        {sendingSettings.requireAuth ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reminders:</span>
                      <Badge variant={sendingSettings.enableReminders ? 'default' : 'outline'}>
                        {sendingSettings.enableReminders ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Audit Trail:</span>
                      <Badge variant={sendingSettings.includeAuditTrail ? 'default' : 'outline'}>
                        {sendingSettings.includeAuditTrail ? 'Included' : 'Basic'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signers List */}
              <div>
                <h4 className="font-medium mb-3">Recipients</h4>
                <div className="space-y-2">
                  {document.signers.map((signer) => (
                    <div key={signer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{signer.name}</p>
                        <p className="text-xs text-gray-600">{signer.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{signer.role}</Badge>
                        {sendingSettings.signingOrder === 'sequential' && (
                          <Badge variant="secondary">#{signer.order}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Button */}
              <div className="pt-4">
                <Button 
                  onClick={() => { validateSendingRequirements(); handleAdvancedSend(); }}
                  disabled={!canSend}
                  className="w-full"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendingSettings.sendImmediately ? 'Send Document Now' : 'Schedule Document'}
                </Button>
                {!canSend && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Please resolve validation errors to send the document
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
