
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Bookmark,
  MoreHorizontal,
  Copy,
  Send,
  Eye,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Dashboard = () => {
  const navigate = useNavigate();
  const { speak, stop } = useVoice();
  const { documents, templates, duplicateDocument, voidDocument, getDocumentStats } = useDocument();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');

  const stats = getDocumentStats();

  useEffect(() => {
    stop();
    
    const timer = setTimeout(() => {
      if (documents.length === 0) {
        speak("Welcome to your enhanced dashboard! This DocuSign clone now includes advanced features like sequential signing, analytics, notifications, and more. Create your first document to get started.", 'high');
      } else {
        speak(`Welcome back! You have ${documents.length} documents. ${stats.pending} are pending signatures and ${stats.completed} are completed. Your average completion time is ${stats.averageCompletionTime.toFixed(1)} days.`, 'normal');
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [speak, stop, documents.length, stats]);

  const handleNewDocument = () => {
    speak("Perfect! Let's create a new document with all the advanced features.", 'high');
    setTimeout(() => navigate('/editor'), 1000);
  };

  const handleTemplates = () => {
    speak(`You have ${templates.length} templates available. Templates include advanced features like conditional fields and workflow automation.`, 'normal');
    setTimeout(() => navigate('/templates'), 800);
  };

  const handleDocumentClick = (doc: Document) => {
    speak(`Opening ${doc.title}. This document is in ${doc.status} status with ${doc.signers.length} signers.`, 'normal');
    setTimeout(() => navigate(`/preview/${doc.id}`), 800);
  };

  const handleDuplicateDocument = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const duplicate = duplicateDocument(doc.id);
      speak(`Document duplicated successfully. Opening the copy.`, 'normal');
      setTimeout(() => navigate(`/editor/${duplicate.id}`), 1000);
    } catch (error) {
      speak("Error duplicating document.", 'high');
    }
  };

  const handleVoidDocument = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = prompt("Please provide a reason for voiding this document:");
    if (reason) {
      voidDocument(doc.id, reason);
      speak("Document voided successfully.", 'normal');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || doc.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'createdAt':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'updatedAt':
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime();
    }
  });

  const getStatusBadge = (status: Document['status']) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
      sent: { label: 'Sent', variant: 'default' as const, icon: Clock },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
      declined: { label: 'Declined', variant: 'destructive' as const, icon: AlertCircle },
      expired: { label: 'Expired', variant: 'destructive' as const, icon: Clock },
      voided: { label: 'Voided', variant: 'destructive' as const, icon: AlertCircle },
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

  const getCompletionPercentage = (doc: Document) => {
    if (doc.fields.length === 0) return 0;
    const completedFields = doc.fields.filter(field => field.value).length;
    return Math.round((completedFields / doc.fields.length) * 100);
  };

  const tabCounts = {
    all: documents.length,
    draft: documents.filter(d => d.status === 'draft').length,
    sent: documents.filter(d => d.status === 'sent').length,
    completed: documents.filter(d => d.status === 'completed').length,
    expired: documents.filter(d => d.status === 'expired').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Document Dashboard</h1>
            <p className="text-gray-600">Advanced document management and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTemplates} className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Templates ({templates.length})
            </Button>
            <Button onClick={handleNewDocument} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Document
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg. Completion</p>
                  <p className="text-2xl font-bold">{stats.averageCompletionTime.toFixed(1)}d</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Document Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
            <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({tabCounts.draft})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({tabCounts.sent})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({tabCounts.completed})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({tabCounts.expired})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {sortedDocuments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {documents.length === 0 ? "No documents yet" : "No documents found"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {documents.length === 0 
                      ? "Start by creating your first document with advanced DocuSign features."
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
                {sortedDocuments.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(doc.status)}
                            <Badge variant="outline" className="text-xs">
                              {doc.signingOrder}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={(e) => handleDuplicateDocument(doc, e)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/editor/${doc.id}`);
                            }}>
                              <FileText className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {doc.status === 'sent' && (
                              <DropdownMenuItem onClick={(e) => handleVoidDocument(doc, e)}>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Void
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription>
                        Created {doc.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-gray-600">
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
                        
                        {/* Completion Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Completion:</span>
                            <span>{getCompletionPercentage(doc)}%</span>
                          </div>
                          <Progress value={getCompletionPercentage(doc)} className="h-2" />
                        </div>

                        {/* Expiration Warning */}
                        {doc.expiresAt && new Date() > doc.expiresAt && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
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
