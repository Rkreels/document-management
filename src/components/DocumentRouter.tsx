
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useDocument } from '@/contexts/DocumentContext';
import { DocumentWorkflow } from './DocumentWorkflow';
import DocumentPreview from '@/pages/DocumentPreview';

export const DocumentRouter: React.FC = () => {
  const { documentId, signerId } = useParams();
  const { documents } = useDocument();

  const document = documents.find(doc => doc.id === documentId);

  if (!document) {
    return <Navigate to="/dashboard" replace />;
  }

  // If there's a signerId, show the workflow/signing interface
  if (signerId) {
    return (
      <DocumentWorkflow
        document={document}
        currentSignerId={signerId}
        onComplete={() => {
          // Handle completion - could redirect or show success
        }}
      />
    );
  }

  // Default to preview mode
  return <DocumentPreview />;
};
