
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
  Calendar, Signature, Edit3, Settings
} from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { useToast } from '@/hooks/use-toast';

interface ComprehensiveDocumentManagerProps {
  document: Document;
}

export const ComprehensiveDocumentManager: React.FC<ComprehensiveDocumentManagerProps> = ({ document }) => {
  const { updateDocument, sendDocument, sendReminder, duplicateDocument } = useDocument();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // DocuSign-like features state
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    frequency: 'daily',
    maxReminders: 3,
    customMessage: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireAuth: true,
    allowPrinting: false,
    allowDownload: true,
    watermark: false,
    ipRestriction: false,
    allowedIPs: [] as string[]
  });

  const [expirationSettings, setExpirationSettings] = useState({
    enabled: false,
    expirationDate: '',
    warningDays: 3
  });

  const handleBulkSend = () => {
    sendDocument(document.id);
    toast({
      title: 'Document Sent',
      description: `${document.title} has been sent to all signers.`,
    });
  };

  const handleDuplicate = () => {
    const newDoc = duplicateDocument(document.id);
    toast({
      title: 'Document Duplicated',
      description: `Copy of ${document.title} has been created.`,
    });
  };

  const handleSecurityUpdate = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    updateDocument(document.id, {
      security: { ...securitySettings, [key]: value }
    });
  };

  const getSigningProgress = () => {
    const signed = document.signers.filter(s => s.status === 'signed').length;
    return Math.round((signed / document.signers.length) * 100);
  };

  const getFieldProgress = () => {
    const completed = document.fields.filter(f => f.value).length;
    return Math.round((completed / Math.max(document.fields.length, 1)) * 100);
  };

  const getNextSigner = () => {
    if (document.signingOrder === 'sequential') {
      return document.signers.find(s => s.status === 'pending');
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {document.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={document.status === 'completed' ? 'default' : 'secondary'}>
                  {document.status}
                </Badge>
                <Badge variant="outline">
                  {document.signingOrder} signing
                </Badge>
                <span className="text-sm text-gray-600">
                  Created {new Date(document.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              {document.status === 'draft' && (
                <Button onClick={handleBulkSend}>
                  <Send className="h-4 w-4 mr-1" />
                  Send All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Comprehensive Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signers">Signers</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="expiration">Expiration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
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
                  <Edit3 className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Field Completion</p>
                    <p className="text-xl font-bold">{getFieldProgress()}%</p>
                    <p className="text-xs text-gray-500">
                      {document.fields.filter(f => f.value).length} of {document.fields.length} completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-xl font-bold capitalize">{document.status}</p>
                    {getNextSigner() && (
                      <p className="text-xs text-gray-500">
                        Next: {getNextSigner()?.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.signers.map((signer) => (
                  <div key={signer.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{signer.name}</p>
                      <p className="text-sm text-gray-600">{signer.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        signer.status === 'signed' ? 'default' : 
                        signer.status === 'declined' ? 'destructive' : 'secondary'
                      }>
                        {signer.status}
                      </Badge>
                      {signer.signedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(signer.signedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Signers Tab */}
        <TabsContent value="signers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {document.signers.map((signer) => (
                  <div key={signer.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{signer.name}</p>
                          <p className="text-sm text-gray-600">{signer.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{signer.role}</Badge>
                            {document.signingOrder === 'sequential' && (
                              <Badge variant="secondary">Order #{signer.order}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          signer.status === 'signed' ? 'default' : 
                          signer.status === 'declined' ? 'destructive' : 'secondary'
                        }>
                          {signer.status}
                        </Badge>
                        {signer.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => sendReminder(signer.id)}>
                            <Mail className="h-4 w-4 mr-1" />
                            Remind
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Authentication</Label>
                        <p className="text-gray-600">{signer.requireAuth || 'None'}</p>
                      </div>
                      <div>
                        <Label>Can Delegate</Label>
                        <p className="text-gray-600">{signer.canDelegate ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
                Document Security
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
                      checked={securitySettings.requireAuth}
                      onCheckedChange={(checked) => handleSecurityUpdate('requireAuth', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Printing</Label>
                      <p className="text-sm text-gray-600">Enable document printing</p>
                    </div>
                    <Switch
                      checked={securitySettings.allowPrinting}
                      onCheckedChange={(checked) => handleSecurityUpdate('allowPrinting', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Download</Label>
                      <p className="text-sm text-gray-600">Enable document download</p>
                    </div>
                    <Switch
                      checked={securitySettings.allowDownload}
                      onCheckedChange={(checked) => handleSecurityUpdate('allowDownload', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Watermark</Label>
                      <p className="text-sm text-gray-600">Add watermark to document</p>
                    </div>
                    <Switch
                      checked={securitySettings.watermark}
                      onCheckedChange={(checked) => handleSecurityUpdate('watermark', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP Restriction</Label>
                      <p className="text-sm text-gray-600">Restrict access by IP address</p>
                    </div>
                    <Switch
                      checked={securitySettings.ipRestriction}
                      onCheckedChange={(checked) => handleSecurityUpdate('ipRestriction', checked)}
                    />
                  </div>

                  {securitySettings.ipRestriction && (
                    <div>
                      <Label>Allowed IP Addresses</Label>
                      <Textarea
                        placeholder="Enter IP addresses (one per line)"
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

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Reminder Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Reminders</Label>
                  <p className="text-sm text-gray-600">Automatically send reminders to pending signers</p>
                </div>
                <Switch
                  checked={reminderSettings.enabled}
                  onCheckedChange={(checked) => setReminderSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              {reminderSettings.enabled && (
                <div className="space-y-4">
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

                  <div>
                    <Label>Custom Message</Label>
                    <Textarea
                      placeholder="Optional custom message for reminders"
                      value={reminderSettings.customMessage}
                      onChange={(e) => setReminderSettings(prev => ({ ...prev, customMessage: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiration Tab */}
        <TabsContent value="expiration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Document Expiration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Expiration</Label>
                  <p className="text-sm text-gray-600">Set an expiration date for this document</p>
                </div>
                <Switch
                  checked={expirationSettings.enabled}
                  onCheckedChange={(checked) => setExpirationSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              {expirationSettings.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Expiration Date</Label>
                    <Input
                      type="date"
                      value={expirationSettings.expirationDate}
                      onChange={(e) => setExpirationSettings(prev => ({ ...prev, expirationDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Warning Days</Label>
                    <Input
                      type="number"
                      value={expirationSettings.warningDays}
                      onChange={(e) => setExpirationSettings(prev => ({ ...prev, warningDays: parseInt(e.target.value) }))}
                      min="1"
                      max="30"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Send warning notifications this many days before expiration
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Document Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Views</p>
                      <p className="text-xl font-bold">247</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="text-xl font-bold">{getSigningProgress()}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Avg. Time to Sign</p>
                      <p className="text-xl font-bold">2.3 days</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Reminders Sent</p>
                      <p className="text-xl font-bold">12</p>
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
