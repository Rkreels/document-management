import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  Mic,
  Speaker,
  Settings,
  HelpCircle,
  Star,
  Trophy,
  Zap
} from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/hooks/use-toast';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  lessons: TrainingLesson[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  completed: boolean;
}

interface TrainingLesson {
  id: string;
  title: string;
  content: string;
  voiceScript: string;
  actions: TrainingAction[];
  completed: boolean;
  interactionType: 'listen' | 'speak' | 'navigate' | 'interact';
}

interface TrainingAction {
  type: 'speak' | 'wait' | 'highlight' | 'navigate' | 'interact';
  payload?: any;
  duration?: number;
}

const VoiceTraining: React.FC = () => {
  const { 
    speak, 
    stop, 
    isPlaying, 
    settings, 
    updateSettings,
    announcePageChange,
    announceFieldFocus,
    announceWorkflowStep
  } = useVoice();
  const { toast } = useToast();

  const [currentModule, setCurrentModule] = useState<string>('basics');
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<Record<string, number>>({});
  const [userPreferences, setUserPreferences] = useState({
    autoPlay: true,
    pauseBetweenLessons: true,
    repeatInstructions: true,
    detailedExplanations: true,
    practiceMode: false
  });

  const trainingModules: TrainingModule[] = [
    {
      id: 'basics',
      title: 'Voice Assistant Basics',
      description: 'Learn the fundamentals of using voice guidance in Document Management',
      difficulty: 'beginner',
      estimatedTime: 15,
      completed: false,
      lessons: [
        {
          id: 'intro',
          title: 'Introduction to Voice Guidance',
          content: 'Welcome to voice-guided document management',
          voiceScript: 'Welcome to voice training for Document Management! I will guide you through learning how to use voice assistance effectively. This training will help you become proficient with voice-guided document signing and management.',
          interactionType: 'listen',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Welcome to Document Management voice training!' },
            { type: 'wait', duration: 2000 },
            { type: 'speak', payload: 'I will guide you through document management step by step.' }
          ]
        },
        {
          id: 'navigation',
          title: 'Voice Navigation',
          content: 'Learn how to navigate using voice commands',
          voiceScript: 'Now let\'s learn navigation. I will announce page changes and guide you through different sections. Listen for audio cues that tell you where you are.',
          interactionType: 'navigate',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Navigation training begins now.' },
            { type: 'highlight', payload: { element: 'nav' } },
            { type: 'speak', payload: 'Notice how I announce each page you visit.' }
          ]
        },
        {
          id: 'fields',
          title: 'Field Interaction',
          content: 'Learn to interact with form fields',
          voiceScript: 'Fields are interactive elements where you enter information. I will announce each field type and guide you through filling them out.',
          interactionType: 'interact',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Let\'s practice with form fields.' },
            { type: 'highlight', payload: { element: 'input' } },
            { type: 'speak', payload: 'Click on highlighted fields to interact with them.' }
          ]
        }
      ]
    },
    {
      id: 'documents',
      title: 'Document Management',
      description: 'Master document upload, editing, and management',
      difficulty: 'intermediate',
      estimatedTime: 25,
      completed: false,
      lessons: [
        {
          id: 'upload',
          title: 'Uploading Documents',
          content: 'Learn to upload PDF documents',
          voiceScript: 'Document upload is the first step in the signing process. I will guide you through selecting and uploading PDF files safely.',
          interactionType: 'interact',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Let\'s learn document upload.' },
            { type: 'navigate', payload: '/dashboard' },
            { type: 'speak', payload: 'Look for the upload area or button.' }
          ]
        },
        {
          id: 'editing',
          title: 'Adding Fields',
          content: 'Learn to add signature and text fields',
          voiceScript: 'Adding fields to documents allows signers to provide information. I will teach you about different field types and their purposes.',
          interactionType: 'interact',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Field editing is crucial for document preparation.' },
            { type: 'speak', payload: 'Listen for field type announcements as we add them.' }
          ]
        }
      ]
    },
    {
      id: 'signing',
      title: 'Document Signing Process',
      description: 'Complete guide to signing documents',
      difficulty: 'intermediate',
      estimatedTime: 20,
      completed: false,
      lessons: [
        {
          id: 'workflow',
          title: 'Signing Workflow',
          content: 'Understand the complete signing process',
          voiceScript: 'The signing workflow involves multiple steps. I will guide you through each stage from start to finish.',
          interactionType: 'navigate',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Signing workflow training begins.' },
            { type: 'speak', payload: 'Listen for progress updates as we complete each step.' }
          ]
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      description: 'Master advanced voice features and shortcuts',
      difficulty: 'advanced',
      estimatedTime: 30,
      completed: false,
      lessons: [
        {
          id: 'shortcuts',
          title: 'Voice Shortcuts',
          content: 'Learn keyboard shortcuts and voice commands',
          voiceScript: 'Advanced users can use shortcuts to navigate faster. I will teach you the most useful keyboard shortcuts and voice commands.',
          interactionType: 'interact',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Advanced shortcuts training.' },
            { type: 'speak', payload: 'Press Ctrl+H anytime for contextual help.' }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    // Load training progress from localStorage
    const savedProgress = localStorage.getItem('voiceTraining_progress');
    if (savedProgress) {
      setTrainingProgress(JSON.parse(savedProgress));
    }

    // Load user preferences
    const savedPreferences = localStorage.getItem('voiceTraining_preferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage
    localStorage.setItem('voiceTraining_progress', JSON.stringify(trainingProgress));
  }, [trainingProgress]);

  useEffect(() => {
    // Save preferences to localStorage
    localStorage.setItem('voiceTraining_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  const startTraining = (moduleId: string, lessonIndex: number = 0) => {
    setCurrentModule(moduleId);
    setCurrentLesson(lessonIndex);
    setIsTrainingActive(true);
    
    const module = trainingModules.find(m => m.id === moduleId);
    const lesson = module?.lessons[lessonIndex];
    
    if (lesson) {
      announceWorkflowStep('Training Started', `Beginning ${lesson.title} in Document Management. Listen carefully for instructions.`);
      
      setTimeout(() => {
        speak(lesson.voiceScript, 'high');
      }, 1000);
    }
  };

  const nextLesson = () => {
    const module = trainingModules.find(m => m.id === currentModule);
    if (!module) return;

    if (currentLesson < module.lessons.length - 1) {
      const nextIndex = currentLesson + 1;
      setCurrentLesson(nextIndex);
      
      const lesson = module.lessons[nextIndex];
      speak(`Moving to next lesson: ${lesson.title}`, 'high');
      
      setTimeout(() => {
        speak(lesson.voiceScript, 'normal');
      }, 2000);
    } else {
      // Module completed
      completeModule(currentModule);
    }
  };

  const previousLesson = () => {
    if (currentLesson > 0) {
      const prevIndex = currentLesson - 1;
      setCurrentLesson(prevIndex);
      
      const module = trainingModules.find(m => m.id === currentModule);
      const lesson = module?.lessons[prevIndex];
      
      if (lesson) {
        speak(`Going back to: ${lesson.title}`, 'normal');
        setTimeout(() => {
          speak(lesson.voiceScript, 'normal');
        }, 2000);
      }
    }
  };

  const completeLesson = (moduleId: string, lessonIndex: number) => {
    setTrainingProgress(prev => ({
      ...prev,
      [`${moduleId}_${lessonIndex}`]: 100
    }));
    
    speak('Lesson completed! Well done.', 'high');
    
    toast({
      title: "Lesson Completed!",
      description: "You've successfully completed this training lesson.",
    });

    if (userPreferences.autoPlay) {
      setTimeout(nextLesson, 3000);
    }
  };

  const completeModule = (moduleId: string) => {
    setTrainingProgress(prev => ({
      ...prev,
      [moduleId]: 100
    }));
    
    speak('Module completed! Congratulations on finishing this training module.', 'high');
    
    toast({
      title: "Module Completed!",
      description: "You've mastered this training module. Great job!",
    });
    
    setIsTrainingActive(false);
  };

  const getModuleProgress = (moduleId: string) => {
    const module = trainingModules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    const completedLessons = module.lessons.filter((_, index) => 
      trainingProgress[`${moduleId}_${index}`] === 100
    ).length;
    
    return (completedLessons / module.lessons.length) * 100;
  };

  const getTotalProgress = () => {
    const totalModules = trainingModules.length;
    const completedModules = trainingModules.filter(module => 
      getModuleProgress(module.id) === 100
    ).length;
    
    return (completedModules / totalModules) * 100;
  };

  const resetTraining = () => {
    setTrainingProgress({});
    setIsTrainingActive(false);
    setCurrentLesson(0);
    localStorage.removeItem('voiceTraining_progress');
    
    speak('Training progress has been reset. You can start fresh anytime.', 'normal');
    
    toast({
      title: "Training Reset",
      description: "All training progress has been cleared.",
    });
  };

  const currentModuleData = trainingModules.find(m => m.id === currentModule);
  const currentLessonData = currentModuleData?.lessons[currentLesson];

  return (
    <div className="space-y-6">
      {/* Training Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Document Management Voice Training Center
            <Badge variant="outline" className="ml-2">
              {Math.round(getTotalProgress())}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getTotalProgress()} className="w-full" />
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">
                  {trainingModules.filter(m => getModuleProgress(m.id) === 100).length} modules completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  {trainingModules.reduce((acc, m) => acc + m.lessons.length, 0)} total lessons
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  ~{trainingModules.reduce((acc, m) => acc + m.estimatedTime, 0)} min total time
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="modules">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="active">Active Training</TabsTrigger>
          <TabsTrigger value="settings">Training Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="grid gap-4">
            {trainingModules.map((module) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {module.title}
                        <Badge variant={
                          module.difficulty === 'beginner' ? 'default' :
                          module.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                        }>
                          {module.difficulty}
                        </Badge>
                        {getModuleProgress(module.id) === 100 && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {Math.round(getModuleProgress(module.id))}% complete
                      </div>
                      <div className="text-xs text-gray-400">
                        ~{module.estimatedTime} min
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={getModuleProgress(module.id)} className="w-full" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {module.lessons.length} lessons
                      </span>
                      <Button 
                        onClick={() => startTraining(module.id)}
                        variant={getModuleProgress(module.id) === 100 ? "outline" : "default"}
                        size="sm"
                      >
                        {getModuleProgress(module.id) === 100 ? 'Review' : 'Start Training'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          {isTrainingActive && currentModuleData && currentLessonData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  {currentModuleData.title}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Lesson {currentLesson + 1} of {currentModuleData.lessons.length}: {currentLessonData.title}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress 
                  value={((currentLesson + 1) / currentModuleData.lessons.length) * 100} 
                  className="w-full" 
                />
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">{currentLessonData.title}</h4>
                  <p className="text-sm text-gray-700">{currentLessonData.content}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={previousLesson}
                    disabled={currentLesson === 0}
                    variant="outline"
                    size="sm"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={() => speak(currentLessonData.voiceScript, 'high')}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Repeat
                  </Button>
                  
                  <Button 
                    onClick={() => completeLesson(currentModule, currentLesson)}
                    variant="default"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Lesson
                  </Button>
                  
                  <Button 
                    onClick={nextLesson}
                    disabled={currentLesson === currentModuleData.lessons.length - 1}
                    variant="outline"
                    size="sm"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Training</h3>
                <p className="text-gray-600 mb-4">
                  Select a training module to begin your voice guidance learning journey.
                </p>
                <Button onClick={() => startTraining('basics')}>
                  Start Basic Training
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Training Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Auto-play next lesson</label>
                    <p className="text-sm text-gray-600">Automatically start the next lesson after completion</p>
                  </div>
                  <Switch
                    checked={userPreferences.autoPlay}
                    onCheckedChange={(checked) => 
                      setUserPreferences(prev => ({ ...prev, autoPlay: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Pause between lessons</label>
                    <p className="text-sm text-gray-600">Add a brief pause before starting new lessons</p>
                  </div>
                  <Switch
                    checked={userPreferences.pauseBetweenLessons}
                    onCheckedChange={(checked) => 
                      setUserPreferences(prev => ({ ...prev, pauseBetweenLessons: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Repeat instructions</label>
                    <p className="text-sm text-gray-600">Automatically repeat important instructions</p>
                  </div>
                  <Switch
                    checked={userPreferences.repeatInstructions}
                    onCheckedChange={(checked) => 
                      setUserPreferences(prev => ({ ...prev, repeatInstructions: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Detailed explanations</label>
                    <p className="text-sm text-gray-600">Provide comprehensive explanations during training</p>
                  </div>
                  <Switch
                    checked={userPreferences.detailedExplanations}
                    onCheckedChange={(checked) => 
                      setUserPreferences(prev => ({ ...prev, detailedExplanations: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Practice mode</label>
                    <p className="text-sm text-gray-600">Enable interactive practice exercises</p>
                  </div>
                  <Switch
                    checked={userPreferences.practiceMode}
                    onCheckedChange={(checked) => 
                      setUserPreferences(prev => ({ ...prev, practiceMode: checked }))
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={resetTraining} variant="destructive" size="sm">
                  Reset All Training Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoiceTraining;
