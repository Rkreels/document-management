
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
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary shadow-glow mb-8">
            <FileText className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
            Document Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Streamline your document workflows with electronic signatures, templates, and intelligent voice guidance powered by cutting-edge technology
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="group transition-spring hover:scale-105 cursor-pointer border-border/50" 
                onClick={() => handleNavigation('/dashboard', 'Taking you to the main dashboard where you can manage all your documents')}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-smooth group-hover:translate-x-1" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                Dashboard
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                View analytics, manage documents, and control your entire workflow from one central hub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="glass" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="group transition-spring hover:scale-105 cursor-pointer border-border/50"
                onClick={() => handleNavigation('/editor', 'Opening the document editor where you can create and edit documents')}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-smooth group-hover:translate-x-1" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                Create Document
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Upload PDFs, add interactive fields, and prepare documents for digital signatures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="glass" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Start Creating
              </Button>
            </CardContent>
          </Card>

          <Card className="group transition-spring hover:scale-105 cursor-pointer border-border/50"
                onClick={() => handleNavigation('/templates', 'Opening the template library with over 20 pre-built templates')}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-smooth group-hover:translate-x-1" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                Templates
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Access 20+ pre-built templates for contracts, agreements, and business documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="glass" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Browse Templates
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="text-center group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-smooth group-hover:shadow-glow">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Easy Document Creation</h3>
            <p className="text-muted-foreground leading-relaxed">Upload PDFs and add signature fields with intuitive drag-and-drop interface</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-smooth group-hover:shadow-glow">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Multi-Party Signing</h3>
            <p className="text-muted-foreground leading-relaxed">Send documents to multiple signers with customizable workflows and notifications</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-smooth group-hover:shadow-glow">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Secure & Compliant</h3>
            <p className="text-muted-foreground leading-relaxed">Bank-level security with comprehensive audit trails and compliance features</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-smooth group-hover:shadow-glow">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Voice Guidance</h3>
            <p className="text-muted-foreground leading-relaxed">Intelligent voice assistant to guide you through every step of the process</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-3xl mx-auto border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-3xl mb-4">Ready to transform your workflow?</CardTitle>
              <CardDescription className="text-lg leading-relaxed">
                Join thousands of professionals who trust our platform for secure, efficient document management and e-signatures
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center pt-0">
              <Button 
                variant="hero"
                onClick={() => handleNavigation('/dashboard', 'Taking you to the dashboard to begin managing your documents')}
                size="xl"
                className="w-full sm:w-auto"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => handleNavigation('/voice-training', 'Opening voice training to learn how to use voice guidance features')}
                className="w-full sm:w-auto"
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
