import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface VoiceSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  voice: string | null;
  language: string;
  autoSpeak: boolean;
  interruptions: boolean;
}

interface VoiceContextType {
  settings: VoiceSettings;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  speak: (text: string, priority?: 'low' | 'normal' | 'high', interrupt?: boolean) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSupported: boolean;
  isSpeaking: boolean;
  availableVoices: SpeechSynthesisVoice[];
  announcePageChange: (pageName: string, description?: string) => void;
  announceFieldFocus: (fieldType: string, fieldLabel?: string, isRequired?: boolean) => void;
  announceFieldComplete: (fieldType: string, value?: string) => void;
  announceProgress: (current: number, total: number, context?: string) => void;
  announceError: (error: string, details?: string) => void;
  announceSuccess: (message: string, details?: string) => void;
  announceWorkflowStep: (stepName: string, instruction: string) => void;
  announceDocumentStatus: (status: string, details?: string) => void;
  getVoiceTrainingProgress: () => VoiceTrainingProgress;
  updateVoiceTrainingProgress: (progress: Partial<VoiceTrainingProgress>) => void;
  startVoiceTraining: (moduleId: string) => void;
  completeVoiceTraining: (moduleId: string, score: number) => void;
}

interface VoiceTrainingProgress {
  completedModules: string[];
  currentModule: string | null;
  totalScore: number;
  practiceTime: number;
  lastTrainingDate: Date | null;
  achievements: string[];
  preferences: {
    speechRate: number;
    voiceType: string;
    feedbackLevel: 'minimal' | 'standard' | 'detailed';
  };
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    rate: 1,
    pitch: 1,
    volume: 0.8,
    voice: null,
    language: 'en-US',
    autoSpeak: true,
    interruptions: true,
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  const speechQueue = useRef<Array<{ text: string; priority: string; interrupt: boolean }>>([]);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const isProcessingQueue = useRef(false);

  const [voiceTrainingProgress, setVoiceTrainingProgress] = useState<VoiceTrainingProgress>({
    completedModules: [],
    currentModule: null,
    totalScore: 0,
    practiceTime: 0,
    lastTrainingDate: null,
    achievements: [],
    preferences: {
      speechRate: 1,
      voiceType: 'default',
      feedbackLevel: 'standard',
    },
  });

