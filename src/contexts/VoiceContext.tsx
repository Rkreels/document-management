
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

  useEffect(() => {
    localStorage.setItem('docuSignClone_voiceSettings', JSON.stringify(settings));
  }, [settings]);

  const getVoice = () => {
    const voices = speechSynthesis.getVoices();
    // Prefer female voices with natural sound
    const preferredVoices = voices.filter(voice => 
      voice.name.includes('Samantha') || 
      voice.name.includes('Karen') || 
      voice.name.includes('Susan') ||
      voice.name.includes('Google UK English Female') ||
      (voice.name.includes('Female') && voice.lang.includes('en'))
    );
    return preferredVoices[0] || voices.find(voice => voice.lang.includes('en')) || voices[0];
  };

  const speak = (text: string, priority: 'low' | 'normal' | 'high' = 'normal') => {
    if (!settings.enabled || !text.trim()) return;

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

    const utterance = new SpeechSynthesisUtterance(nextItem.text);
    const voice = getVoice();
    
    if (voice) utterance.voice = voice;
    utterance.rate = settings.speed;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setLastInstruction(nextItem.text);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      currentUtterance.current = null;
      // Process next item in queue after a brief pause
      setTimeout(processQueue, 500);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      currentUtterance.current = null;
      console.warn('Speech synthesis error');
      setTimeout(processQueue, 1000);
    };

    currentUtterance.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
    voiceQueue.current = [];
    setIsPlaying(false);
    currentUtterance.current = null;
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
