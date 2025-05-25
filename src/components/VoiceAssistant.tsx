
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, RotateCcw, BookOpen, HelpCircle, Settings } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  className?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const { 
    isPlaying, 
    settings, 
    updateSettings, 
    repeatLastInstruction, 
    stop,
    trainingState,
    provideContextualHelp,
    announceFeatureIntroduction
  } = useVoice();
  const navigate = useNavigate();

  const toggleVoice = () => {
    if (isPlaying) {
      stop();
    } else {
      updateSettings({ enabled: !settings.enabled });
    }
  };

  const handleTrainingAccess = () => {
    announceFeatureIntroduction(
      'Voice Training Center',
      'This comprehensive training system will teach you to use voice guidance effectively for document management.',
      'Navigate to the training center to begin structured learning modules'
    );
    
    setTimeout(() => {
      navigate('/voice-training');
    }, 2000);
  };

  const handleContextualHelp = () => {
    const currentPath = window.location.pathname;
    let context = 'general';
    
    if (currentPath.includes('dashboard')) context = 'dashboard';
    else if (currentPath.includes('editor')) context = 'editor';
    else if (currentPath.includes('signing')) context = 'signing';
    else if (currentPath.includes('upload')) context = 'upload';
    
    provideContextualHelp(context, true);
  };

  const handleSettingsAccess = () => {
    announceFeatureIntroduction(
      'Voice Settings',
      'Customize voice speed, pitch, volume, and training preferences to optimize your experience.',
      'Access settings to personalize your voice assistant'
    );
    
    setTimeout(() => {
      navigate('/settings');
    }, 2000);
  };

  return (
    <div className={cn("fixed bottom-6 right-6 flex flex-col gap-2 z-50", className)}>
      {/* Main Voice Toggle */}
      <Button
        onClick={toggleVoice}
        variant={settings.enabled ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg transition-all duration-200",
          isPlaying && "animate-pulse",
          settings.trainingMode && "ring-2 ring-blue-400"
        )}
        title={settings.enabled ? "Disable voice assistant" : "Enable voice assistant"}
      >
        {settings.enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </Button>
      
      {settings.enabled && (
        <>
          {/* Repeat Last Instruction */}
          <Button
            onClick={repeatLastInstruction}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg"
            title="Repeat last instruction"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Contextual Help */}
          <Button
            onClick={handleContextualHelp}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg"
            title="Get contextual help (Ctrl+H)"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Voice Training Access */}
          <Button
            onClick={handleTrainingAccess}
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-lg",
              trainingState.isTrainingActive && "bg-blue-50 border-blue-300"
            )}
            title="Access voice training center"
          >
            <BookOpen className="h-4 w-4" />
          </Button>

          {/* Settings Access */}
          <Button
            onClick={handleSettingsAccess}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg"
            title="Voice settings and preferences"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Training Mode Indicator */}
      {settings.trainingMode && trainingState.isTrainingActive && (
        <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full text-center">
          Training Active
        </div>
      )}
    </div>
  );
};
