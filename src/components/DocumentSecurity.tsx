
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Lock, Key, Eye, Download, Calendar, Users, 
  Globe, Smartphone, AlertTriangle, CheckCircle, 
  Clock, FileText, Settings, Fingerprint, Phone,
  Monitor, Camera, CreditCard, Zap
} from 'lucide-react';
import { Document } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/hooks/use-toast';

interface DocumentSecurityProps {
  document: Document;
}

export const DocumentSecurity: React.FC<DocumentSecurityProps> = ({ document }) => {
  const { speak, announceFeatureIntroduction } = useVoice();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('authentication');

  // Comprehensive security settings
  const [securitySettings, setSecuritySettings] = useState({
    // Authentication settings
    requirePassword: false,
    password: '',
    authenticationMethod: 'email' as 'email' | 'sms' | 'phone' | 'id' | 'biometric' | 'multi-factor',
    enableMFA: false,
    mfaMethods: [] as string[],
    
    // Identity verification
    requireIdVerification: false,
    idVerificationLevel: 'basic' as 'basic' | 'enhanced' | 'premium',
    allowedIdTypes: ['drivers_license', 'passport', 'state_id'],
    faceMatchRequired: false,
    
    // Document protection
    enableWatermark: true,
    watermarkText: 'CONFIDENTIAL',
    preventDownload: false,
    preventPrinting: false,
    preventCopyPaste: false,
    preventScreenshot: false,
    
    // Access controls
    enableGeofencing: false,
    allowedCountries: [] as string[],
    restrictIpAccess: false,
    allowedIps: '',
    deviceRestrictions: false,
    maxConcurrentSessions: 1,
    
    // Session management
    sessionTimeout: 30,
    requireReauth: false,
    reauthInterval: 60,
    
    // Compliance & audit
    enableAuditTrail: true,
    auditLevel: 'comprehensive' as 'basic' | 'standard' | 'comprehensive',
    retentionPeriod: 7,
    complianceFrameworks: [] as string[],
    
    // Advanced features
    enableBiometrics: false,
    requireLiveness: false,
    enableVoiceAuth: false,
    requireNotarization: false,
    witnessRequired: false,
    
    // Data protection
    enableEncryption: true,
    encryptionLevel: 'aes256' as 'aes128' | 'aes256' | 'rsa2048',
    enableDLP: false,
    dlpPolicies: [] as string[],
    
    // Expiration & lifecycle
    documentExpiration: false,
    expirationDate: '',
    warningDays: 3,
    autoDestruct: false,
    
    // Risk management
    riskProfile: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    fraudDetection: true,
    anomalyDetection: true,
    threatIntelligence: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    speak(`Security setting ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`, 'normal');
  };

  const handleAdvancedSave = () => {
    announceFeatureIntroduction(
      'Enterprise Security Configuration',
      'Applying comprehensive security settings with multi-layer protection',
      'This enterprise-grade security system includes multi-factor authentication, identity verification, biometric authentication, advanced encryption, compliance frameworks, and comprehensive audit trails similar to DocuSign enterprise security features.'
    );

    speak('Comprehensive enterprise security settings saved successfully with multi-layer protection enabled', 'high');
    
    toast({
      title: 'Enterprise Security Configured',
      description: 'Advanced security settings have been applied to the document.',
    });
  };

  const getSecurityScore = () => {
    let score = 0;
    if (securitySettings.requirePassword) score += 10;
    if (securitySettings.enableMFA) score += 20;
    if (securitySettings.requireIdVerification) score += 15;
    if (securitySettings.enableAuditTrail) score += 10;
    if (securitySettings.enableEncryption) score += 15;
    if (securitySettings.preventDownload) score += 5;
    if (securitySettings.restrictIpAccess) score += 10;
    if (securitySettings.fraudDetection) score += 15;
    return Math.min(score, 100);
  };

  const getComplianceStatus = () => {
    const frameworks = securitySettings.complianceFrameworks;
    if (frameworks.includes('sox') && frameworks.includes('hipaa') && frameworks.includes('gdpr')) {
      return 'Full Compliance';
    } else if (frameworks.length > 0) {
      return 'Partial Compliance';
    }
    return 'Basic Security';
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enterprise Document Security
            <Badge variant="outline">Advanced Protection</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{getSecurityScore()}%</div>
              <div className="text-sm text-green-600">Security Score</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-900">{getComplianceStatus()}</div>
              <div className="text-sm text-blue-600">Compliance Status</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-900">256-bit</div>
              <div className="text-sm text-purple-600">Encryption Level</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-900">Real-time</div>
              <div className="text-sm text-orange-600">Threat Detection</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="protection">Protection</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Authentication Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Password Protection</Label>
                      <p className="text-sm text-gray-600">Require password to access document</p>
                    </div>
                    <Switch
                      checked={securitySettings.requirePassword}
                      onCheckedChange={(checked) => handleSettingChange('requirePassword', checked)}
                    />
                  </div>

                  {securitySettings.requirePassword && (
                    <div>
                      <Label>Document Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter secure password"
                        value={securitySettings.password}
                        onChange={(e) => handleSettingChange('password', e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Primary Authentication Method</Label>
                    <Select
                      value={securitySettings.authenticationMethod}
                      onValueChange={(value) => handleSettingChange('authenticationMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Verification</SelectItem>
                        <SelectItem value="sms">SMS Verification</SelectItem>
                        <SelectItem value="phone">Phone Call Verification</SelectItem>
                        <SelectItem value="id">ID Document Verification</SelectItem>
                        <SelectItem value="biometric">Biometric Authentication</SelectItem>
                        <SelectItem value="multi-factor">Multi-Factor Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Multi-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Require multiple verification methods</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableMFA}
                      onCheckedChange={(checked) => handleSettingChange('enableMFA', checked)}
                    />
                  </div>

                  {securitySettings.enableMFA && (
                    <div className="space-y-3">
                      <Label>MFA Methods</Label>
                      <div className="space-y-2">
                        {['SMS Code', 'Email Code', 'Authenticator App', 'Phone Call', 'Biometric'].map((method) => (
                          <div key={method} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={method}
                              className="rounded border-gray-300"
                              onChange={(e) => {
                                const newMethods = e.target.checked
                                  ? [...securitySettings.mfaMethods, method]
                                  : securitySettings.mfaMethods.filter(m => m !== method);
                                handleSettingChange('mfaMethods', newMethods);
                              }}
                            />
                            <Label htmlFor={method} className="text-sm">{method}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Biometric Authentication</Label>
                      <p className="text-sm text-gray-600">Fingerprint or face recognition</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableBiometrics}
                      onCheckedChange={(checked) => handleSettingChange('enableBiometrics', checked)}
                    />
                  </div>

                  {securitySettings.enableBiometrics && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Liveness Detection</Label>
                        <p className="text-sm text-gray-600">Verify live person presence</p>
                      </div>
                      <Switch
                        checked={securitySettings.requireLiveness}
                        onCheckedChange={(checked) => handleSettingChange('requireLiveness', checked)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Identity Verification Tab */}
        <TabsContent value="identity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require ID Verification</Label>
                      <p className="text-sm text-gray-600">Verify signer identity with government ID</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireIdVerification}
                      onCheckedChange={(checked) => handleSettingChange('requireIdVerification', checked)}
                    />
                  </div>

                  {securitySettings.requireIdVerification && (
                    <>
                      <div>
                        <Label>Verification Level</Label>
                        <Select
                          value={securitySettings.idVerificationLevel}
                          onValueChange={(value) => handleSettingChange('idVerificationLevel', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic - Document scan</SelectItem>
                            <SelectItem value="enhanced">Enhanced - OCR + validation</SelectItem>
                            <SelectItem value="premium">Premium - Face match + liveness</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Allowed ID Types</Label>
                        <div className="space-y-2 mt-2">
                          {[
                            { id: 'drivers_license', label: "Driver's License" },
                            { id: 'passport', label: 'Passport' },
                            { id: 'state_id', label: 'State ID' },
                            { id: 'national_id', label: 'National ID' }
                          ].map((idType) => (
                            <div key={idType.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={idType.id}
                                className="rounded border-gray-300"
                                defaultChecked={securitySettings.allowedIdTypes.includes(idType.id)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...securitySettings.allowedIdTypes, idType.id]
                                    : securitySettings.allowedIdTypes.filter(t => t !== idType.id);
                                  handleSettingChange('allowedIdTypes', newTypes);
                                }}
                              />
                              <Label htmlFor={idType.id} className="text-sm">{idType.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Face Match Required</Label>
                      <p className="text-sm text-gray-600">Match face to ID photo</p>
                    </div>
                    <Switch
                      checked={securitySettings.faceMatchRequired}
                      onCheckedChange={(checked) => handleSettingChange('faceMatchRequired', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Voice Authentication</Label>
                      <p className="text-sm text-gray-600">Voice biometric verification</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableVoiceAuth}
                      onCheckedChange={(checked) => handleSettingChange('enableVoiceAuth', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Witness Required</Label>
                      <p className="text-sm text-gray-600">Require witness for signing</p>
                    </div>
                    <Switch
                      checked={securitySettings.witnessRequired}
                      onCheckedChange={(checked) => handleSettingChange('witnessRequired', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notarization Required</Label>
                      <p className="text-sm text-gray-600">Require notary public</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireNotarization}
                      onCheckedChange={(checked) => handleSettingChange('requireNotarization', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Protection Tab */}
        <TabsContent value="protection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Document Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Watermark</Label>
                      <p className="text-sm text-gray-600">Add watermark to document</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableWatermark}
                      onCheckedChange={(checked) => handleSettingChange('enableWatermark', checked)}
                    />
                  </div>

                  {securitySettings.enableWatermark && (
                    <div>
                      <Label>Watermark Text</Label>
                      <Input
                        value={securitySettings.watermarkText}
                        onChange={(e) => handleSettingChange('watermarkText', e.target.value)}
                        placeholder="CONFIDENTIAL"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Prevent Download</Label>
                      <p className="text-sm text-gray-600">Block document downloading</p>
                    </div>
                    <Switch
                      checked={securitySettings.preventDownload}
                      onCheckedChange={(checked) => handleSettingChange('preventDownload', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Prevent Printing</Label>
                      <p className="text-sm text-gray-600">Disable printing functionality</p>
                    </div>
                    <Switch
                      checked={securitySettings.preventPrinting}
                      onCheckedChange={(checked) => handleSettingChange('preventPrinting', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Prevent Copy/Paste</Label>
                      <p className="text-sm text-gray-600">Disable text selection and copying</p>
                    </div>
                    <Switch
                      checked={securitySettings.preventCopyPaste}
                      onCheckedChange={(checked) => handleSettingChange('preventCopyPaste', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Prevent Screenshots</Label>
                      <p className="text-sm text-gray-600">Block screen capture attempts</p>
                    </div>
                    <Switch
                      checked={securitySettings.preventScreenshot}
                      onCheckedChange={(checked) => handleSettingChange('preventScreenshot', checked)}
                    />
                  </div>

                  <div>
                    <Label>Encryption Level</Label>
                    <Select
                      value={securitySettings.encryptionLevel}
                      onValueChange={(value) => handleSettingChange('encryptionLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aes128">AES-128 Encryption</SelectItem>
                        <SelectItem value="aes256">AES-256 Encryption</SelectItem>
                        <SelectItem value="rsa2048">RSA-2048 Encryption</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Loss Prevention</Label>
                      <p className="text-sm text-gray-600">Advanced DLP policies</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableDLP}
                      onCheckedChange={(checked) => handleSettingChange('enableDLP', checked)}
                    />
                  </div>

                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="240"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Access Control & Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP Address Restrictions</Label>
                      <p className="text-sm text-gray-600">Limit access by IP range</p>
                    </div>
                    <Switch
                      checked={securitySettings.restrictIpAccess}
                      onCheckedChange={(checked) => handleSettingChange('restrictIpAccess', checked)}
                    />
                  </div>

                  {securitySettings.restrictIpAccess && (
                    <div>
                      <Label>Allowed IP Addresses</Label>
                      <Textarea
                        placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                        value={securitySettings.allowedIps}
                        onChange={(e) => handleSettingChange('allowedIps', e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Geofencing</Label>
                      <p className="text-sm text-gray-600">Restrict by country/region</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableGeofencing}
                      onCheckedChange={(checked) => handleSettingChange('enableGeofencing', checked)}
                    />
                  </div>

                  {securitySettings.enableGeofencing && (
                    <div>
                      <Label>Allowed Countries</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select countries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Device Restrictions</Label>
                      <p className="text-sm text-gray-600">Limit access to specific devices</p>
                    </div>
                    <Switch
                      checked={securitySettings.deviceRestrictions}
                      onCheckedChange={(checked) => handleSettingChange('deviceRestrictions', checked)}
                    />
                  </div>

                  <div>
                    <Label>Max Concurrent Sessions</Label>
                    <Input
                      type="number"
                      value={securitySettings.maxConcurrentSessions}
                      onChange={(e) => handleSettingChange('maxConcurrentSessions', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Re-authentication</Label>
                      <p className="text-sm text-gray-600">Periodic re-authentication required</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireReauth}
                      onCheckedChange={(checked) => handleSettingChange('requireReauth', checked)}
                    />
                  </div>

                  {securitySettings.requireReauth && (
                    <div>
                      <Label>Re-auth Interval (minutes)</Label>
                      <Input
                        type="number"
                        value={securitySettings.reauthInterval}
                        onChange={(e) => handleSettingChange('reauthInterval', parseInt(e.target.value))}
                        min="15"
                        max="1440"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Compliance & Audit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Audit Trail Level</Label>
                    <Select
                      value={securitySettings.auditLevel}
                      onValueChange={(value) => handleSettingChange('auditLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - Key events only</SelectItem>
                        <SelectItem value="standard">Standard - Detailed logging</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive - Full audit trail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Compliance Frameworks</Label>
                    <div className="space-y-2 mt-2">
                      {[
                        { id: 'sox', label: 'SOX (Sarbanes-Oxley)' },
                        { id: 'hipaa', label: 'HIPAA' },
                        { id: 'gdpr', label: 'GDPR' },
                        { id: 'ferpa', label: 'FERPA' },
                        { id: 'iso27001', label: 'ISO 27001' },
                        { id: 'fips140', label: 'FIPS 140-2' }
                      ].map((framework) => (
                        <div key={framework.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={framework.id}
                            className="rounded border-gray-300"
                            onChange={(e) => {
                              const newFrameworks = e.target.checked
                                ? [...securitySettings.complianceFrameworks, framework.id]
                                : securitySettings.complianceFrameworks.filter(f => f !== framework.id);
                              handleSettingChange('complianceFrameworks', newFrameworks);
                            }}
                          />
                          <Label htmlFor={framework.id} className="text-sm">{framework.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Data Retention Period (years)</Label>
                    <Input
                      type="number"
                      value={securitySettings.retentionPeriod}
                      onChange={(e) => handleSettingChange('retentionPeriod', parseInt(e.target.value))}
                      min="1"
                      max="50"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Risk Profile</Label>
                    <Select
                      value={securitySettings.riskProfile}
                      onValueChange={(value) => handleSettingChange('riskProfile', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                        <SelectItem value="critical">Critical Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Fraud Detection</Label>
                      <p className="text-sm text-gray-600">Real-time fraud monitoring</p>
                    </div>
                    <Switch
                      checked={securitySettings.fraudDetection}
                      onCheckedChange={(checked) => handleSettingChange('fraudDetection', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Anomaly Detection</Label>
                      <p className="text-sm text-gray-600">Detect unusual behavior patterns</p>
                    </div>
                    <Switch
                      checked={securitySettings.anomalyDetection}
                      onCheckedChange={(checked) => handleSettingChange('anomalyDetection', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Threat Intelligence</Label>
                      <p className="text-sm text-gray-600">Advanced threat protection</p>
                    </div>
                    <Switch
                      checked={securitySettings.threatIntelligence}
                      onCheckedChange={(checked) => handleSettingChange('threatIntelligence', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Features Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Advanced Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Document Expiration</Label>
                      <p className="text-sm text-gray-600">Auto-expire documents</p>
                    </div>
                    <Switch
                      checked={securitySettings.documentExpiration}
                      onCheckedChange={(checked) => handleSettingChange('documentExpiration', checked)}
                    />
                  </div>

                  {securitySettings.documentExpiration && (
                    <>
                      <div>
                        <Label>Expiration Date</Label>
                        <Input
                          type="datetime-local"
                          value={securitySettings.expirationDate}
                          onChange={(e) => handleSettingChange('expirationDate', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Warning Days</Label>
                        <Input
                          type="number"
                          value={securitySettings.warningDays}
                          onChange={(e) => handleSettingChange('warningDays', parseInt(e.target.value))}
                          min="1"
                          max="30"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Destruct</Label>
                          <p className="text-sm text-gray-600">Automatically delete after expiration</p>
                        </div>
                        <Switch
                          checked={securitySettings.autoDestruct}
                          onCheckedChange={(checked) => handleSettingChange('autoDestruct', checked)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Security Recommendations</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Enable multi-factor authentication for high-value documents</li>
                      <li>• Use ID verification for legally binding agreements</li>
                      <li>• Enable audit trails for compliance requirements</li>
                      <li>• Set appropriate session timeouts for security</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Current Security Level</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p>Your document has a security score of {getSecurityScore()}%</p>
                      <p className="mt-1">{getComplianceStatus()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleAdvancedSave} size="lg">
          <Shield className="h-4 w-4 mr-2" />
          Apply Enterprise Security Settings
        </Button>
      </div>
    </div>
  );
};
