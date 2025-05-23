
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Volume2, Trash2, Download, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { speak, stop, settings, updateSettings } = useVoice();
  const { documents } = useDocument();

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      speak("Welcome to settings! Here you can adjust my voice speed and pitch, export your documents, or reset your data. Try adjusting the sliders to customize how I sound. What would you like to configure?", 'normal');
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop]);

  const handleVoiceTest = () => {
    speak("This is how I sound with your current settings. You can adjust the speed and pitch sliders to customize my voice to your preference.", 'high');
  };

  const handleSpeedChange = (value: number[]) => {
    updateSettings({ speed: value[0] });
    speak("Voice speed adjusted.", 'normal');
  };

  const handlePitchChange = (value: number[]) => {
    updateSettings({ pitch: value[0] });
    speak("Voice pitch adjusted.", 'normal');
  };

  const handleVolumeChange = (value: number[]) => {
    updateSettings({ volume: value[0] });
    speak("Voice volume adjusted.", 'normal');
  };

  const handleToggleVoice = (enabled: boolean) => {
    updateSettings({ enabled });
    if (enabled) {
      speak("Voice assistant enabled! I'm here to help guide you through your document workflows.", 'high');
    } else {
      toast({
        title: "Voice assistant disabled",
        description: "You can re-enable it anytime in settings"
      });
    }
  };

  const handleExportData = () => {
    const data = {
      documents: documents,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docusign-clone-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    speak("Your data has been exported successfully! The backup file contains all your documents and settings.", 'normal');
    
    toast({
      title: "Data exported",
      description: "Backup file downloaded successfully"
    });
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      speak("All data has been cleared. You'll be redirected to the home page to start fresh.", 'high');
      
      toast({
        title: "Data cleared",
        description: "All documents and settings have been reset"
      });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  };

  const handleResetTutorial = () => {
    speak("Tutorial reset! Next time you visit different pages, I'll provide full guidance as if it's your first time. This is helpful if you want to hear all the instructions again.", 'normal');
    
    toast({
      title: "Tutorial reset",
      description: "Voice guidance will restart from the beginning"
    });
  };

  const getStorageUsage = () => {
    try {
      const documentsData = localStorage.getItem('docuSignClone_documents') || '[]';
      const settingsData = localStorage.getItem('docuSignClone_voiceSettings') || '{}';
      const totalSize = new Blob([documentsData + settingsData]).size;
      return (totalSize / 1024).toFixed(2); // KB
    } catch {
      return '0';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-600">Customize your DocuSign Clone experience</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Voice Assistant
              </CardTitle>
              <CardDescription>
                Customize how the voice assistant sounds and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Enable Voice Assistant</label>
                  <p className="text-sm text-gray-600">Get voice guidance throughout the app</p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={handleToggleVoice}
                />
              </div>

              {settings.enabled && (
                <>
                  <div>
                    <label className="font-medium mb-2 block">Speech Speed</label>
                    <Slider
                      value={[settings.speed]}
                      onValueChange={handleSpeedChange}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Slow</span>
                      <span>Normal</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium mb-2 block">Voice Pitch</label>
                    <Slider
                      value={[settings.pitch]}
                      onValueChange={handlePitchChange}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Low</span>
                      <span>Normal</span>
                      <span>High</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium mb-2 block">Volume</label>
                    <Slider
                      value={[settings.volume]}
                      onValueChange={handleVolumeChange}
                      min={0.1}
                      max={1}
                      step={0.1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Quiet</span>
                      <span>Normal</span>
                      <span>Loud</span>
                    </div>
                  </div>

                  <Button onClick={handleVoiceTest} variant="outline" className="w-full">
                    Test Voice Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your documents and application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{getStorageUsage()}</div>
                  <div className="text-sm text-gray-600">KB Used</div>
                </div>
              </div>

              <div className="space-y-2">
                <Button onClick={handleExportData} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                
                <Button onClick={handleResetTutorial} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Tutorial
                </Button>
                
                <Button 
                  onClick={handleClearData} 
                  variant="destructive" 
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Technical details about your browser and application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium text-sm">Speech Synthesis</label>
                  <div className="mt-1">
                    <Badge variant={typeof window !== 'undefined' && 'speechSynthesis' in window ? 'default' : 'destructive'}>
                      {typeof window !== 'undefined' && 'speechSynthesis' in window ? 'Supported' : 'Not Supported'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-sm">Local Storage</label>
                  <div className="mt-1">
                    <Badge variant={typeof window !== 'undefined' && 'localStorage' in window ? 'default' : 'destructive'}>
                      {typeof window !== 'undefined' && 'localStorage' in window ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-sm">File API</label>
                  <div className="mt-1">
                    <Badge variant={typeof window !== 'undefined' && 'FileReader' in window ? 'default' : 'destructive'}>
                      {typeof window !== 'undefined' && 'FileReader' in window ? 'Supported' : 'Not Supported'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default Settings;
