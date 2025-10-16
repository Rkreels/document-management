import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  estimatedTime: number;
  completed: boolean;
}

interface TrainingLesson {
  id: string;
  title: string;
  content: string;
  voiceScript: string;
  completed: boolean;
  interactionType: 'listen' | 'speak' | 'navigate' | 'interact';
}

const VoiceTrainingFix: React.FC = () => {
  const { speak, stop, isPlaying, settings, updateSettings } = useVoice();
  const { toast } = useToast();

  const [currentModule, setCurrentModule] = useState<string>('basics');
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<Record<string, number>>({});

  const trainingModules: TrainingModule[] = [
    {
      id: 'basics',
      title: 'Voice Assistant Basics',
      description: 'Learn the fundamentals of using voice guidance',
      difficulty: 'beginner',
      estimatedTime: 15,
      completed: false,
      lessons: [
        {
          id: 'intro',
          title: 'Introduction to Voice Guidance',
          content: 'Welcome to voice-guided document management',
          voiceScript: 'Welcome to voice training! I will guide you through learning how to use voice assistance effectively.',
          interactionType: 'listen',
          completed: false
        },
        {
          id: 'navigation',
          title: 'Voice Navigation',
          content: 'Learn how to navigate using voice commands',
          voiceScript: 'Now let\'s learn navigation. I will announce page changes and guide you through different sections.',
          interactionType: 'navigate',
          completed: false
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
          voiceScript: 'Document upload is the first step. I will guide you through selecting and uploading PDF files.',
          interactionType: 'interact',
          completed: false
        }
      ]
    }
  ];

  // Training progress managed in memory only - no localStorage

  const startTraining = (moduleId: string, lessonIndex: number = 0) => {
    const module = trainingModules.find(m => m.id === moduleId);
    const lesson = module?.lessons[lessonIndex];
    
    if (!module || !lesson) {
      toast({
        title: "Error",
        description: "Training module not found",
        variant: "destructive"
      });
      return;
    }

    setCurrentModule(moduleId);
    setCurrentLesson(lessonIndex);
    setIsTrainingActive(true);
    
    speak(`Starting training: ${lesson.title}`, 'high');
    
    setTimeout(() => {
      speak(lesson.voiceScript, 'normal');
    }, 2000);

    toast({
      title: "Training Started",
      description: `Beginning ${lesson.title}. Listen for voice guidance.`,
    });
  };

  const nextLesson = () => {
    const module = trainingModules.find(m => m.id === currentModule);
    if (!module) return;

    if (currentLesson < module.lessons.length - 1) {
      const nextIndex = currentLesson + 1;
      setCurrentLesson(nextIndex);
      
      const lesson = module.lessons[nextIndex];
      speak(`Next lesson: ${lesson.title}`, 'high');
      
      setTimeout(() => {
        speak(lesson.voiceScript, 'normal');
      }, 2000);
    } else {
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
        speak(`Previous lesson: ${lesson.title}`, 'normal');
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

    setTimeout(nextLesson, 3000);
  };

  const completeModule = (moduleId: string) => {
    setTrainingProgress(prev => ({
      ...prev,
      [moduleId]: 100
    }));
    
    speak('Module completed! Congratulations!', 'high');
    
    toast({
      title: "Module Completed!",
      description: "You've mastered this training module!",
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
    
    speak('Training progress has been reset.', 'normal');
    
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
            Voice Training Center
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
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={() => speak(currentLessonData.voiceScript, 'normal')}
                    variant="outline"
                    size="sm"
                  >
                    <Volume2 className="h-4 w-4" />
                    Repeat
                  </Button>
                  
                  <Button 
                    onClick={() => completeLesson(currentModule, currentLesson)}
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Complete Lesson
                  </Button>
                  
                  <Button 
                    onClick={nextLesson}
                    disabled={currentLesson === currentModuleData.lessons.length - 1}
                    size="sm"
                  >
                    Next
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <Button 
                  onClick={() => {
                    setIsTrainingActive(false);
                    speak('Training paused. You can resume anytime.', 'normal');
                  }}
                  variant="destructive"
                  size="sm"
                >
                  Stop Training
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Training</h3>
                <p className="text-gray-600 mb-4">
                  Select a training module to begin learning with voice guidance.
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
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Training Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Voice Speed</h4>
                    <p className="text-sm text-gray-600">Adjust the speed of voice instructions</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {settings.rate}x
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Voice Volume</h4>
                    <p className="text-sm text-gray-600">Control voice instruction volume</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round(settings.volume * 100)}%
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reset Progress</h4>
                    <p className="text-sm text-gray-600">Clear all training progress</p>
                  </div>
                  <Button onClick={resetTraining} variant="destructive" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoiceTrainingFix;