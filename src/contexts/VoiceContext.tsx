
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface VoiceSettings {
  speed: number;
  pitch: number;
  volume: number;
  enabled: boolean;
  detailedGuidance: boolean;
  contextualHelp: boolean;
  fieldDescriptions: boolean;
  trainingMode: boolean;
  interactiveMode: boolean;
  smartPausing: boolean;
  voiceRecognition: boolean;
}

interface VoiceTrainingState {
  isTrainingActive: boolean;
  currentModule: string;
  currentLesson: number;
  completedLessons: string[];
  trainingPreferences: {
    autoProgress: boolean;
    repeatInstructions: boolean;
    detailedExplanations: boolean;
    practiceMode: boolean;
  };
}

interface VoiceContextType {
  speak: (text: string, priority?: 'low' | 'normal' | 'high') => void;
  stop: () => void;
  isPlaying: boolean;
  settings: VoiceSettings;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  repeatLastInstruction: () => void;
  
  // Enhanced voice training methods
  announcePageChange: (pageName: string, description?: string, trainingContext?: string) => void;
  announceFieldFocus: (fieldType: string, label?: string, isRequired?: boolean, trainingTips?: string) => void;
  announceFieldComplete: (fieldType: string, value?: string, nextAction?: string) => void;
  announceDocumentStatus: (status: string, details?: string, trainingContext?: string) => void;
  announceError: (error: string, suggestion?: string, trainingTips?: string) => void;
  announceSuccess: (action: string, details?: string, nextSteps?: string) => void;
  announceProgress: (current: number, total: number, action: string, encouragement?: string) => void;
  announceWorkflowStep: (step: string, instructions: string, tips?: string) => void;
  announceSignerUpdate: (signerName: string, action: string, context?: string) => void;
  announceDocumentMetrics: (metrics: { total: number; completed: number; pending: number }, insights?: string) => void;
  
  // Training specific methods
  startTrainingMode: (module: string) => void;
  endTrainingMode: () => void;
  announceTrainingStep: (step: string, instruction: string, tips?: string) => void;
  provideContextualHelp: (context: string, detailed?: boolean) => void;
  announceKeyboardShortcut: (shortcut: string, action: string) => void;
  announceInteractiveElement: (element: string, action: string, tips?: string) => void;
  announceFormValidation: (field: string, error: string, suggestion: string) => void;
  announceNavigationContext: (from: string, to: string, purpose: string) => void;
  provideDetailedGuidance: (task: string, steps: string[], currentStep?: number) => void;
  announceFeatureIntroduction: (feature: string, benefits: string, usage: string) => void;
  
  // Training state management
  trainingState: VoiceTrainingState;
  updateTrainingState: (state: Partial<VoiceTrainingState>) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastInstruction, setLastInstruction] = useState('');
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('docuSignClone_voiceSettings');
    return saved ? JSON.parse(saved) : {
      speed: 0.9,
      pitch: 1.0,
      volume: 0.8,
      enabled: true,
      detailedGuidance: true,
      contextualHelp: true,
      fieldDescriptions: true,
      trainingMode: false,
      interactiveMode: true,
      smartPausing: true,
      voiceRecognition: false,
    };
  });
  
  const [trainingState, setTrainingState] = useState<VoiceTrainingState>(() => {
    const saved = localStorage.getItem('docuSignClone_voiceTraining');
    return saved ? JSON.parse(saved) : {
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
    };
  });
  
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceQueue = useRef<{ text: string; priority: 'low' | 'normal' | 'high' }[]>([]);
  const trainingContext = useRef<string>('');

  // Wait for voices to load
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('docuSignClone_voiceSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('docuSignClone_voiceTraining', JSON.stringify(trainingState));
  }, [trainingState]);

  const getVoice = () => {
    if (!voicesLoaded) return null;
    
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // Prefer female voices with natural sound
    const preferredVoices = voices.filter(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return (
        lang.includes('en') && (
          name.includes('samantha') || 
          name.includes('karen') || 
          name.includes('susan') ||
          name.includes('female') ||
          name.includes('zira') ||
          name.includes('hazel') ||
          name.includes('aria')
        )
      );
    });

    if (preferredVoices.length > 0) {
      return preferredVoices[0];
    }

    // Fallback to any English voice
    const englishVoices = voices.filter(voice => voice.lang.includes('en'));
    return englishVoices[0] || voices[0];
  };

  const speak = (text: string, priority: 'low' | 'normal' | 'high' = 'normal') => {
    if (!settings.enabled || !text.trim()) return;

    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Enhanced text processing for training mode
    let processedText = text;
    if (settings.trainingMode && trainingState.isTrainingActive) {
      processedText = enhanceTextForTraining(text);
    }

    // Handle priority - high priority interrupts current speech
    if (priority === 'high' && isPlaying) {
      stop();
    }

    // Queue management for different priorities
    if (priority === 'high') {
      voiceQueue.current.unshift({ text: processedText, priority });
    } else {
      voiceQueue.current.push({ text: processedText, priority });
    }

    processQueue();
  };

  const enhanceTextForTraining = (text: string): string => {
    if (!trainingState.trainingPreferences.detailedExplanations) return text;
    
    // Add training context and tips
    const trainingPhrases = [
      'This will help you learn to',
      'Remember, you can always',
      'Pro tip:',
      'For future reference,',
      'This is important because'
    ];
    
    // Randomly add encouraging phrases for training
    if (Math.random() > 0.7) {
      const encouragement = ['Great job!', 'Well done!', 'Perfect!', 'Excellent!'][Math.floor(Math.random() * 4)];
      return `${encouragement} ${text}`;
    }
    
    return text;
  };

  const processQueue = () => {
    if (isPlaying || voiceQueue.current.length === 0) return;

    const nextItem = voiceQueue.current.shift();
    if (!nextItem) return;

    try {
      const utterance = new SpeechSynthesisUtterance(nextItem.text);
      const voice = getVoice();
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = Math.max(0.1, Math.min(2.0, settings.speed));
      utterance.pitch = Math.max(0.0, Math.min(2.0, settings.pitch));
      utterance.volume = Math.max(0.0, Math.min(1.0, settings.volume));

      utterance.onstart = () => {
        setIsPlaying(true);
        setLastInstruction(nextItem.text);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        currentUtterance.current = null;
        // Process next item in queue after a brief pause
        setTimeout(processQueue, settings.smartPausing ? 300 : 100);
      };

      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event.error);
        setIsPlaying(false);
        currentUtterance.current = null;
        // Try to process next item after error
        setTimeout(processQueue, 1000);
      };

      currentUtterance.current = utterance;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error creating speech utterance:', error);
      setIsPlaying(false);
      setTimeout(processQueue, 1000);
    }
  };

  const stop = () => {
    try {
      speechSynthesis.cancel();
      voiceQueue.current = [];
      setIsPlaying(false);
      currentUtterance.current = null;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  };

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateTrainingState = (newState: Partial<VoiceTrainingState>) => {
    setTrainingState(prev => ({ ...prev, ...newState }));
  };

  const repeatLastInstruction = () => {
    if (lastInstruction) {
      speak(lastInstruction, 'high');
    }
  };

  // Enhanced voice training methods
  const announcePageChange = (pageName: string, description?: string, trainingContext?: string) => {
    if (!settings.enabled) return;
    
    let message = `Navigated to ${pageName}`;
    if (description && settings.detailedGuidance) {
      message += `. ${description}`;
    }
    if (trainingContext && settings.trainingMode) {
      message += ` ${trainingContext}`;
    }
    speak(message, 'high');
  };

  const announceFieldFocus = (fieldType: string, label?: string, isRequired?: boolean, trainingTips?: string) => {
    if (!settings.enabled || !settings.fieldDescriptions) return;
    
    let message = `${fieldType} field`;
    if (label) {
      message += ` for ${label}`;
    }
    if (isRequired) {
      message += '. This field is required';
    }
    message += '. Click to edit or press Tab to move to the next field.';
    
    if (trainingTips && settings.trainingMode) {
      message += ` ${trainingTips}`;
    }
    
    speak(message, 'normal');
  };

  const announceFieldComplete = (fieldType: string, value?: string, nextAction?: string) => {
    if (!settings.enabled) return;
    
    let message = `${fieldType} field completed`;
    if (value && settings.detailedGuidance && fieldType !== 'signature') {
      message += ` with value: ${value}`;
    }
    if (nextAction) {
      message += `. ${nextAction}`;
    }
    speak(message, 'normal');
  };

  const announceDocumentStatus = (status: string, details?: string, trainingContext?: string) => {
    if (!settings.enabled) return;
    
    let message = `Document status: ${status}`;
    if (details && settings.detailedGuidance) {
      message += `. ${details}`;
    }
    if (trainingContext && settings.trainingMode) {
      message += ` ${trainingContext}`;
    }
    speak(message, 'normal');
  };

  const announceError = (error: string, suggestion?: string, trainingTips?: string) => {
    if (!settings.enabled) return;
    
    let message = `Error: ${error}`;
    if (suggestion && settings.contextualHelp) {
      message += `. ${suggestion}`;
    }
    if (trainingTips && settings.trainingMode) {
      message += ` ${trainingTips}`;
    }
    speak(message, 'high');
  };

  const announceSuccess = (action: string, details?: string, nextSteps?: string) => {
    if (!settings.enabled) return;
    
    let message = `Success! ${action}`;
    if (details && settings.detailedGuidance) {
      message += `. ${details}`;
    }
    if (nextSteps) {
      message += ` ${nextSteps}`;
    }
    speak(message, 'high');
  };

  const announceProgress = (current: number, total: number, action: string, encouragement?: string) => {
    if (!settings.enabled) return;
    
    const percentage = Math.round((current / total) * 100);
    let message = `${action} progress: ${current} of ${total} completed. ${percentage} percent done.`;
    
    if (encouragement && settings.trainingMode) {
      message += ` ${encouragement}`;
    }
    speak(message, 'normal');
  };

  const announceWorkflowStep = (step: string, instructions: string, tips?: string) => {
    if (!settings.enabled) return;
    
    let message = `Workflow step: ${step}`;
    if (instructions && settings.detailedGuidance) {
      message += `. ${instructions}`;
    }
    if (tips && settings.trainingMode) {
      message += ` ${tips}`;
    }
    speak(message, 'normal');
  };

  const announceSignerUpdate = (signerName: string, action: string, context?: string) => {
    if (!settings.enabled) return;
    
    let message = `Signer update: ${signerName} has ${action} the document.`;
    if (context && settings.detailedGuidance) {
      message += ` ${context}`;
    }
    speak(message, 'normal');
  };

  const announceDocumentMetrics = (metrics: { total: number; completed: number; pending: number }, insights?: string) => {
    if (!settings.enabled || !settings.detailedGuidance) return;
    
    let message = `Document overview: ${metrics.total} total documents, ${metrics.completed} completed, ${metrics.pending} pending signatures.`;
    if (insights) {
      message += ` ${insights}`;
    }
    speak(message, 'normal');
  };

  // Training specific methods
  const startTrainingMode = (module: string) => {
    updateSettings({ trainingMode: true });
    updateTrainingState({ 
      isTrainingActive: true, 
      currentModule: module,
      currentLesson: 0 
    });
    trainingContext.current = module;
    speak(`Training mode activated for ${module}. I will provide detailed guidance and tips throughout your learning.`, 'high');
  };

  const endTrainingMode = () => {
    updateSettings({ trainingMode: false });
    updateTrainingState({ isTrainingActive: false });
    trainingContext.current = '';
    speak('Training mode completed. Great job on completing your voice training!', 'high');
  };

  const announceTrainingStep = (step: string, instruction: string, tips?: string) => {
    if (!settings.enabled) return;
    
    let message = `Training step: ${step}. ${instruction}`;
    if (tips) {
      message += ` Pro tip: ${tips}`;
    }
    speak(message, 'normal');
  };

  const provideContextualHelp = (context: string, detailed?: boolean) => {
    if (!settings.enabled || !settings.contextualHelp) return;
    
    const helpContent = getContextualHelp(context, detailed);
    speak(helpContent, 'high');
  };

  const getContextualHelp = (context: string, detailed?: boolean): string => {
    const helpMap: Record<string, string> = {
      'dashboard': detailed ? 
        'Dashboard help: This is your main workspace. Here you can view all documents, create new ones, and track signing progress. Use Tab to navigate between elements, Enter to select, and Ctrl+H for help anytime.' :
        'Dashboard: View and manage all your documents here.',
      'upload': detailed ?
        'Upload help: Drag and drop PDF files or click to browse. Supported formats are PDF only, maximum 10MB. The system will validate your file and prepare it for editing.' :
        'Upload: Add PDF documents to start the signing process.',
      'editor': detailed ?
        'Editor help: Add signature fields, text fields, and other elements to your document. Click where you want to place fields, then choose the field type. Assign fields to specific signers for organized workflows.' :
        'Editor: Add fields and prepare documents for signing.',
      'signing': detailed ?
        'Signing help: Complete all required fields before finalizing. Click on highlighted areas to fill them out. Use Tab to navigate between fields, and follow the voice guidance for each step.' :
        'Signing: Fill out required fields and complete your signature.',
    };
    
    return helpMap[context] || 'Contextual help not available for this section.';
  };

  const announceKeyboardShortcut = (shortcut: string, action: string) => {
    if (!settings.enabled || !settings.trainingMode) return;
    
    speak(`Keyboard shortcut: Press ${shortcut} to ${action}`, 'normal');
  };

  const announceInteractiveElement = (element: string, action: string, tips?: string) => {
    if (!settings.enabled) return;
    
    let message = `${element}: ${action}`;
    if (tips && settings.trainingMode) {
      message += `. ${tips}`;
    }
    speak(message, 'normal');
  };

  const announceFormValidation = (field: string, error: string, suggestion: string) => {
    if (!settings.enabled) return;
    
    speak(`${field} validation error: ${error}. ${suggestion}`, 'high');
  };

  const announceNavigationContext = (from: string, to: string, purpose: string) => {
    if (!settings.enabled || !settings.trainingMode) return;
    
    speak(`Navigating from ${from} to ${to} to ${purpose}`, 'normal');
  };

  const provideDetailedGuidance = (task: string, steps: string[], currentStep?: number) => {
    if (!settings.enabled || !settings.detailedGuidance) return;
    
    let message = `${task} guidance. This involves ${steps.length} steps: ${steps.join(', ')}.`;
    if (currentStep !== undefined) {
      message += ` Currently on step ${currentStep + 1}: ${steps[currentStep]}.`;
    }
    speak(message, 'normal');
  };

  const announceFeatureIntroduction = (feature: string, benefits: string, usage: string) => {
    if (!settings.enabled || !settings.trainingMode) return;
    
    speak(`Feature introduction: ${feature}. ${benefits} To use it: ${usage}`, 'normal');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <VoiceContext.Provider value={{
      speak,
      stop,
      isPlaying,
      settings,
      updateSettings,
      repeatLastInstruction,
      announcePageChange,
      announceFieldFocus,
      announceFieldComplete,
      announceDocumentStatus,
      announceError,
      announceSuccess,
      announceProgress,
      announceWorkflowStep,
      announceSignerUpdate,
      announceDocumentMetrics,
      startTrainingMode,
      endTrainingMode,
      announceTrainingStep,
      provideContextualHelp,
      announceKeyboardShortcut,
      announceInteractiveElement,
      announceFormValidation,
      announceNavigationContext,
      provideDetailedGuidance,
      announceFeatureIntroduction,
      trainingState,
      updateTrainingState,
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
