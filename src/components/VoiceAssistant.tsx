
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  className?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const { isPlaying, settings, updateSettings, repeatLastInstruction, stop } = useVoice();

  const toggleVoice = () => {
    if (isPlaying) {
      stop();
    } else {
      updateSettings({ enabled: !settings.enabled });
    }
  };

  return (
    <div className={cn("fixed bottom-6 right-6 flex flex-col gap-2 z-50", className)}>
      <Button
        onClick={toggleVoice}
        variant={settings.enabled ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg transition-all duration-200",
          isPlaying && "animate-pulse"
        )}
        title={settings.enabled ? "Disable voice assistant" : "Enable voice assistant"}
      >
        {settings.enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </Button>
      
      {settings.enabled && (
        <Button
          onClick={repeatLastInstruction}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg"
          title="Repeat last instruction"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
