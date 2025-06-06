
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
  Zap,
  User,
  FileText,
  Shield,
  Bell,
  BarChart3
} from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/hooks/use-toast';

interface EnhancedTrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'document' | 'signing' | 'advanced' | 'security' | 'analytics';
  lessons: EnhancedTrainingLesson[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  completed: boolean;
  prerequisites?: string[];
}

interface EnhancedTrainingLesson {
  id: string;
  title: string;
  content: string;
  voiceScript: string;
  detailedVoiceScript: string;
  actions: TrainingAction[];
  completed: boolean;
  interactionType: 'listen' | 'speak' | 'navigate' | 'interact' | 'practice';
  practiceScenario?: PracticeScenario;
}

interface PracticeScenario {
  description: string;
  steps: PracticeStep[];
  successCriteria: string[];
}

interface PracticeStep {
  instruction: string;
  voiceGuidance: string;
  expectedAction: string;
  hints: string[];
}

interface TrainingAction {
  type: 'speak' | 'wait' | 'highlight' | 'navigate' | 'interact' | 'practice';
  payload?: any;
  duration?: number;
}

const EnhancedVoiceTraining: React.FC = () => {
  const { 
    speak, 
    stop, 
    isPlaying, 
    settings, 
    updateSettings,
    announcePageChange,
    announceFieldFocus,
    announceWorkflowStep,
    announceFeatureIntroduction
  } = useVoice();
  const { toast } = useToast();

  const [currentModule, setCurrentModule] = useState<string>('comprehensive-basics');
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userPreferences, setUserPreferences] = useState({
    autoPlay: true,
    pauseBetweenLessons: true,
    repeatInstructions: true,
    detailedExplanations: true,
    practiceMode: true,
    voiceSpeed: 1,
    interactiveMode: true,
    personalizedPath: true
  });

  const enhancedTrainingModules: EnhancedTrainingModule[] = [
    {
      id: 'comprehensive-basics',
      title: 'Comprehensive Voice Assistant Basics',
      description: 'Master all fundamental voice guidance features with detailed practice',
      category: 'basic',
      difficulty: 'beginner',
      estimatedTime: 25,
      completed: false,
      lessons: [
        {
          id: 'voice-intro',
          title: 'Voice Assistant Introduction & Setup',
          content: 'Complete introduction to voice-guided document management',
          voiceScript: 'Welcome to comprehensive voice training! I am your intelligent voice assistant, designed to guide you through every aspect of document management.',
          detailedVoiceScript: 'Welcome to the most comprehensive voice training system for document management! I am your intelligent voice assistant, designed to guide you through every aspect of creating, editing, sending, and managing documents. This training will transform how you interact with digital documents, making the process more accessible, efficient, and intuitive. We will cover basic navigation, advanced features, security protocols, and accessibility best practices.',
          interactionType: 'listen',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Voice training system initializing...' },
            { type: 'wait', duration: 2000 },
            { type: 'speak', payload: 'System ready. Beginning comprehensive training.' }
          ]
        },
        {
          id: 'navigation-mastery',
          title: 'Advanced Navigation & Voice Commands',
          content: 'Master all navigation techniques and voice shortcuts',
          voiceScript: 'Now we will master navigation. Listen for audio cues, learn keyboard shortcuts, and practice voice commands.',
          detailedVoiceScript: 'Navigation mastery is essential for efficient document management. I will teach you multiple navigation methods: voice commands, keyboard shortcuts, and audio cues. You will learn to navigate between documents, switch between editing modes, access different features, and use contextual help. Practice using Tab key for field navigation, arrow keys for menu navigation, and voice commands for quick access to features.',
          interactionType: 'practice',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Advanced navigation training begins.' },
            { type: 'practice', payload: { scenario: 'navigation' } }
          ],
          practiceScenario: {
            description: 'Practice navigating through the application using voice and keyboard',
            steps: [
              {
                instruction: 'Press Tab to navigate between elements',
                voiceGuidance: 'Use Tab key to move forward, Shift+Tab to move backward',
                expectedAction: 'tab_navigation',
                hints: ['Tab key moves focus forward', 'Shift+Tab moves focus backward', 'Listen for focus announcements']
              },
              {
                instruction: 'Use Ctrl+H for contextual help',
                voiceGuidance: 'Press Control plus H for context-sensitive help anytime',
                expectedAction: 'contextual_help',
                hints: ['Works on any page', 'Provides specific guidance', 'Always available']
              }
            ],
            successCriteria: ['Navigate using Tab key', 'Access contextual help', 'Understand audio cues']
          }
        }
      ]
    },
    {
      id: 'advanced-document-management',
      title: 'Advanced Document Management',
      description: 'Master complex document operations and workflow management',
      category: 'document',
      difficulty: 'intermediate',
      estimatedTime: 35,
      completed: false,
      lessons: [
        {
          id: 'document-creation-mastery',
          title: 'Advanced Document Creation & Templates',
          content: 'Master document creation, template usage, and bulk operations',
          voiceScript: 'Learn advanced document creation techniques including templates, bulk operations, and complex field management.',
          detailedVoiceScript: 'Advanced document creation involves understanding templates, field types, bulk operations, and workflow management. You will learn to create reusable templates, add complex field combinations, set up conditional logic, manage multiple signers, and optimize documents for accessibility. Practice creating different document types: contracts, forms, agreements, and custom workflows.',
          interactionType: 'practice',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Advanced document creation training.' },
            { type: 'practice', payload: { scenario: 'document_creation' } }
          ],
          practiceScenario: {
            description: 'Create a complex document with multiple field types and signers',
            steps: [
              {
                instruction: 'Upload a PDF document',
                voiceGuidance: 'Click the upload area or drag and drop your PDF file',
                expectedAction: 'upload_document',
                hints: ['Only PDF files are supported', 'File size limit is 25MB', 'Document will be processed automatically']
              },
              {
                instruction: 'Add signature fields for multiple signers',
                voiceGuidance: 'Select signature field type, then click on the document where signatures are needed',
                expectedAction: 'add_signature_fields',
                hints: ['Position fields carefully', 'Assign to specific signers', 'Make required fields clear']
              }
            ],
            successCriteria: ['Upload document successfully', 'Add multiple field types', 'Assign fields to signers']
          }
        }
      ]
    },
    {
      id: 'security-compliance',
      title: 'Security & Compliance Training',
      description: 'Learn security features, compliance requirements, and data protection',
      category: 'security',
      difficulty: 'advanced',
      estimatedTime: 30,
      completed: false,
      lessons: [
        {
          id: 'security-overview',
          title: 'Security Features & Best Practices',
          content: 'Comprehensive security training including encryption, authentication, and compliance',
          voiceScript: 'Security is paramount in document management. Learn about encryption, authentication, audit trails, and compliance requirements.',
          detailedVoiceScript: 'Document security encompasses multiple layers: encryption in transit and at rest, multi-factor authentication, identity verification, access controls, audit trails, and compliance with regulations like GDPR, HIPAA, and SOX. You will learn to implement security best practices, configure access permissions, enable audit logging, and ensure compliance with industry standards.',
          interactionType: 'practice',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Security and compliance training begins.' }
          ]
        }
      ]
    },
    {
      id: 'analytics-reporting',
      title: 'Analytics & Reporting Mastery',
      description: 'Master analytics, reporting, and performance tracking',
      category: 'analytics',
      difficulty: 'intermediate',
      estimatedTime: 20,
      completed: false,
      lessons: [
        {
          id: 'analytics-overview',
          title: 'Analytics Dashboard & Custom Reports',
          content: 'Learn to use analytics tools and create custom reports',
          voiceScript: 'Analytics provide insights into document performance, completion rates, and user behavior.',
          detailedVoiceScript: 'Analytics and reporting help you understand document performance, track completion rates, identify bottlenecks, and optimize workflows. You will learn to read analytics dashboards, create custom reports, set up automated reporting, track key performance indicators, and use data to improve document processes.',
          interactionType: 'practice',
          completed: false,
          actions: [
            { type: 'speak', payload: 'Analytics and reporting training.' }
          ]
        }
      ]
    }
  ];

  const getFilteredModules = () => {
    if (selectedCategory === 'all') {
      return enhancedTrainingModules;
    }
    return enhancedTrainingModules.filter(module => module.category === selectedCategory);
  };

  const startComprehensiveTraining = (moduleId: string, lessonIndex: number = 0) => {
    setCurrentModule(moduleId);
    setCurrentLesson(lessonIndex);
    setIsTrainingActive(true);
    
    const module = enhancedTrainingModules.find(m => m.id === moduleId);
    const lesson = module?.lessons[lessonIndex];
    
    if (lesson) {
      announceWorkflowStep('Enhanced Training Started', `Beginning comprehensive training: ${lesson.title}. This session includes detailed guidance, practice scenarios, and interactive elements.`);
      
      setTimeout(() => {
        const scriptToUse = userPreferences.detailedExplanations ? 
          lesson.detailedVoiceScript : lesson.voiceScript;
        speak(scriptToUse, 'high');
      }, 1000);
    }
  };

  const providePracticeGuidance = (scenario: PracticeScenario) => {
    speak(`Practice scenario: ${scenario.description}. I will guide you through each step with detailed instructions.`, 'high');
    
    scenario.steps.forEach((step, index) => {
      setTimeout(() => {
        speak(`Step ${index + 1}: ${step.instruction}. ${step.voiceGuidance}`, 'normal');
      }, (index + 1) * 3000);
    });
  };

  const announceAccessibilityFeatures = () => {
    announceFeatureIntroduction(
      'Accessibility Features',
      'This training system is designed for users of all abilities, including screen reader compatibility, keyboard navigation, and comprehensive voice guidance.',
      'All features can be accessed using keyboard shortcuts, voice commands, or assistive technologies.'
    );
  };

  const currentModuleData = enhancedTrainingModules.find(m => m.id === currentModule);
  const currentLessonData = currentModuleData?.lessons[currentLesson];

  return (
    <div className="space-y-6">
      {/* Enhanced Training Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enhanced Voice Training Center
            <Badge variant="outline" className="ml-2">
              Comprehensive Training System
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Advanced Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Practice Scenarios</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm">Accessibility Focused</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Interactive Learning</span>
              </div>
            </div>
            
            <Button onClick={announceAccessibilityFeatures} variant="outline" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Accessibility Features
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="modules">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="active">Active Training</TabsTrigger>
          <TabsTrigger value="practice">Practice Mode</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </Button>
              <Button
                variant={selectedCategory === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('basic')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Basic
              </Button>
              <Button
                variant={selectedCategory === 'document' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('document')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Document
              </Button>
              <Button
                variant={selectedCategory === 'security' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('security')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </Button>
              <Button
                variant={selectedCategory === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>

            {/* Enhanced Training Modules */}
            <div className="grid gap-4">
              {getFilteredModules().map((module) => (
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
                          <Badge variant="outline">{module.category}</Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {module.lessons.length} comprehensive lessons
                        </span>
                        <Button 
                          onClick={() => startComprehensiveTraining(module.id)}
                          variant="default"
                          size="sm"
                        >
                          Start Enhanced Training
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  Enhanced Lesson {currentLesson + 1}: {currentLessonData.title}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">{currentLessonData.title}</h4>
                  <p className="text-sm text-gray-700">{currentLessonData.content}</p>
                </div>

                {currentLessonData.practiceScenario && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2">Practice Scenario</h4>
                    <p className="text-sm text-gray-700">{currentLessonData.practiceScenario.description}</p>
                    <Button 
                      onClick={() => providePracticeGuidance(currentLessonData.practiceScenario!)}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Start Practice
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => speak(userPreferences.detailedExplanations ? 
                      currentLessonData.detailedVoiceScript : currentLessonData.voiceScript, 'high')}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Repeat Instructions
                  </Button>
                  
                  <Button 
                    onClick={() => speak(currentLessonData.detailedVoiceScript, 'high')}
                    variant="outline"
                    size="sm"
                  >
                    <Volume2 className="h-4 w-4" />
                    Detailed Version
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Enhanced Training Ready</h3>
                <p className="text-gray-600 mb-4">
                  Select a comprehensive training module to begin your enhanced learning experience.
                </p>
                <Button onClick={() => startComprehensiveTraining('comprehensive-basics')}>
                  Start Comprehensive Training
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Practice Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Practice mode provides hands-on experience with guided voice instructions.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Practice Document Creation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Practice Signer Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Practice Security Features
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Training Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Detailed explanations</label>
                    <p className="text-sm text-gray-600">Use comprehensive voice scripts with detailed explanations</p>
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
                    <label className="font-medium">Interactive practice mode</label>
                    <p className="text-sm text-gray-600">Enable hands-on practice scenarios with guidance</p>
                  </div>
                  <Switch
                    checked={userPreferences.practiceMode}
                    onCheckedChange={(checked) => 
                      setUserPreferences(prev => ({ ...prev, practiceMode: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Personalized learning path</label>
                    <p className="text-sm text-gray-600">Adapt training based on your progress and preferences</p>
                  </div>
                  <Switch
                    checked={userPreferences.personalizedPath}
                    onCheckedChange={(checked) => 
                      setUserPreferences(prev => ({ ...prev, personalizedPath: checked }))
                    }
                  />
                </div>

                <div>
                  <label className="font-medium mb-2 block">Voice Speed</label>
                  <Slider
                    value={[userPreferences.voiceSpeed]}
                    onValueChange={([value]) => 
                      setUserPreferences(prev => ({ ...prev, voiceSpeed: value }))
                    }
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Current speed: {userPreferences.voiceSpeed}x
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedVoiceTraining;
