
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { VoicePageAnnouncer } from '@/components/VoicePageAnnouncer';
import { PageHeader } from '@/components/PageHeader';
import VoiceTraining from '@/components/VoiceTraining';

const VoiceTrainingPage = () => {
  const navigate = useNavigate();
  const { speak, stop, announcePageChange } = useVoice();

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      announcePageChange(
        'Voice Training Center',
        'Welcome to the comprehensive voice training system for Document Management. Here you can learn to use voice guidance effectively, practice with interactive lessons, and master all features of the application. Choose a training module to begin your learning journey.'
      );
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop, announcePageChange]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Voice Page Announcer */}
        <VoicePageAnnouncer 
          title="Voice Training Center"
          description="Comprehensive voice training system for mastering document management with voice guidance. Learn to use all features efficiently with interactive lessons and practice modules."
          features={[
            'Interactive training modules',
            'Step-by-step voice guidance',
            'Progress tracking',
            'Practice exercises',
            'Customizable learning pace'
          ]}
        />
        
        {/* Header */}
        <PageHeader 
          title="Voice Training Center"
          description="Master voice-guided document management"
        />

        {/* Training Component */}
        <VoiceTraining />
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default VoiceTrainingPage;
