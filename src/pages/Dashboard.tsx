
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Users, CheckCircle, Clock, Send, Archive, BarChart3, Bell, Smartphone, Palette, Settings, Link, Shield, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument } from '@/contexts/DocumentContext';
import { DocumentList } from '@/components/DocumentList';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { BulkDocumentActions } from '@/components/BulkDocumentActions';
import { DocumentAnalytics } from '@/components/DocumentAnalytics';
import { NotificationCenter } from '@/components/NotificationCenter';
import { APIIntegration } from '@/components/APIIntegration';
import { DocumentBranding } from '@/components/DocumentBranding';
import { MobileApp } from '@/components/MobileApp';
import { IdentityVerification } from '@/components/IdentityVerification';

const Dashboard = () => {
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const { documents, getDocumentStats } = useDocument();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [mainView, setMainView] = useState('documents');

  const stats = getDocumentStats();

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      if (documents.length === 0) {
        speak("Welcome to your DocuSign dashboard! You can create new documents, manage templates, or send documents for signing. Let's start by creating your first document.", 'normal');
      } else {
        speak(`Welcome back! You have ${documents.length} documents in your account. ${stats.pending} are pending signatures and ${stats.completed} are completed.`, 'normal');
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop, documents.length, stats]);

  const getFilteredDocuments = () => {
    switch (activeTab) {
      case 'draft':
        return documents.filter(doc => doc.status === 'draft');
      case 'sent':
        return documents.filter(doc => doc.status === 'sent');
      case 'completed':
        return documents.filter(doc => doc.status === 'completed');
      case 'archived':
        return documents.filter(doc => doc.status === 'voided' || doc.status === 'declined' || doc.status === 'expired');
      default:
        return documents;
    }
  };

  const handleCreateDocument = () => {
    speak("Let's create a new document. You can upload a PDF and add fields for signing.", 'high');
    setTimeout(() => navigate('/editor'), 1000);
  };

  const handleViewTemplates = () => {
    speak("Taking you to the templates library where you can create reusable document templates.", 'normal');
    setTimeout(() => navigate('/templates'), 800);
  };

  const handleBulkActionComplete = () => {
    setSelectedDocuments([]);
  };

  // Create a sample document for the NotificationCenter
  const sampleDocument = documents.length > 0 ? documents[0] : {
    id: 'sample',
    title: 'Sample Document',
    content: '',
    status: 'draft' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    fields: [],
    signers: [],
    signingOrder: 'sequential' as const
  };

  const renderMainContent = () => {
    switch (mainView) {
      case 'analytics':
        return <DocumentAnalytics />;
      case 'notifications':
        return <NotificationCenter document={sampleDocument} />;
      case 'integrations':
        return <APIIntegration />;
      case 'branding':
        return <DocumentBranding />;
      case 'mobile':
        return <MobileApp />;
      case 'security':
        return <IdentityVerification signerId="demo" onVerificationComplete={() => {}} verificationType="email" />;
      default:
        return (
          <>
            {/* Bulk Actions */}
            {selectedDocuments.length > 0 && (
              <div className="mb-6">
                <BulkDocumentActions
                  documents={getFilteredDocuments()}
                  selectedDocuments={selectedDocuments}
                  onSelectionChange={setSelectedDocuments}
                  onActionComplete={handleBulkActionComplete}
                />
              </div>
            )}

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>
                  Manage and track all your documents in one place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
                    <TabsTrigger value="all">
                      All ({documents.length})
                    </TabsTrigger>
                    <TabsTrigger value="draft">
                      Draft ({documents.filter(d => d.status === 'draft').length})
                    </TabsTrigger>
                    <TabsTrigger value="sent">
                      Sent ({documents.filter(d => d.status === 'sent').length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Done ({documents.filter(d => d.status === 'completed').length})
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                      Other ({documents.filter(d => ['voided', 'declined', 'expired'].includes(d.status)).length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-6">
                    <DocumentList 
                      documents={getFilteredDocuments()} 
                      selectedDocuments={selectedDocuments}
                      onSelectionChange={setSelectedDocuments}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your documents and signing workflows</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://careertodo.com/practice-lab', '_self')}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Lab Dashboard
            </Button>
            <Button variant="outline" onClick={handleViewTemplates}>
              <Archive className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button onClick={handleCreateDocument}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'documents', icon: FileText, label: 'Documents' },
              { key: 'analytics', icon: BarChart3, label: 'Analytics' },
              { key: 'notifications', icon: Bell, label: 'Notifications' },
              { key: 'integrations', icon: Link, label: 'Integrations' },
              { key: 'branding', icon: Palette, label: 'Branding' },
              { key: 'mobile', icon: Smartphone, label: 'Mobile' },
              { key: 'security', icon: Shield, label: 'Security' },
            ].map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant={mainView === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMainView(key)}
              >
                <Icon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All your documents
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting signatures
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Fully signed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageCompletionTime > 0 ? `${stats.averageCompletionTime.toFixed(1)}d` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Time to complete
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {renderMainContent()}

        {/* Global Search - Hidden by default, can be activated with Ctrl+K */}
        <div id="global-search-portal" />
        
        {/* Enhanced Workflow Manager */}
        <div id="workflow-manager-portal" />
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default Dashboard;
