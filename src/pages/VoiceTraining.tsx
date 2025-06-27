
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Voice Training Center</h1>
            <p className="text-gray-600">Master voice-guided document management</p>
          </div>
        </div>

        {/* Training Component */}
        <VoiceTraining />
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default VoiceTrainingPage;
