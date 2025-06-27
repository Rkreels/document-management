
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';

const Index = () => {
  const navigate = useNavigate();
  const { speak, stop } = useVoice();

  useEffect(() => {
    // Stop any previous voice instructions
    stop();
    
    // Welcome message after a brief delay
    const timer = setTimeout(() => {
      speak("Welcome to Document Management! I'm your voice-guided assistant. I'll help you learn how to create, manage, and sign documents digitally. Click 'Get Started' to begin your journey, or explore the features below to learn more about what we can do together.", 'high');
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop]);

  const handleGetStarted = () => {
    speak("Great choice! Let's head to your dashboard where you can see all your documents and create new ones. I'll guide you through every step!", 'high');
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const features = [
    {
      icon: FileText,
      title: "Smart Document Management",
      description: "Upload, organize, and manage your documents with intelligent voice guidance."
    },
    {
      icon: Users,
      title: "Multi-Signer Workflows",
      description: "Add multiple signers and manage complex approval processes effortlessly."
    },
    {
      icon: Shield,
      title: "Secure Local Storage",
      description: "Your documents stay private with secure browser-based storage."
    },
    {
      icon: Zap,
      title: "Voice-Guided Learning",
      description: "Learn e-signature best practices with our interactive voice assistant."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Document Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Learn digital signatures with our voice-guided interactive platform. 
            Experience the future of document signing with personalized training.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="text-center hover:shadow-lg transition-shadow duration-200 border-0 shadow-md"
            >
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-fit">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Experience Interactive Learning</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our voice assistant will guide you through every step of the document signing process. 
            From uploading files to managing signatures, you'll learn industry best practices.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="hover:bg-blue-50"
            >
              View Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
              className="hover:bg-purple-50"
            >
              Voice Settings
            </Button>
          </div>
        </div>
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default Index;
