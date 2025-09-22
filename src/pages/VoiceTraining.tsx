
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { VoicePageAnnouncer } from '@/components/VoicePageAnnouncer';
import { PageHeader } from '@/components/PageHeader';
import VoiceTrainingFix from '@/components/VoiceTrainingFix';

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
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Voice Training</h1>
            <p className="text-muted-foreground">Comprehensive voice guidance training for all platform features</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Interactive Voice Training</h2>
              <p className="text-muted-foreground mb-6">Learn to navigate and use all features with guided voice instruction.</p>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium">Training Modules Available:</h3>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Basic Navigation - Learn interface navigation</li>
                    <li>Document Creation - Master document workflows</li>
                    <li>Digital Signing - Complete signing processes</li>
                    <li>Advanced Features - Explore all capabilities</li>
                    <li>Accessibility - Screen reader & keyboard navigation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default VoiceTrainingPage;
