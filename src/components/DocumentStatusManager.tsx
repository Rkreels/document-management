import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Send,
  Eye,
  Download,
  MessageSquare,
  Calendar,
  Users
} from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { useToast } from '@/hooks/use-toast';

interface DocumentStatusManagerProps {
  document: Document;
}

export const DocumentStatusManager: React.FC<DocumentStatusManagerProps> = ({ document }) => {
  const { updateDocument, sendDocument, createNotification } = useDocument();
  const { toast } = useToast();
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<Document['status']>('draft');

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      case 'voided':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'voided':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDescription = (status: Document['status']) => {
    switch (status) {
      case 'draft':
        return 'Document is being prepared and edited';
      case 'sent':
        return 'Document has been sent to signers';
      case 'in-progress':
        return 'Document is being reviewed and signed';
      case 'completed':
        return 'All parties have signed the document';
      case 'declined':
        return 'Document was declined by a signer';
      case 'expired':
        return 'Document signing period has expired';
      case 'voided':
        return 'Document has been voided and cancelled';
      default:
        return 'Unknown status';
    }
  };

  const getAvailableStatusTransitions = (currentStatus: Document['status']): Document['status'][] => {
    switch (currentStatus) {
      case 'draft':
        return ['sent', 'voided'];
      case 'sent':
        return ['in-progress', 'expired', 'voided'];
      case 'in-progress':
        return ['completed', 'declined', 'expired', 'voided'];
      case 'completed':
        return ['voided'];
      case 'declined':
        return ['draft', 'voided'];
      case 'expired':
        return ['draft', 'voided'];
      case 'voided':
        return ['draft'];
      default:
        return [];
    }
  };

  const handleStatusChange = () => {
    if (!statusChangeReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the status change.",
        variant: "destructive",
      });
      return;
    }

    const updates: Partial<Document> = {
      status: newStatus,
      updatedAt: new Date()
    };

    // Set completion or void date
    if (newStatus === 'completed') {
      updates.completedAt = new Date();
    }

    updateDocument(document.id, updates);

    // Create notification for status change
    createNotification({
      type: 'signed', // Using allowed type
      title: `Document Status Changed`,
      message: `Document "${document.title}" status changed to ${newStatus}. Reason: ${statusChangeReason}`,
      documentId: document.id,
      read: false
    });

    toast({
      title: "Status Updated",
      description: `Document status changed to ${newStatus}.`,
    });

    setShowStatusDialog(false);
    setStatusChangeReason('');
  };

  const handleSendDocument = () => {
    sendDocument(document.id);
    toast({
      title: "Document Sent",
      description: "Document has been sent to all signers.",
    });
  };

  const getSignerProgress = () => {
    if (document.signers.length === 0) return { signed: 0, total: 0, percentage: 0 };
    
    const signed = document.signers.filter(s => s.status === 'signed').length;
    const total = document.signers.length;
    const percentage = total > 0 ? Math.round((signed / total) * 100) : 0;
    
    return { signed, total, percentage };
  };

  const progress = getSignerProgress();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Document Status Management
          </div>
          <Badge className={getStatusColor(document.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(document.status)}
              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </div>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Status Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium">Current Status</h4>
              <p className="text-sm text-gray-600">{getStatusDescription(document.status)}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Updated: {document.updatedAt.toLocaleDateString()}</p>
              {document.sentAt && <p>Sent: {document.sentAt.toLocaleDateString()}</p>}
              {document.completedAt && <p>Completed: {document.completedAt.toLocaleDateString()}</p>}
            </div>
          </div>
        </div>

        {/* Signing Progress */}
        {document.signers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Signing Progress
              </h4>
              <span className="text-sm text-gray-600">
                {progress.signed} of {progress.total} signed ({progress.percentage}%)
              </span>
            </div>
            
            <div className="space-y-2">
              {document.signers.map((signer) => (
                <div key={signer.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {signer.status === 'signed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{signer.name}</p>
                      <p className="text-xs text-gray-600">{signer.email}</p>
                    </div>
                  </div>
                  <Badge variant={signer.status === 'signed' ? 'default' : 'outline'}>
                    {signer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {document.status === 'draft' && document.signers.length > 0 && (
            <Button onClick={handleSendDocument}>
              <Send className="h-4 w-4 mr-2" />
              Send Document
            </Button>
          )}

          {getAvailableStatusTransitions(document.status).length > 0 && (
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Change Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Document Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>New Status</Label>
                    <Select value={newStatus} onValueChange={(value: Document['status']) => setNewStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableStatusTransitions(document.status).map((status) => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Reason for Change</Label>
                    <Textarea
                      placeholder="Explain why you're changing the document status..."
                      value={statusChangeReason}
                      onChange={(e) => setStatusChangeReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleStatusChange}>
                      Update Status
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};