  // Load available voices
  useEffect(() => {
    if (isSupported) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Set default voice if none selected
        if (!settings.voice && voices.length > 0) {
          const defaultVoice = voices.find(voice => voice.lang.startsWith(settings.language)) || voices[0];
          setSettings(prev => ({ ...prev, voice: defaultVoice.name }));
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isSupported, settings.language, settings.voice]);

  // Enhanced speech queue processing
  const processQueue = useCallback(() => {
    if (!isSupported || !settings.enabled || isProcessingQueue.current || speechQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    const { text, priority, interrupt } = speechQueue.current.shift()!;

    // Stop current speech if interrupting or high priority
    if ((interrupt || priority === 'high') && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // Create utterance with enhanced error handling
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance.current = utterance;

    // Configure utterance
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = settings.language;

    // Set voice
    if (settings.voice) {
      const selectedVoice = availableVoices.find(voice => voice.name === settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Enhanced event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtterance.current = null;
      isProcessingQueue.current = false;
      
      // Process next item in queue
      setTimeout(() => {
        processQueue();
      }, 100);
    };

    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      currentUtterance.current = null;
      isProcessingQueue.current = false;
      
      // Continue processing queue on error
      setTimeout(() => {
        processQueue();
      }, 100);
    };

    // Speak with timeout fallback
    try {
      speechSynthesis.speak(utterance);
      
      // Fallback timeout to prevent stuck states
      setTimeout(() => {
        if (currentUtterance.current === utterance && speechSynthesis.speaking) {
          console.warn('Speech synthesis timeout, cancelling...');
          speechSynthesis.cancel();
        }
      }, 10000); // 10 second timeout
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(false);
      isProcessingQueue.current = false;
    }
  }, [isSupported, settings, availableVoices]);

  const speak = useCallback((text: string, priority: 'low' | 'normal' | 'high' = 'normal', interrupt = false) => {
    if (!isSupported || !settings.enabled || !text.trim()) return;

    // Add to queue with priority handling
    if (priority === 'high') {
      speechQueue.current.unshift({ text, priority, interrupt: true });
    } else {
      speechQueue.current.push({ text, priority, interrupt });
    }

    processQueue();
  }, [isSupported, settings.enabled, processQueue]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      speechQueue.current = [];
      setIsSpeaking(false);
      currentUtterance.current = null;
      isProcessingQueue.current = false;
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && speechSynthesis.speaking) {
      speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, [isSupported]);

  // Enhanced announcement functions
  const announcePageChange = useCallback((pageName: string, description?: string) => {
    if (!settings.autoSpeak) return;
    const text = `Navigated to ${pageName}. ${description || ''}`;
    speak(text, 'high', true);
  }, [settings.autoSpeak, speak]);

  const announceFieldFocus = useCallback((fieldType: string, fieldLabel?: string, isRequired?: boolean) => {
    if (!settings.autoSpeak) return;
    const requiredText = isRequired ? 'required ' : '';
    const labelText = fieldLabel ? ` for ${fieldLabel}` : '';
    speak(`${requiredText}${fieldType} field${labelText} focused`, 'normal');
  }, [settings.autoSpeak, speak]);

  const announceFieldComplete = useCallback((fieldType: string, value?: string) => {
    if (!settings.autoSpeak) return;
    const valueText = value && fieldType !== 'signature' ? ` with value ${value}` : '';
    speak(`${fieldType} field completed${valueText}`, 'normal');
  }, [settings.autoSpeak, speak]);

  const announceProgress = useCallback((current: number, total: number, context?: string) => {
    if (!settings.autoSpeak) return;
    const percentage = Math.round((current / total) * 100);
    const contextText = context ? ` ${context}` : '';
    speak(`${contextText} progress: ${current} of ${total} completed. ${percentage} percent.`, 'low');
  }, [settings.autoSpeak, speak]);

  const announceError = useCallback((error: string, details?: string) => {
    const text = `Error: ${error}. ${details || ''}`;
    speak(text, 'high', true);
  }, [speak]);

  const announceSuccess = useCallback((message: string, details?: string) => {
    const text = `Success: ${message}. ${details || ''}`;
    speak(text, 'high');
  }, [speak]);

  const announceWorkflowStep = useCallback((stepName: string, instruction: string) => {
    if (!settings.autoSpeak) return;
    speak(`${stepName}: ${instruction}`, 'normal');
  }, [settings.autoSpeak, speak]);

  const announceDocumentStatus = useCallback((status: string, details?: string) => {
    if (!settings.autoSpeak) return;
    speak(`Document status: ${status}. ${details || ''}`, 'normal');
  }, [settings.autoSpeak, speak]);

  // Voice training functions
  const getVoiceTrainingProgress = useCallback(() => voiceTrainingProgress, [voiceTrainingProgress]);

  const updateVoiceTrainingProgress = useCallback((progress: Partial<VoiceTrainingProgress>) => {
    setVoiceTrainingProgress(prev => ({ ...prev, ...progress }));
  }, []);

  const startVoiceTraining = useCallback((moduleId: string) => {
    setVoiceTrainingProgress(prev => ({
      ...prev,
      currentModule: moduleId,
      lastTrainingDate: new Date()
    }));
    speak(`Starting voice training module: ${moduleId}`, 'high');
  }, [speak]);

  const completeVoiceTraining = useCallback((moduleId: string, score: number) => {
    setVoiceTrainingProgress(prev => ({
      ...prev,
      completedModules: [...prev.completedModules, moduleId],
      currentModule: null,
      totalScore: prev.totalScore + score,
      practiceTime: prev.practiceTime + 1
    }));
    speak(`Training module completed with score ${score}`, 'high');
  }, [speak]);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const contextValue: VoiceContextType = {
    settings,
    updateSettings,
    speak,
    stop,
    pause,
    resume,
    isSupported,
    isSpeaking,
    availableVoices,
    announcePageChange,
    announceFieldFocus,
    announceFieldComplete,
    announceProgress,
    announceError,
    announceSuccess,
    announceWorkflowStep,
    announceDocumentStatus,
    getVoiceTrainingProgress,
    updateVoiceTrainingProgress,
    startVoiceTraining,
    completeVoiceTraining,
  };

  return (
    <VoiceContext.Provider value={contextValue}>
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
