
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Lock, Key, Eye, Download, Calendar, Users } from 'lucide-react';
import { Document } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';

interface DocumentSecurityProps {
  document: Document;
}

export const DocumentSecurity: React.FC<DocumentSecurityProps> = ({ document }) => {
  const { speak } = useVoice();
  const [securitySettings, setSecuritySettings] = useState({
    requirePassword: false,
    password: '',
    enableWatermark: true,
    preventDownload: false,
    enableReminders: true,
    reminderFrequency: 'daily',
    expirationDate: '',
    allowDelegation: true,
    requireIdVerification: false,
    enableAuditTrail: true,
    restrictIpAccess: false,
    allowedIps: '',
    requireSmsVerification: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    speak(`Security setting ${key} updated`, 'normal');
  };

  const handleSaveSettings = () => {
    // Here you would typically save to your backend
    speak('Security settings saved successfully', 'high');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Document Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Protection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <Label>Password Protection</Label>
              </div>
              <Switch
                checked={securitySettings.requirePassword}
                onCheckedChange={(checked) => handleSettingChange('requirePassword', checked)}
              />
            </div>
            {securitySettings.requirePassword && (
              <Input
                type="password"
                placeholder="Enter document password"
                value={securitySettings.password}
                onChange={(e) => handleSettingChange('password', e.target.value)}
              />
            )}
          </div>

          {/* Watermark */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <Label>Enable Watermark</Label>
            </div>
            <Switch
              checked={securitySettings.enableWatermark}
              onCheckedChange={(checked) => handleSettingChange('enableWatermark', checked)}
            />
          </div>

          {/* Download Prevention */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <Label>Prevent Download</Label>
            </div>
            <Switch
              checked={securitySettings.preventDownload}
              onCheckedChange={(checked) => handleSettingChange('preventDownload', checked)}
            />
          </div>

          {/* ID Verification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <Label>Require ID Verification</Label>
            </div>
            <Switch
              checked={securitySettings.requireIdVerification}
              onCheckedChange={(checked) => handleSettingChange('requireIdVerification', checked)}
            />
          </div>

          {/* SMS Verification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <Label>SMS Verification</Label>
            </div>
            <Switch
              checked={securitySettings.requireSmsVerification}
              onCheckedChange={(checked) => handleSettingChange('requireSmsVerification', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Document Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Expiration Date */}
          <div className="space-y-2">
            <Label>Document Expiration</Label>
            <Input
              type="datetime-local"
              value={securitySettings.expirationDate}
              onChange={(e) => handleSettingChange('expirationDate', e.target.value)}
            />
          </div>

          {/* Reminders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Enable Reminders</Label>
              <Switch
                checked={securitySettings.enableReminders}
                onCheckedChange={(checked) => handleSettingChange('enableReminders', checked)}
              />
            </div>
            {securitySettings.enableReminders && (
              <Select
                value={securitySettings.reminderFrequency}
                onValueChange={(value) => handleSettingChange('reminderFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Delegation */}
          <div className="flex items-center justify-between">
            <Label>Allow Signer Delegation</Label>
            <Switch
              checked={securitySettings.allowDelegation}
              onCheckedChange={(checked) => handleSettingChange('allowDelegation', checked)}
            />
          </div>

          {/* IP Restriction */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Restrict IP Access</Label>
              <Switch
                checked={securitySettings.restrictIpAccess}
                onCheckedChange={(checked) => handleSettingChange('restrictIpAccess', checked)}
              />
            </div>
            {securitySettings.restrictIpAccess && (
              <Input
                placeholder="Enter allowed IP addresses (comma separated)"
                value={securitySettings.allowedIps}
                onChange={(e) => handleSettingChange('allowedIps', e.target.value)}
              />
            )}
          </div>

          {/* Audit Trail */}
          <div className="flex items-center justify-between">
            <Label>Enable Audit Trail</Label>
            <Switch
              checked={securitySettings.enableAuditTrail}
              onCheckedChange={(checked) => handleSettingChange('enableAuditTrail', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings} className="w-full">
        Save Security Settings
      </Button>
    </div>
  );
};
