
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument } from '@/contexts/DocumentContext';
import { DocumentSigning } from '@/components/DocumentSigning';

const SigningPage = () => {
  const { documentId, signerId } = useParams();
  const navigate = useNavigate();
  const { 
    speak, 
    stop, 
    settings, 
    updateSettings, 
    announcePageChange, 
    announceDocumentStatus, 
    announceError, 
    announceSuccess 
  } = useVoice();
  const { documents } = useDocument();
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const document = documents.find(doc => doc.id === documentId);
  const signer = document?.signers.find(s => s.id === signerId);

  useEffect(() => {
    stop();
    
    if (!hasInitialized) {
      const timer = setTimeout(() => {
        if (!document || !signer) {
          announceError(
            'Document or signer not found', 
            'The signing link appears to be invalid or expired. You will be redirected to the main dashboard.'
          );
          setTimeout(() => navigate('/dashboard'), 3000);
          return;
        }

        // Announce page entry
        announcePageChange(
          'Document Signing Interface',
          `You are about to sign ${document.title}. This is a secure signing environment with voice guidance to help you complete the process.`
        );

        // Check signer status
        if (signer.status === 'signed') {
          announceDocumentStatus(
            'Already signed',
            'This document has already been completed by you. Thank you for your participation!'
          );
          setIsCompleted(true);
        } else {
          // Provide detailed signing instructions
          setTimeout(() => {
            const fieldCount = document.fields.filter(f => 
              f.signerId === signer.id || !f.signerId
            ).length;
            
            speak(
              `Welcome ${signer.name}. You are about to sign "${document.title}". 
              This document has ${fieldCount} fields that need your attention. 
              I will guide you through each step of the signing process. 
              You can use your mouse, keyboard, or touch to interact with the document. 
              Voice instructions will help you navigate and complete each field.`,
              'normal'
            );
            
            // Additional accessibility instructions
            setTimeout(() => {
              speak(
                'Accessibility features: Use Tab key to navigate between fields, Enter to interact with fields, and Ctrl+H for contextual help. You can disable voice guidance at any time using the voice control button.',
                'low'
              );
            }, 4000);
          }, 2000);
        }
        
        setHasInitialized(true);
      }, 1000);

      return () => {
        clearTimeout(timer);
        stop();
      };
    }
  }, [hasInitialized, document, signer, navigate, announcePageChange, announceDocumentStatus, announceError, speak, stop]);

  const handleSigningComplete = () => {
    setIsCompleted(true);
    announceSuccess(
      'Document signing completed',
      `Congratulations ${signer?.name}! You have successfully signed "${document?.title}". All parties will be notified of the completion. You will be redirected shortly.`
    );
    
    // Auto-redirect after success message
    setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
  };

  const toggleVoiceGuidance = () => {
    const newState = !settings.enabled;
    updateSettings({ enabled: newState });
    
    if (newState) {
      speak('Voice guidance enabled. I will provide instructions and feedback throughout the signing process.', 'high');
    } else {
      speak('Voice guidance disabled. You can re-enable it at any time using this button.', 'high');
    }
  };

  if (!document || !signer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Document Not Found</h2>
            <p className="text-gray-600 mb-4">The signing link you're looking for doesn't exist or has expired.</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              onFocus={() => speak('Go to Dashboard button focused. Press Enter to navigate to the main dashboard.', 'normal')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted || signer.status === 'signed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4" role="img" aria-label="Success checkmark">✅</div>
            <h2 className="text-xl font-semibold mb-2">Document Signed Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for signing "{document.title}". All parties will be notified of the completion.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              onFocus={() => speak('Go to Dashboard button focused. Press Enter to return to the main dashboard.', 'normal')}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Voice Control Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                onFocus={() => speak('Back button focused. Press Enter to return to dashboard.', 'normal')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Document Signing</h1>
                <p className="text-sm text-gray-600">Secure signing environment</p>
              </div>
            </div>
            
            <Button
              variant={settings.enabled ? "default" : "outline"}
              size="sm"
              onClick={toggleVoiceGuidance}
              className="flex items-center gap-2"
              title={settings.enabled ? "Disable voice guidance" : "Enable voice guidance"}
              onFocus={() => speak(`Voice guidance control button focused. Currently ${settings.enabled ? 'enabled' : 'disabled'}. Press Enter to toggle.`, 'normal')}
            >
              {settings.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {settings.enabled ? 'Voice On' : 'Voice Off'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Signing Interface */}
      <div className="container mx-auto px-4 py-8">
        <DocumentSigning
          document={document}
          currentSigner={signer}
          onComplete={handleSigningComplete}
        />
      </div>

      {/* Accessibility Notice */}
      {settings.enabled && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-xs text-blue-800">
                🎙️ Voice guidance is active. Press Ctrl+H for help, Tab to navigate fields.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SigningPage;
