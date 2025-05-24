
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Download, 
  Trash2, 
  Copy, 
  FolderOpen,
  CheckSquare,
  Archive,
  Clock
} from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';

interface BulkActionsProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (documentIds: string[]) => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  documents,
  selectedDocuments,
  onSelectionChange
}) => {
  const { updateDocument, deleteDocument, duplicateDocument, sendDocument } = useDocument();
  const [bulkAction, setBulkAction] = useState<string>('');

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(documents.map(doc => doc.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedDocuments.length === 0) return;

    selectedDocuments.forEach(documentId => {
      switch (bulkAction) {
        case 'send':
          updateDocument(documentId, { status: 'sent' });
          break;
        case 'duplicate':
          duplicateDocument(documentId);
          break;
        case 'delete':
          deleteDocument(documentId);
          break;
        case 'archive':
          updateDocument(documentId, { status: 'voided' });
          break;
        case 'remind':
          sendDocument(documentId, 'Reminder: Please sign this document');
          break;
      }
    });

    setBulkAction('');
    onSelectionChange([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'voided': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Bulk Actions
            {selectedDocuments.length > 0 && (
              <Badge variant="secondary">{selectedDocuments.length} selected</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedDocuments.length === documents.length ? 'Deselect All' : 'Select All'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDocuments.length > 0 ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send for Signing
                    </div>
                  </SelectItem>
                  <SelectItem value="duplicate">
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </div>
                  </SelectItem>
                  <SelectItem value="remind">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Send Reminder
                    </div>
                  </SelectItem>
                  <SelectItem value="archive">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Archive
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                Apply Action
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Documents:</h4>
              {selectedDocuments.map(docId => {
                const doc = documents.find(d => d.id === docId);
                if (!doc) return null;
                
                return (
                  <div key={docId} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{doc.title}</span>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Select documents to perform bulk actions</p>
            <p className="text-sm text-gray-400">
              Use checkboxes to select multiple documents
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
