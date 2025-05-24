
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument } from '@/contexts/DocumentContext';
import { DocumentSigning } from '@/components/DocumentSigning';

const SigningPage = () => {
  const { documentId, signerId } = useParams();
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const { documents } = useDocument();
  const [isCompleted, setIsCompleted] = useState(false);

  const document = documents.find(doc => doc.id === documentId);
  const signer = document?.signers.find(s => s.id === signerId);

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      if (!document || !signer) {
        speak("Document or signer not found. Taking you back to the dashboard.", 'high');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      if (signer.status === 'signed') {
        speak("This document has already been signed. Thank you!", 'normal');
        setIsCompleted(true);
      } else {
        speak(`Welcome ${signer.name}. Please review and sign the document titled "${document.title}". I'll guide you through each field that needs to be completed.`, 'normal');
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop, document, signer, navigate]);

  if (!document || !signer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Document Not Found</h2>
            <p className="text-gray-600 mb-4">The signing link you're looking for doesn't exist or has expired.</p>
            <Button onClick={() => navigate('/dashboard')}>
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
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">Document Signed Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for signing "{document.title}". All parties will be notified of the completion.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <DocumentSigning
          document={document}
          currentSigner={signer}
          onComplete={() => {
            setIsCompleted(true);
            speak("Congratulations! You have successfully signed the document. Thank you!", 'high');
          }}
        />
      </div>
    </div>
  );
};

export default SigningPage;
