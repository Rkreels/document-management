import { useEffect } from 'react';
import { useVoice } from '@/contexts/VoiceContext';

interface VoicePageAnnouncerProps {
  title: string;
  description: string;
  features?: string[];
  delay?: number;
}

export const VoicePageAnnouncer: React.FC<VoicePageAnnouncerProps> = ({
  title,
  description,
  features = [],
  delay = 1000
}) => {
  const { speak, stop, announcePageChange } = useVoice();

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      const featuresText = features.length > 0 
        ? ` Available features include: ${features.join(', ')}.`
        : '';
      
      announcePageChange(
        title,
        `${description}${featuresText}`
      );
    }, delay);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [title, description, features, delay, announcePageChange, speak, stop]);

  return null;
};