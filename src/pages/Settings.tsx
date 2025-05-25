import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Volume2, Trash2, Download, RefreshCw, BookOpen, Brain, Mic, Speaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { speak, stop, settings, updateSettings, trainingState, updateTrainingState } = useVoice();
  const { documents } = useDocument();

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      speak("Welcome to settings! Here you can adjust my voice properties, configure training preferences, export your data, or reset everything. The voice training section allows you to customize your learning experience. What would you like to configure?", 'normal');
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop]);

  const handleVoiceTest = () => {
    speak("This is how I sound with your current settings. You can adjust the speed, pitch, and volume sliders to customize my voice to your preference. In training mode, I provide more detailed explanations and encouragement.", 'high');
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
      speak("Voice assistant enabled! I'm here to help guide you through your document workflows with comprehensive training support.", 'high');
    } else {
      toast({
        title: "Voice assistant disabled",
        description: "You can re-enable it anytime in settings"
      });
    }
  };

  const handleTrainingModeToggle = (enabled: boolean) => {
    updateSettings({ trainingMode: enabled });
    if (enabled) {
      speak("Training mode activated! I will now provide detailed explanations, helpful tips, and encouragement throughout your interactions. This mode is perfect for learning new features.", 'high');
    } else {
      speak("Training mode disabled. I'll provide standard guidance without extra training details.", 'normal');
    }
  };

  const handleExportData = () => {
    const data = {
      documents: documents,
      settings: settings,
      trainingProgress: trainingState,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docusign-clone-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    speak("Your data has been exported successfully! The backup file contains all your documents, settings, and training progress.", 'normal');
    
    toast({
      title: "Data exported",
      description: "Backup file downloaded successfully"
    });
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone and will reset all training progress.')) {
      localStorage.clear();
      speak("All data has been cleared, including training progress. You'll be redirected to the home page to start fresh.", 'high');
      
      toast({
        title: "Data cleared",
        description: "All documents, settings, and training progress have been reset"
      });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  };

  const handleResetTraining = () => {
    updateTrainingState({
      isTrainingActive: false,
      currentModule: '',
      currentLesson: 0,
      completedLessons: [],
      trainingPreferences: {
        autoProgress: true,
        repeatInstructions: true,
        detailedExplanations: true,
        practiceMode: false,
      }
    });
    
    speak("Training progress reset! You can now start all training modules from the beginning. This is helpful if you want to review concepts or if multiple people use this system.", 'normal');
    
    toast({
      title: "Training reset",
      description: "All training progress has been cleared"
    });
  };

  const getStorageUsage = () => {
    try {
      const documentsData = localStorage.getItem('docuSignClone_documents') || '[]';
      const settingsData = localStorage.getItem('docuSignClone_voiceSettings') || '{}';
      const trainingData = localStorage.getItem('docuSignClone_voiceTraining') || '{}';
      const totalSize = new Blob([documentsData + settingsData + trainingData]).size;
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

        <Tabs defaultValue="voice" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="voice">
              <Volume2 className="h-4 w-4 mr-2" />
              Voice Settings
            </TabsTrigger>
            <TabsTrigger value="training">
              <BookOpen className="h-4 w-4 mr-2" />
              Training
            </TabsTrigger>
            <TabsTrigger value="data">
              <Download className="h-4 w-4 mr-2" />
              Data Management
            </TabsTrigger>
            <TabsTrigger value="system">
              <Brain className="h-4 w-4 mr-2" />
              System Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Voice Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Speaker className="h-5 w-5" />
                    Voice Assistant
                  </CardTitle>
                  <CardDescription>
                    Configure voice output and behavior
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

              {/* Advanced Voice Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Voice Features</CardTitle>
                  <CardDescription>
                    Fine-tune voice behavior and assistance level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Detailed Guidance</label>
                      <p className="text-sm text-gray-600">Provide comprehensive explanations</p>
                    </div>
                    <Switch
                      checked={settings.detailedGuidance}
                      onCheckedChange={(checked) => updateSettings({ detailedGuidance: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Contextual Help</label>
                      <p className="text-sm text-gray-600">Smart assistance based on current context</p>
                    </div>
                    <Switch
                      checked={settings.contextualHelp}
                      onCheckedChange={(checked) => updateSettings({ contextualHelp: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Field Descriptions</label>
                      <p className="text-sm text-gray-600">Announce field types and requirements</p>
                    </div>
                    <Switch
                      checked={settings.fieldDescriptions}
                      onCheckedChange={(checked) => updateSettings({ fieldDescriptions: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Smart Pausing</label>
                      <p className="text-sm text-gray-600">Intelligent pauses between instructions</p>
                    </div>
                    <Switch
                      checked={settings.smartPausing}
                      onCheckedChange={(checked) => updateSettings({ smartPausing: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Interactive Mode</label>
                      <p className="text-sm text-gray-600">Enhanced interaction feedback</p>
                    </div>
                    <Switch
                      checked={settings.interactiveMode}
                      onCheckedChange={(checked) => updateSettings({ interactiveMode: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="training">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Training Mode Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Training Mode
                  </CardTitle>
                  <CardDescription>
                    Enhanced learning and guidance features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Training Mode</label>
                      <p className="text-sm text-gray-600">Enable enhanced learning features</p>
                    </div>
                    <Switch
                      checked={settings.trainingMode}
                      onCheckedChange={handleTrainingModeToggle}
                    />
                  </div>

                  {settings.trainingMode && (
                    <div className="space-y-4 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Auto Progress</label>
                          <p className="text-sm text-gray-600">Automatically advance between lessons</p>
                        </div>
                        <Switch
                          checked={trainingState.trainingPreferences.autoProgress}
                          onCheckedChange={(checked) => 
                            updateTrainingState({
                              trainingPreferences: {
                                ...trainingState.trainingPreferences,
                                autoProgress: checked
                              }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Repeat Instructions</label>
                          <p className="text-sm text-gray-600">Automatically repeat key instructions</p>
                        </div>
                        <Switch
                          checked={trainingState.trainingPreferences.repeatInstructions}
                          onCheckedChange={(checked) => 
                            updateTrainingState({
                              trainingPreferences: {
                                ...trainingState.trainingPreferences,
                                repeatInstructions: checked
                              }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Detailed Explanations</label>
                          <p className="text-sm text-gray-600">Provide comprehensive training explanations</p>
                        </div>
                        <Switch
                          checked={trainingState.trainingPreferences.detailedExplanations}
                          onCheckedChange={(checked) => 
                            updateTrainingState({
                              trainingPreferences: {
                                ...trainingState.trainingPreferences,
                                detailedExplanations: checked
                              }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Practice Mode</label>
                          <p className="text-sm text-gray-600">Enable interactive practice exercises</p>
                        </div>
                        <Switch
                          checked={trainingState.trainingPreferences.practiceMode}
                          onCheckedChange={(checked) => 
                            updateTrainingState({
                              trainingPreferences: {
                                ...trainingState.trainingPreferences,
                                practiceMode: checked
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button 
                      onClick={() => navigate('/voice-training')} 
                      className="w-full"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Access Training Center
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Training Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Training Progress</CardTitle>
                  <CardDescription>
                    Your learning progress and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {trainingState.completedLessons.length}
                      </div>
                      <div className="text-sm text-gray-600">Lessons Completed</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {trainingState.isTrainingActive ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-sm text-gray-600">Training Status</div>
                    </div>
                  </div>

                  {trainingState.currentModule && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800">Current Module</div>
                      <div className="text-sm text-purple-600 capitalize">
                        {trainingState.currentModule.replace('-', ' ')}
                      </div>
                      <div className="text-xs text-purple-500">
                        Lesson {trainingState.currentLesson + 1}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleResetTraining} variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Training Progress
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data">
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
                  
                  <Button onClick={handleResetTraining} variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Training Only
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
          </TabsContent>

          <TabsContent value="system">
            {/* System Information */}
            <Card>
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
          </TabsContent>
        </Tabs>
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default Settings;
