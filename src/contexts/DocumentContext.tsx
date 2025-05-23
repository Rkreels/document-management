
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DocumentField {
  id: string;
  type: 'signature' | 'text' | 'date' | 'checkbox';
  x: number;
  y: number;
  width: number;
  height: number;
  signerId?: string;
  required: boolean;
  value?: string;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: 'signer' | 'viewer' | 'approver';
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
}

export interface Document {
  id: string;
  title: string;
  content: string; // base64 PDF data
  fields: DocumentField[];
  signers: Signer[];
  status: 'draft' | 'sent' | 'completed' | 'declined';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface DocumentContextType {
  documents: Document[];
  currentDocument: Document | null;
  createDocument: (title: string, content: string) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setCurrentDocument: (document: Document | null) => void;
  addField: (field: Omit<DocumentField, 'id'>) => void;
  updateField: (fieldId: string, updates: Partial<DocumentField>) => void;
  removeField: (fieldId: string) => void;
  addSigner: (signer: Omit<Signer, 'id'>) => void;
  updateSigner: (signerId: string, updates: Partial<Signer>) => void;
  removeSigner: (signerId: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

  // Load documents from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('docuSignClone_documents');
    if (saved) {
      try {
        const parsedDocs = JSON.parse(saved).map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
          completedAt: doc.completedAt ? new Date(doc.completedAt) : undefined,
        }));
        setDocuments(parsedDocs);
      } catch (error) {
        console.error('Error loading documents from localStorage:', error);
      }
    }
  }, []);

  // Save documents to localStorage whenever documents change
  useEffect(() => {
    localStorage.setItem('docuSignClone_documents', JSON.stringify(documents));
  }, [documents]);

  const createDocument = (title: string, content: string): Document => {
    const newDocument: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      fields: [],
      signers: [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, ...updates, updatedAt: new Date() }
        : doc
    ));
    
    if (currentDocument?.id === id) {
      setCurrentDocument(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (currentDocument?.id === id) {
      setCurrentDocument(null);
    }
  };

  const addField = (field: Omit<DocumentField, 'id'>) => {
    if (!currentDocument) return;

    const newField: DocumentField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedFields = [...currentDocument.fields, newField];
    updateDocument(currentDocument.id, { fields: updatedFields });
  };

  const updateField = (fieldId: string, updates: Partial<DocumentField>) => {
    if (!currentDocument) return;

    const updatedFields = currentDocument.fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    updateDocument(currentDocument.id, { fields: updatedFields });
  };

  const removeField = (fieldId: string) => {
    if (!currentDocument) return;

    const updatedFields = currentDocument.fields.filter(field => field.id !== fieldId);
    updateDocument(currentDocument.id, { fields: updatedFields });
  };

  const addSigner = (signer: Omit<Signer, 'id'>) => {
    if (!currentDocument) return;

    const newSigner: Signer = {
      ...signer,
      id: `signer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedSigners = [...currentDocument.signers, newSigner];
    updateDocument(currentDocument.id, { signers: updatedSigners });
  };

  const updateSigner = (signerId: string, updates: Partial<Signer>) => {
    if (!currentDocument) return;

    const updatedSigners = currentDocument.signers.map(signer =>
      signer.id === signerId ? { ...signer, ...updates } : signer
    );
    updateDocument(currentDocument.id, { signers: updatedSigners });
  };

  const removeSigner = (signerId: string) => {
    if (!currentDocument) return;

    const updatedSigners = currentDocument.signers.filter(signer => signer.id !== signerId);
    updateDocument(currentDocument.id, { signers: updatedSigners });
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      currentDocument,
      createDocument,
      updateDocument,
      deleteDocument,
      setCurrentDocument,
      addField,
      updateField,
      removeField,
      addSigner,
      updateSigner,
      removeSigner,
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};
