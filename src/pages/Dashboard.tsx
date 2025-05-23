
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Upload, FileText, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';

const Dashboard = () => {
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const { documents } = useDocument();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      if (documents.length === 0) {
        speak("Welcome to your dashboard! This is where you'll manage all your documents. Since this is your first time, let's create your first document. Click the 'New Document' button to upload a PDF and start adding signature fields.", 'high');
      } else {
        speak(`Welcome back! You have ${documents.length} documents in your workspace. You can filter them by status using the tabs above, search for specific documents, or create a new document. What would you like to do?`, 'normal');
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop, documents.length]);

  const handleNewDocument = () => {
    speak("Perfect! Let's create a new document. I'll guide you through uploading a PDF and setting up signature fields.", 'high');
    setTimeout(() => navigate('/editor'), 1000);
  };

  const handleDocumentClick = (doc: Document) => {
    speak(`Opening ${doc.title}. This document is currently in ${doc.status} status. I'll help you continue where you left off.`, 'normal');
    setTimeout(() => navigate(`/preview/${doc.id}`), 800);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || doc.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: Document['status']) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
      sent: { label: 'Sent', variant: 'default' as const, icon: Clock },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
      declined: { label: 'Declined', variant: 'destructive' as const, icon: AlertCircle },
    };
    
    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const tabCounts = {
    all: documents.length,
    draft: documents.filter(d => d.status === 'draft').length,
    sent: documents.filter(d => d.status === 'sent').length,
    completed: documents.filter(d => d.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Document Dashboard</h1>
            <p className="text-gray-600">Manage and track all your documents</p>
          </div>
          <Button onClick={handleNewDocument} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Document Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({tabCounts.draft})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({tabCounts.sent})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({tabCounts.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredDocuments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {documents.length === 0 ? "No documents yet" : "No documents found"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {documents.length === 0 
                      ? "Start by creating your first document. Upload a PDF and add signature fields."
                      : "Try adjusting your search terms or filters."
                    }
                  </p>
                  {documents.length === 0 && (
                    <Button onClick={handleNewDocument}>
                      Create Your First Document
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                        {getStatusBadge(doc.status)}
                      </div>
                      <CardDescription>
                        Created {doc.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Signers:</span>
                          <span>{doc.signers.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fields:</span>
                          <span>{doc.fields.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last updated:</span>
                          <span>{doc.updatedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default Dashboard;
