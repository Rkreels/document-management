import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  CheckCircle, 
  BookOpen, 
  Headphones, 
  Mic,
  Settings,
  RotateCcw,
  Award
} from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/hooks/use-toast';

interface VoiceTrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'navigation' | 'documents' | 'signing' | 'features' | 'accessibility';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  steps: VoiceTrainingStep[];
  completed: boolean;
}

interface VoiceTrainingStep {
  id: string;
  instruction: string;
  voiceText: string;
  actionRequired?: 'listen' | 'interact' | 'navigate' | 'wait';
  targetElement?: string;
  expectedResponse?: string;
  hints?: string[];
  completed: boolean;
}

const TRAINING_MODULES: VoiceTrainingModule[] = [
  {
    id: 'basic-navigation',
    title: 'Basic Navigation',
    description: 'Learn to navigate the application using voice guidance',
    category: 'navigation',
    difficulty: 'beginner',
    estimatedTime: 5,
    completed: false,
    steps: [
      {
        id: 'welcome',
        instruction: 'Welcome to voice training. Listen to the introduction.',
        voiceText: 'Welcome to the comprehensive voice training system. This training will help you master all features of the document management platform using voice guidance. You can pause, repeat, or skip sections at any time.',
        actionRequired: 'listen',
        completed: false
      },
      {
        id: 'dashboard-overview',
        instruction: 'Learn about the dashboard layout',
        voiceText: 'You are currently on the dashboard. The main navigation includes Templates, Documents, and Settings. The dashboard shows your recent documents, quick actions, and system status.',
        actionRequired: 'listen',
        completed: false
      },
      {
        id: 'menu-navigation',
        instruction: 'Practice navigating between sections',
        voiceText: 'Use the navigation menu to move between different sections. Click on Templates to view available document templates, or Documents to see your created documents.',
        actionRequired: 'interact',
        targetElement: 'nav-menu',
        completed: false
      }
    ]
  },
  {
    id: 'document-creation',
    title: 'Document Creation',
    description: 'Master the process of creating and editing documents',
    category: 'documents',
    difficulty: 'beginner',
    estimatedTime: 10,
    completed: false,
    steps: [
      {
        id: 'template-selection',
        instruction: 'Learn how to select templates',
        voiceText: 'To create a new document, start by selecting a template. Templates provide pre-configured layouts with common field types like text, signatures, and dates.',
        actionRequired: 'listen',
        completed: false
      },
      {
        id: 'field-configuration',
        instruction: 'Understanding document fields',
        voiceText: 'Document fields are interactive areas where signers can enter information. Each field has a type: text for written information, signature for digital signing, date for temporal data, and checkbox for confirmations.',
        actionRequired: 'listen',
        completed: false
      },
      {
        id: 'field-placement',
        instruction: 'Practice placing fields on documents',
        voiceText: 'In edit mode, you can drag fields to position them on the document. Fields will snap to appropriate positions and can be resized as needed.',
        actionRequired: 'interact',
        targetElement: 'document-editor',
        completed: false
      }
    ]
  },
  {
    id: 'signing-workflow',
    title: 'Digital Signing',
    description: 'Complete guide to the signing process',
    category: 'signing',
    difficulty: 'intermediate',
    estimatedTime: 15,
    completed: false,
    steps: [
      {
        id: 'signing-intro',
        instruction: 'Introduction to digital signing',
        voiceText: 'Digital signing allows secure, legally binding signatures on documents. The platform supports multiple signature types and maintains a complete audit trail.',
        actionRequired: 'listen',
        completed: false
      },
      {
        id: 'signature-creation',
        instruction: 'Creating your signature',
        voiceText: 'When you click a signature field, the signature pad opens. Draw your signature using your mouse, trackpad, or touch screen. You can clear and redraw until satisfied.',
        actionRequired: 'interact',
        targetElement: 'signature-pad',
        hints: ['Use smooth, continuous strokes', 'Take your time for clarity', 'You can clear and retry'],
        completed: false
      },
      {
        id: 'form-filling',
        instruction: 'Filling text and date fields',
        voiceText: 'Text fields accept typed input, while date fields provide calendar pickers. Required fields are marked with red asterisks and must be completed before submission.',
        actionRequired: 'interact',
        targetElement: 'form-fields',
        completed: false
      },
      {
        id: 'document-submission',
        instruction: 'Submitting completed documents',
        voiceText: 'Once all required fields are completed, the submit button becomes active. Review your entries before final submission as some changes may not be reversible.',
        actionRequired: 'listen',
        completed: false
      }
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: 'Explore advanced functionality and customization',
    category: 'features',
    difficulty: 'advanced',
    estimatedTime: 20,
    completed: false,
    steps: [
      {
        id: 'workflow-management',
        instruction: 'Understanding workflow automation',
        voiceText: 'Workflows define the signing order and business rules. You can set up sequential signing, parallel signing, and conditional logic based on field values.',
        actionRequired: 'listen',
        completed: false
      },
      {
        id: 'analytics-dashboard',
        instruction: 'Using analytics and reporting',
        voiceText: 'The analytics dashboard provides insights into document completion rates, signing times, and user engagement. Use these metrics to optimize your processes.',
        actionRequired: 'navigate',
        targetElement: 'analytics-section',
        completed: false
      },
      {
        id: 'integration-setup',
        instruction: 'API and integration capabilities',
        voiceText: 'The platform offers REST APIs and webhooks for integration with external systems. Configure notifications and automated data synchronization.',
        actionRequired: 'listen',
        completed: false
      }
    ]
  },
  {
    id: 'accessibility-features',
    title: 'Accessibility Features',
    description: 'Learn about accessibility and assistive technology support',
    category: 'accessibility',
    difficulty: 'intermediate',
    estimatedTime: 12,
    completed: false,
    steps: [
      {
        id: 'voice-controls',
        instruction: 'Voice control system overview',
        voiceText: 'This platform includes comprehensive voice guidance for all actions. Voice announcements help you understand interface changes, field focus, and system feedback.',
        actionRequired: 'listen',
        completed: false
      },
      {
        id: 'keyboard-navigation',
        instruction: 'Keyboard shortcuts and navigation',
        voiceText: 'All features are accessible via keyboard. Use Tab to navigate between elements, Enter to activate, and arrow keys for menu navigation. Press Alt+H for help at any time.',
        actionRequired: 'interact',
        targetElement: 'keyboard-demo',
        completed: false
      },
      {
        id: 'screen-reader-support',
        instruction: 'Screen reader compatibility',
        voiceText: 'The interface is fully compatible with screen readers. All interactive elements include proper labels, descriptions, and ARIA attributes for assistive technology.',
        actionRequired: 'listen',
        completed: false
      }
    ]
  }
];

export const ComprehensiveVoiceTraining: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('basic-navigation');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<{ [moduleId: string]: number }>({});
  const [globalProgress, setGlobalProgress] = useState<number>(0);
  const [userPreferences, setUserPreferences] = useState({
    speed: 1,
    volume: 0.8,
    autoAdvance: true,
    repeatInstructions: false
  });
  
  const { 
    speak, 
    stop, 
    pause, 
    resume, 
    isSpeaking, 
    updateSettings,
    announceFeatureIntroduction,
    provideContextualHelp
  } = useVoice();
  const { toast } = useToast();
  
  const progressTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Training progress managed in memory only - no localStorage
    calculateGlobalProgress();
  }, [trainingProgress]);

  const calculateGlobalProgress = () => {
    const totalModules = TRAINING_MODULES.length;
    const completedModules = Object.values(trainingProgress).filter(p => p === 100).length;
    setGlobalProgress(Math.round((completedModules / totalModules) * 100));
  };

  const getCurrentModule = (): VoiceTrainingModule => {
    return TRAINING_MODULES.find(m => m.id === selectedModule) || TRAINING_MODULES[0];
  };

  const getCurrentStep = (): VoiceTrainingStep => {
    const module = getCurrentModule();
    return module.steps[currentStep] || module.steps[0];
  };

  const playCurrentStep = async () => {
    const step = getCurrentStep();
    const module = getCurrentModule();
    
    setIsPlaying(true);
    
    try {
      // Announce the instruction
      speak(`Training Step ${currentStep + 1} of ${module.steps.length}: ${step.instruction}`, 'normal');
      
      // Wait a bit, then speak the detailed text
      setTimeout(() => {
        speak(step.voiceText, 'normal');
        
        // Auto-advance if enabled and it's a listen-only step
        if (userPreferences.autoAdvance && step.actionRequired === 'listen') {
          progressTimerRef.current = setTimeout(() => {
            completeCurrentStep();
          }, 3000 + (step.voiceText.length * 50)); // Estimate reading time
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error playing step:', error);
      toast({
        title: 'Playback Error',
        description: 'Unable to play audio. Check your audio settings.',
        variant: 'destructive'
      });
    }
  };

  const completeCurrentStep = () => {
    const module = getCurrentModule();
    const step = getCurrentStep();
    
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
    }
    
    // Mark step as completed
    const updatedModules = TRAINING_MODULES.map(m => {
      if (m.id === selectedModule) {
        const updatedSteps = m.steps.map((s, index) => 
          index === currentStep ? { ...s, completed: true } : s
        );
        return { ...m, steps: updatedSteps };
      }
      return m;
    });
    
    // Update progress
    const completedSteps = module.steps.filter((_, index) => 
      index <= currentStep
    ).length;
    const moduleProgress = Math.round((completedSteps / module.steps.length) * 100);
    
    setTrainingProgress(prev => ({
      ...prev,
      [selectedModule]: moduleProgress
    }));
    
    // Advance to next step or complete module
    if (currentStep < module.steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        if (userPreferences.autoAdvance) {
          playCurrentStep();
        }
      }, 1500);
    } else {
      // Module completed
      speak('Congratulations! You have completed this training module. You can now practice these skills or move to the next module.', 'high');
      toast({
        title: 'Module Completed!',
        description: `You've finished "${module.title}". Great job!`,
      });
    }
    
    setIsPlaying(false);
  };

  const skipStep = () => {
    stop();
    setIsPlaying(false);
    if (currentStep < getCurrentModule().steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    stop();
    setIsPlaying(false);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectModule = (moduleId: string) => {
    stop();
    setIsPlaying(false);
    setSelectedModule(moduleId);
    setCurrentStep(0);
    
    const module = TRAINING_MODULES.find(m => m.id === moduleId);
    if (module) {
      speak(`Starting ${module.title} training module. This module has ${module.steps.length} steps and takes approximately ${module.estimatedTime} minutes to complete.`, 'normal');
    }
  };

  const resetModule = () => {
    stop();
    setIsPlaying(false);
    setCurrentStep(0);
    setTrainingProgress(prev => ({
      ...prev,
      [selectedModule]: 0
    }));
    
    toast({
      title: 'Module Reset',
      description: 'Training module has been reset to the beginning.',
    });
  };

  const updatePreference = (key: keyof typeof userPreferences, value: any) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }));
    
    // Update voice settings if relevant
    if (key === 'speed' || key === 'volume') {
      updateSettings({
        rate: key === 'speed' ? value : userPreferences.speed,
        volume: key === 'volume' ? value : userPreferences.volume
      });
    }
  };

  const renderModuleCard = (module: VoiceTrainingModule) => {
    const progress = trainingProgress[module.id] || 0;
    const isSelected = selectedModule === module.id;
    
    return (
      <Card 
        key={module.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => selectModule(module.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={progress === 100 ? 'default' : 'outline'}>
                {module.difficulty}
              </Badge>
              <Badge variant="secondary">
                {module.estimatedTime}m
              </Badge>
            </div>
            {progress === 100 && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </div>
          <CardTitle className="text-lg">{module.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{module.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const currentModule = getCurrentModule();
  const currentStepData = getCurrentStep();
  const moduleProgress = trainingProgress[selectedModule] || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Comprehensive Voice Training</h1>
        <p className="text-muted-foreground">
          Master every feature of the platform with guided voice instruction
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-semibold">Global Progress: {globalProgress}%</span>
          </div>
          <Progress value={globalProgress} className="w-48 h-2" />
        </div>
      </div>

      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="training">Active Training</TabsTrigger>
          <TabsTrigger value="modules">All Modules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-6">
          {/* Current Module Training */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentModule.title}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Step {currentStep + 1} of {currentModule.steps.length}
                  </p>
                </div>
                <Badge variant="outline">
                  {moduleProgress}% Complete
                </Badge>
              </div>
              <Progress value={moduleProgress} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Step */}
              <Alert>
                <Headphones className="h-4 w-4" />
                <AlertDescription>
                  <strong>{currentStepData.instruction}</strong>
                  {currentStepData.actionRequired && (
                    <Badge variant="secondary" className="ml-2">
                      {currentStepData.actionRequired}
                    </Badge>
                  )}
                </AlertDescription>
              </Alert>

              {/* Hints */}
              {currentStepData.hints && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">💡 Helpful Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {currentStepData.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <Button
                  onClick={isPlaying ? () => { stop(); setIsPlaying(false); } : playCurrentStep}
                  className="min-w-32"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Play Step
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={skipStep}
                  disabled={currentStep === currentModule.steps.length - 1}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </Button>
                
                <Button
                  variant="outline"
                  onClick={completeCurrentStep}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Step
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={resetModule}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Module
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          {/* Module Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRAINING_MODULES.map(renderModuleCard)}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Training Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Training Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Speech Speed</label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Slow</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={userPreferences.speed}
                      onChange={(e) => updatePreference('speed', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm">Fast</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Volume</label>
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={userPreferences.volume}
                      onChange={(e) => updatePreference('volume', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm">{Math.round(userPreferences.volume * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto-advance through steps</label>
                  <input
                    type="checkbox"
                    checked={userPreferences.autoAdvance}
                    onChange={(e) => updatePreference('autoAdvance', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Repeat important instructions</label>
                  <input
                    type="checkbox"
                    checked={userPreferences.repeatInstructions}
                    onChange={(e) => updatePreference('repeatInstructions', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </div>

              <Alert>
                <Mic className="h-4 w-4" />
                <AlertDescription>
                  For the best experience, use headphones and ensure you're in a quiet environment. 
                  The training is designed to work with all accessibility tools including screen readers.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};