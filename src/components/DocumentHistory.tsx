
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, Send, CheckCircle, Edit } from 'lucide-react';
import { Document } from '@/contexts/DocumentContext';

interface DocumentHistoryProps {
  document: Document;
}

export const DocumentHistory: React.FC<DocumentHistoryProps> = ({ document }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <FileText className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'signed':
        return <CheckCircle className="h-4 w-4" />;
      case 'viewed':
        return <User className="h-4 w-4" />;
      case 'edited':
        return <Edit className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const mockHistory = [
    {
      id: '1',
      type: 'created',
      description: 'Document created',
      user: 'System',
      timestamp: new Date(document.createdAt),
      details: 'Initial document creation'
    },
    {
      id: '2',
      type: 'edited',
      description: 'Fields added',
      user: 'Admin User',
      timestamp: new Date(document.updatedAt),
      details: `Added ${document.fields.length} fields to document`
    },
    ...(document.status === 'sent' || document.status === 'completed' ? [{
      id: '3',
      type: 'sent',
      description: 'Document sent for signing',
      user: 'Admin User',
      timestamp: new Date(),
      details: `Sent to ${document.signers.length} signers`
    }] : []),
    ...document.signers
      .filter(signer => signer.status === 'signed')
      .map((signer, index) => ({
        id: `sign-${index}`,
        type: 'signed',
        description: `Document signed by ${signer.name}`,
        user: signer.name,
        timestamp: signer.signedAt || new Date(),
        details: `Signed as ${signer.role}`
      }))
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockHistory.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{activity.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.timestamp.toLocaleDateString()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
