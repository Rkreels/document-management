
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface VoiceSettings {
  speed: number;
  pitch: number;
  volume: number;
  enabled: boolean;
}

interface VoiceContextType {
  speak: (text: string, priority?: 'low' | 'normal' | 'high') => void;
  stop: () => void;
  isPlaying: boolean;
  settings: VoiceSettings;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  repeatLastInstruction: () => void;
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
      enabled: true
    };
  });
  
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceQueue = useRef<{ text: string; priority: 'low' | 'normal' | 'high' }[]>([]);

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
          name.includes('hazel')
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

    // Handle priority - high priority interrupts current speech
    if (priority === 'high' && isPlaying) {
      stop();
    }

    // Queue management for different priorities
    if (priority === 'high') {
      voiceQueue.current.unshift({ text, priority });
    } else {
      voiceQueue.current.push({ text, priority });
    }

    processQueue();
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
        setTimeout(processQueue, 300);
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

  const repeatLastInstruction = () => {
    if (lastInstruction) {
      speak(lastInstruction, 'high');
    }
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
      repeatLastInstruction
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
