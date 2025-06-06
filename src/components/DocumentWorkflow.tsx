
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  Send, 
  AlertCircle, 
  ArrowRight,
  Eye,
  Download,
  Mail
} from 'lucide-react';
import { useDocument, Document, Signer } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';
import { DocumentSigning } from './DocumentSigning';

interface DocumentWorkflowProps {
  document: Document;
  currentSignerId?: string;
  onComplete?: () => void;
}

export const DocumentWorkflow: React.FC<DocumentWorkflowProps> = ({
  document,
  currentSignerId,
  onComplete
}) => {
  const { updateDocument, updateSigner } = useDocument();
  const { speak, announceWorkflowStep } = useVoice();
  const [activeTab, setActiveTab] = useState<'overview' | 'signing' | 'tracking'>('overview');
  const [currentSignerIndex, setCurrentSignerIndex] = useState(0);

  const currentSigner = currentSignerId 
    ? document.signers.find(s => s.id === currentSignerId)
    : document.signers[currentSignerIndex];

  const getWorkflowProgress = () => {
    const signedCount = document.signers.filter(s => s.status === 'signed').length;
    return Math.round((signedCount / document.signers.length) * 100);
  };

  const getNextSigner = () => {
    return document.signers.find(s => s.status === 'pending');
  };

  const handleCompleteSignature = () => {
    announceWorkflowStep('Signature Complete', 'Moving to next step in the workflow.');
    
    const nextSigner = getNextSigner();
    if (nextSigner) {
      // Simulate sending to next signer
      updateSigner(nextSigner.id, { status: 'sent' });
      speak(`Document sent to ${nextSigner.name} for signature.`, 'high');
    } else {
      // All signers completed
      updateDocument(document.id, { 
        status: 'completed', 
        completedAt: new Date() 
      });
      speak('All signatures completed! Document is now fully executed.', 'high');
    }
    
    onComplete?.();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'sent': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'declined': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  useEffect(() => {
    if (document.status === 'sent') {
      announceWorkflowStep(
        'Document Workflow',
        `${document.title} is in progress. ${document.signers.filter(s => s.status === 'signed').length} of ${document.signers.length} signers have completed their signatures.`
      );
    }
  }, [document, announceWorkflowStep]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Workflow: {document.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {document.signers.filter(s => s.status === 'signed').length} of {document.signers.length} completed
              </span>
            </div>
            <Progress value={getWorkflowProgress()} className="w-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {document.signers.filter(s => s.status === 'signed').length}
                </div>
                <div className="text-sm text-blue-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {document.signers.filter(s => s.status === 'pending' || s.status === 'sent').length}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {document.signers.filter(s => s.status === 'declined').length}
                </div>
                <div className="text-sm text-red-600">Declined</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="signing">
            <FileText className="h-4 w-4 mr-2" />
            Signing
          </TabsTrigger>
          <TabsTrigger value="tracking">
            <Send className="h-4 w-4 mr-2" />
            Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            {/* Signers Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Signing Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {document.signers.map((signer, index) => (
                    <div key={signer.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        {getStatusIcon(signer.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{signer.name}</p>
                          <Badge variant="outline">{signer.role}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{signer.email}</p>
                        {signer.signedAt && (
                          <p className="text-xs text-green-600">
                            Signed on {new Date(signer.signedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <Badge variant={
                        signer.status === 'signed' ? 'default' :
                        signer.status === 'declined' ? 'destructive' : 'secondary'
                      }>
                        {signer.status}
                      </Badge>
                      
                      {index < document.signers.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="signing">
          {currentSigner ? (
            <DocumentSigning
              document={document}
              currentSigner={currentSigner}
              onComplete={handleCompleteSignature}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Signatures Complete</h3>
                <p className="text-gray-600 mb-4">
                  All required signers have completed their signatures.
                </p>
                <Button onClick={() => updateDocument(document.id, { status: 'completed' })}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Completed Document
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Document Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Send className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Document sent for signing</p>
                    <p className="text-xs text-gray-600">
                      {document.createdAt.toLocaleDateString()} at {document.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {document.signers
                  .filter(s => s.signedAt)
                  .map(signer => (
                    <div key={signer.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{signer.name} signed the document</p>
                        <p className="text-xs text-gray-600">
                          {signer.signedAt && new Date(signer.signedAt).toLocaleDateString()} at{' '}
                          {signer.signedAt && new Date(signer.signedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                
                {document.status === 'completed' && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Document fully executed</p>
                      <p className="text-xs text-gray-600">
                        All parties have signed the document
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
