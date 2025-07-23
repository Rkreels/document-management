
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, Users, Shield, Zap, Eye, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';

const Index = () => {
  const navigate = useNavigate();
  const { speak, stop } = useVoice();

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      speak("Welcome to Document Management, your comprehensive platform for electronic document signing and workflow management. Navigate through the options to get started.", 'normal');
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop]);

  const handleNavigation = (path: string, description: string) => {
    speak(description, 'normal');
    setTimeout(() => navigate(path), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Document Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your document workflows with electronic signatures, templates, and intelligent voice guidance
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" 
                onClick={() => handleNavigation('/document-management/dashboard', 'Taking you to the main dashboard where you can manage all your documents')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Dashboard
              </CardTitle>
              <CardDescription>
                View and manage all your documents in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleNavigation('/document-management/editor', 'Opening the document editor where you can create and edit documents')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-green-600" />
                Create Document
              </CardTitle>
              <CardDescription>
                Upload and prepare documents for signing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Start Creating
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleNavigation('/document-management/templates', 'Opening the template library with over 20 pre-built templates')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-600" />
                Templates
              </CardTitle>
              <CardDescription>
                Browse and use pre-built document templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Browse Templates
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Document Creation</h3>
            <p className="text-gray-600">Upload PDFs and add signature fields with intuitive drag-and-drop</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Party Signing</h3>
            <p className="text-gray-600">Send documents to multiple signers with customizable workflows</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Compliant</h3>
            <p className="text-gray-600">Bank-level security with audit trails and compliance features</p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Voice Guidance</h3>
            <p className="text-gray-600">Intelligent voice assistant to guide you through every step</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>
                Begin your document management journey with our powerful platform
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 justify-center">
              <Button 
                onClick={() => handleNavigation('/document-management/dashboard', 'Taking you to the dashboard to begin managing your documents')}
                size="lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => handleNavigation('/document-management/voice-training', 'Opening voice training to learn how to use voice guidance features')}
              >
                Learn Voice Features
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default Index;
