
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Archive, Trash2, Copy, Download, MoreHorizontal } from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { useToast } from '@/hooks/use-toast';

interface BulkDocumentActionsProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (documentIds: string[]) => void;
  onActionComplete: () => void;
}

export const BulkDocumentActions: React.FC<BulkDocumentActionsProps> = ({
  documents,
  selectedDocuments,
  onSelectionChange,
  onActionComplete
}) => {
  const { updateDocument, deleteDocument, duplicateDocument, sendDocument } = useDocument();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(documents.map(doc => doc.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDocuments.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select documents to perform bulk actions.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      switch (action) {
        case 'send':
          selectedDocuments.forEach(docId => {
            const doc = documents.find(d => d.id === docId);
            if (doc && doc.status === 'draft') {
              sendDocument(docId);
            }
          });
          toast({
            title: 'Documents Sent',
            description: `${selectedDocuments.length} documents sent for signing.`
          });
          break;

        case 'archive':
          selectedDocuments.forEach(docId => {
            updateDocument(docId, { status: 'voided' });
          });
          toast({
            title: 'Documents Archived',
            description: `${selectedDocuments.length} documents archived.`
          });
          break;

        case 'delete':
          selectedDocuments.forEach(docId => {
            deleteDocument(docId);
          });
          toast({
            title: 'Documents Deleted',
            description: `${selectedDocuments.length} documents deleted.`
          });
          break;

        case 'duplicate':
          selectedDocuments.forEach(docId => {
            duplicateDocument(docId);
          });
          toast({
            title: 'Documents Duplicated',
            description: `${selectedDocuments.length} documents duplicated.`
          });
          break;

        default:
          break;
      }

      onSelectionChange([]);
      onActionComplete();
    } catch (error) {
      toast({
        title: 'Action Failed',
        description: 'Failed to perform bulk action. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionButtonVariant = (action: string) => {
    switch (action) {
      case 'send': return 'default';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  const bulkActions = [
    { id: 'send', label: 'Send for Signing', icon: Send },
    { id: 'duplicate', label: 'Duplicate', icon: Copy },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'delete', label: 'Delete', icon: Trash2 }
  ];

  if (selectedDocuments.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedDocuments.length === documents.length}
              onCheckedChange={handleSelectAll}
            />
            <span>{selectedDocuments.length} documents selected</span>
          </div>
          <Badge variant="secondary">{selectedDocuments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {bulkActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={getActionButtonVariant(action.id)}
                size="sm"
                onClick={() => handleBulkAction(action.id)}
                disabled={isProcessing}
                className="flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
