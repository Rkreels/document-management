import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  FileText, 
  Users, 
  Calendar, 
  Filter,
  X,
  Eye,
  Edit
} from 'lucide-react';
import { useDocument, Document, Template } from '@/contexts/DocumentContext';
import { useNavigate } from 'react-router-dom';
import { defaultTemplates } from '@/utils/defaultTemplates';

interface SearchResult {
  type: 'document' | 'template' | 'signer';
  id: string;
  title: string;
  subtitle?: string;
  relevance: number;
  data: any;
}

interface GlobalSearchManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const GlobalSearchManager: React.FC<GlobalSearchManagerProps> = ({
  isOpen = true,
  onClose
}) => {
  const { documents, templates } = useDocument();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all',
    type: 'all'
  });

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Search documents
    documents.forEach(doc => {
      let relevance = 0;
      
      if (doc.title.toLowerCase().includes(term)) relevance += 3;
      if (doc.status.toLowerCase().includes(term)) relevance += 2;
      if (doc.signers.some(s => s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term))) relevance += 2;
      if (doc.fields.some(f => f.type.toLowerCase().includes(term))) relevance += 1;

      if (relevance > 0) {
        results.push({
          type: 'document',
          id: doc.id,
          title: doc.title,
          subtitle: `${doc.status} • ${doc.signers.length} signers • ${doc.fields.length} fields`,
          relevance,
          data: doc
        });
      }
    });

    // Search templates
    defaultTemplates.forEach(template => {
      let relevance = 0;
      
      if (template.name.toLowerCase().includes(term)) relevance += 3;
      if (template.description.toLowerCase().includes(term)) relevance += 2;
      if (template.category.toLowerCase().includes(term)) relevance += 2;
      if (template.fields.some(f => f.label?.toLowerCase().includes(term))) relevance += 1;

      if (relevance > 0) {
        results.push({
          type: 'template',
          id: template.id,
          title: template.name,
          subtitle: `${template.category} • ${template.fields.length} fields`,
          relevance,
          data: template
        });
      }
    });

    // Search signers across all documents
    const uniqueSigners = new Map();
    documents.forEach(doc => {
      doc.signers.forEach(signer => {
        if (signer.name.toLowerCase().includes(term) || signer.email.toLowerCase().includes(term)) {
          const key = `${signer.name}-${signer.email}`;
          if (!uniqueSigners.has(key)) {
            uniqueSigners.set(key, {
              type: 'signer',
              id: signer.id,
              title: signer.name,
              subtitle: signer.email,
              relevance: signer.name.toLowerCase().includes(term) ? 3 : 2,
              data: signer
            });
          }
        }
      });
    });

    results.push(...Array.from(uniqueSigners.values()));

    // Apply filters
    const filteredResults = results.filter(result => {
      if (activeTab !== 'all' && result.type !== activeTab) return false;
      
      if (filters.status !== 'all' && result.type === 'document') {
        if ((result.data as Document).status !== filters.status) return false;
      }

      return true;
    });

    return filteredResults.sort((a, b) => b.relevance - a.relevance);
  }, [searchTerm, documents, activeTab, filters]);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'document':
        navigate(`/preview/${result.id}`);
        break;
      case 'template':
        navigate(`/template-preview/${result.id}`);
        break;
      case 'signer':
        // Filter documents by this signer
        navigate('/dashboard');
        break;
    }
    onClose?.();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'template': return <FileText className="h-4 w-4" />;
      case 'signer': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'template': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'signer': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const groupedResults = useMemo(() => {
    return searchResults.reduce((acc, result) => {
      if (!acc[result.type]) acc[result.type] = [];
      acc[result.type].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);
  }, [searchResults]);

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documents, templates, signers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({searchResults.length})</TabsTrigger>
              <TabsTrigger value="document">
                Documents ({groupedResults.document?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="template">
                Templates ({groupedResults.template?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="signer">
                Signers ({groupedResults.signer?.length || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        {!searchTerm.trim() ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start typing to search documents, templates, and signers</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No results found for "{searchTerm}"</p>
            <p className="text-sm mt-2">Try different keywords or check your spelling</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex-shrink-0">
                  {getTypeIcon(result.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{result.title}</h4>
                    <Badge className={getTypeColor(result.type)}>
                      {result.type}
                    </Badge>
                  </div>
                  {result.subtitle && (
                    <p className="text-sm text-muted-foreground truncate">
                      {result.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  {result.type !== 'signer' && (
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};