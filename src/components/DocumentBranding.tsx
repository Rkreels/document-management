
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Palette, Upload, Eye, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DocumentBranding: React.FC = () => {
  const { toast } = useToast();
  const [branding, setBranding] = useState({
    companyName: 'Your Company',
    logo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    fontFamily: 'Inter',
    showLogo: true,
    showCompanyName: true,
    customFooter: 'Powered by Your Company - All rights reserved',
    emailTemplate: 'professional'
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const colorPresets = [
    { name: 'Blue', primary: '#3b82f6', secondary: '#1e40af' },
    { name: 'Green', primary: '#10b981', secondary: '#047857' },
    { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed' },
    { name: 'Red', primary: '#ef4444', secondary: '#dc2626' },
    { name: 'Orange', primary: '#f97316', secondary: '#ea580c' },
    { name: 'Teal', primary: '#14b8a6', secondary: '#0f766e' }
  ];

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro'
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBranding(prev => ({ ...prev, logo: e.target?.result as string }));
        toast({
          title: 'Logo uploaded',
          description: 'Your company logo has been updated.'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setBranding(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    }));
  };

  const getDeviceClasses = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-80 h-96';
      case 'tablet':
        return 'w-96 h-80';
      default:
        return 'w-full h-96';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Document Branding</h2>
        <p className="text-gray-600">Customize the appearance of your documents and emails</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={branding.companyName}
                      onChange={(e) => setBranding(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Company Logo</Label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      {branding.logo && (
                        <div className="flex items-center justify-center p-4 border rounded-lg">
                          <img src={branding.logo} alt="Logo" className="max-h-16" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="font-family">Font Family</Label>
                    <select
                      id="font-family"
                      value={branding.fontFamily}
                      onChange={(e) => setBranding(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Show Logo</Label>
                      <Switch
                        checked={branding.showLogo}
                        onCheckedChange={(checked) => setBranding(prev => ({ ...prev, showLogo: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Company Name</Label>
                      <Switch
                        checked={branding.showCompanyName}
                        onCheckedChange={(checked) => setBranding(prev => ({ ...prev, showCompanyName: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Color Scheme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {colorPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        onClick={() => applyColorPreset(preset)}
                        className="h-16 flex flex-col items-center justify-center"
                      >
                        <div className="flex gap-1 mb-1">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        <span className="text-xs">{preset.name}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-12 h-10 border rounded"
                        />
                        <Input
                          value={branding.primaryColor}
                          onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={branding.secondaryColor}
                          onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-12 h-10 border rounded"
                        />
                        <Input
                          value={branding.secondaryColor}
                          onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Template Style</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['professional', 'modern', 'minimal'].map((template) => (
                        <Button
                          key={template}
                          variant={branding.emailTemplate === template ? 'default' : 'outline'}
                          onClick={() => setBranding(prev => ({ ...prev, emailTemplate: template }))}
                          className="capitalize"
                        >
                          {template}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom-footer">Custom Footer</Label>
                    <Textarea
                      id="custom-footer"
                      value={branding.customFooter}
                      onChange={(e) => setBranding(prev => ({ ...prev, customFooter: e.target.value }))}
                      placeholder="Enter custom footer text..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button 
            className="w-full" 
            onClick={() => {
              toast({
                title: 'Branding saved',
                description: 'Your branding settings have been updated successfully.'
              });
            }}
          >
            Save Branding Settings
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('tablet')}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto border rounded-lg overflow-hidden ${getDeviceClasses()}`}>
                <div 
                  className="h-full p-6"
                  style={{ 
                    fontFamily: branding.fontFamily,
                    backgroundColor: '#ffffff'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      {branding.showLogo && branding.logo && (
                        <img src={branding.logo} alt="Logo" className="h-8" />
                      )}
                      {branding.showCompanyName && (
                        <h1 
                          className="text-xl font-bold"
                          style={{ color: branding.primaryColor }}
                        >
                          {branding.companyName}
                        </h1>
                      )}
                    </div>
                    <Badge style={{ backgroundColor: branding.secondaryColor }}>
                      Pending Signature
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Employment Agreement</h2>
                    <p className="text-gray-600 text-sm">
                      Please review and sign this document. Your signature is required to proceed.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>

                    <Button 
                      className="w-full mt-4"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Review & Sign
                    </Button>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                    {branding.customFooter}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
