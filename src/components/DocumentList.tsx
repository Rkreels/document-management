import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Eye, 
  Edit, 
  Send, 
  Download, 
  Trash2,
  Search,
  Filter,
  Calendar,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { BulkActions } from './BulkActions';

interface DocumentListProps {
  documents: Document[];
  showBulkActions?: boolean;
  selectedDocuments?: string[];
  onSelectionChange?: (selectedDocuments: string[]) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  showBulkActions = true,
  selectedDocuments: externalSelectedDocuments,
  onSelectionChange: externalOnSelectionChange
}) => {
  const navigate = useNavigate();
  const { deleteDocument, sendDocument } = useDocument();
  const [internalSelectedDocuments, setInternalSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');

  // Use external state if provided, otherwise use internal state
  const selectedDocuments = externalSelectedDocuments || internalSelectedDocuments;
  const setSelectedDocuments = externalOnSelectionChange || setInternalSelectedDocuments;

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
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

  const handleDocumentSelect = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments([...selectedDocuments, documentId]);
    } else {
      setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'voided': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'sent': return '📤';
      case 'draft': return '📝';
      case 'declined': return '❌';
      case 'voided': return '🚫';
      case 'expired': return '⏰';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="voided">Voided</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
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
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {showBulkActions && (
        <BulkActions
          documents={filteredDocuments}
          selectedDocuments={selectedDocuments}
          onSelectionChange={setSelectedDocuments}
        />
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? "Try adjusting your search or filter criteria."
                  : "Start by creating your first document."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {showBulkActions && (
                    <Checkbox
                      checked={selectedDocuments.includes(document.id)}
                      onCheckedChange={(checked) => 
                        handleDocumentSelect(document.id, checked as boolean)
                      }
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getStatusIcon(document.status)}</span>
                      <h3 className="font-medium truncate">{document.title}</h3>
                      <Badge className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {document.updatedAt.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {document.signers.length} signers
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {document.fields.length} fields
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/preview/${document.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/editor/${document.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {document.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendDocument(document.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDocument(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
