import React, { createContext, useState, useEffect, useContext } from 'react';

export interface DocumentField {
  id: string;
  type: 'text' | 'signature' | 'date' | 'checkbox' | 'dropdown' | 'radio';
  label: string;
  required: boolean;
  value?: string | boolean;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  page: number;
  signerId?: string;
  tooltip?: string;
  validation?: {
    type: 'regex' | 'date' | 'email' | 'phone';
    pattern?: string;
    message?: string;
  };
  options?: string[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'sent' | 'in-progress' | 'completed' | 'declined' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  fields: DocumentField[];
  signers: Signer[];
  signingOrder: 'sequential' | 'parallel';
  template?: {
    id: string;
    name: string;
  };
  tags?: string[];
  folder?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reminderSettings?: {
    enabled: boolean;
    frequency: 'daily' | 'every-3-days' | 'weekly';
    maxReminders: number;
  };
  security?: {
    requireAuth: boolean;
    allowPrinting: boolean;
    allowDownload: boolean;
    watermark: boolean;
    ipRestriction: boolean;
    allowedIPs?: string[];
  };
  audit?: {
    views: number;
    downloads: number;
    lastViewed?: Date;
    ipAddresses: string[];
  };
  branding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
    customMessage?: string;
  };
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'sent' | 'signed' | 'declined' | 'bounced';
  signedAt?: Date;
  order: number;
  canDelegate?: boolean;
  requireAuth?: 'email' | 'sms' | 'knowledge' | 'id-verification';
  language?: string;
  timezone?: string;
  reminderCount?: number;
  lastReminder?: Date;
  ipAddress?: string;
  deviceInfo?: string;
  accessCode?: string;
  hostEmail?: string;
  privateMessage?: string;
}

export const DocumentContext = createContext<any>(null);

interface DocumentContextType {
  documents: Document[];
  currentDocument: Document | null;
  createDocument: (title: string, content?: string) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => Document;
  setCurrentDocument: (document: Document | null) => void;
  addField: (documentId: string, field: Omit<DocumentField, 'id'>) => void;
  updateField: (documentId: string, fieldId: string, updates: Partial<DocumentField>) => void;
  deleteField: (documentId: string, fieldId: string) => void;
  addSigner: (documentId: string, signer: Omit<Signer, 'id' | 'order'>) => void;
  updateSigner: (signerId: string, updates: Partial<Signer>) => void;
  removeSigner: (documentId: string, signerId: string) => void;
  sendDocument: (documentId: string) => void;
  sendReminder: (signerId: string) => void;
  bulkSend: (documentIds: string[]) => void;
  bulkDelete: (documentIds: string[]) => void;
  bulkMove: (documentIds: string[], folder: string) => void;
  bulkTag: (documentIds: string[], tags: string[]) => void;
  getDocumentsByFolder: (folder: string) => Document[];
  getDocumentsByTag: (tag: string) => Document[];
  getDocumentsByStatus: (status: Document['status']) => Document[];
  searchDocuments: (query: string) => Document[];
}

export const useDocument = () => useContext(DocumentContext) as DocumentContextType;

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

  useEffect(() => {
    // Demo data
    const initialDocuments: Document[] = [
      {
        id: '1',
        title: 'Sample NDA',
        content: 'JVBERi0xLjUKJcOiw6AKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4Kc3RhcnR4cmVmCjE1MgklRU9GCg==',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            id: '101',
            type: 'signature',
            label: 'Signature',
            required: true,
            position: { x: 50, y: 100 },
            size: { width: 150, height: 50 },
            page: 1,
            signerId: 'signer1'
          },
          {
            id: '102',
            type: 'text',
            label: 'Name',
            required: true,
            position: { x: 50, y: 150 },
            size: { width: 200, height: 30 },
            page: 1,
            signerId: 'signer1'
          }
        ],
        signers: [
          {
            id: 'signer1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Signer',
            status: 'pending',
            order: 1
          }
        ],
	signingOrder: 'sequential'
      },
      {
        id: '2',
        title: 'Partnership Agreement',
        content: 'JVBERi0xLjUKJcOiw6AKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4Kc3RhcnR4cmVmCjE1MgklRU9GCg==',
        status: 'in-progress',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            id: '201',
            type: 'signature',
            label: 'Partner 1 Signature',
            required: true,
            position: { x: 50, y: 100 },
            size: { width: 150, height: 50 },
            page: 1,
            signerId: 'partner1'
          },
          {
            id: '202',
            type: 'signature',
            label: 'Partner 2 Signature',
            required: true,
            position: { x: 50, y: 200 },
            size: { width: 150, height: 50 },
            page: 1,
            signerId: 'partner2'
          }
        ],
        signers: [
          {
            id: 'partner1',
            name: 'Alice Smith',
            email: 'alice.smith@example.com',
            role: 'Partner',
            status: 'signed',
            order: 1,
	    signedAt: new Date()
          },
          {
            id: 'partner2',
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            role: 'Partner',
            status: 'pending',
            order: 2
          }
        ],
	signingOrder: 'sequential'
      },
    ];
    setDocuments(initialDocuments);
  }, []);

  const createDocument = (title: string, content?: string): Document => {
    const newDocument: Document = {
      id: Date.now().toString(),
      title,
      content: content || '',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [],
      signers: [],
      signingOrder: 'sequential',
      priority: 'normal',
      reminderSettings: {
        enabled: true,
        frequency: 'daily',
        maxReminders: 3
      },
      security: {
        requireAuth: false,
        allowPrinting: true,
        allowDownload: true,
        watermark: false,
        ipRestriction: false
      },
      audit: {
        views: 0,
        downloads: 0,
        ipAddresses: []
      }
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

  const duplicateDocument = (id: string): Document => {
    const original = documents.find(doc => doc.id === id);
    if (!original) throw new Error('Document not found');
    
    const duplicate = createDocument(`${original.title} (Copy)`, original.content);
    updateDocument(duplicate.id, {
      fields: original.fields.map(field => ({ ...field, id: Date.now().toString() + Math.random() })),
      signers: original.signers.map(signer => ({ 
        ...signer, 
        id: Date.now().toString() + Math.random(),
        status: 'pending' as const,
        signedAt: undefined 
      })),
      signingOrder: original.signingOrder,
      tags: original.tags,
      folder: original.folder,
      security: original.security,
      reminderSettings: original.reminderSettings
    });
    
    return duplicate;
  };

  const addField = (documentId: string, field: Omit<DocumentField, 'id'>) => {
    const newField: DocumentField = {
      id: Date.now().toString(),
      ...field
    };

    updateDocument(documentId, {
      fields: [...documents.find(doc => doc.id === documentId)?.fields || [], newField]
    });
  };

  const updateField = (documentId: string, fieldId: string, updates: Partial<DocumentField>) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          fields: doc.fields.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
          )
        };
      }
      return doc;
    }));
  };

  const deleteField = (documentId: string, fieldId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          fields: doc.fields.filter(field => field.id !== fieldId)
        };
      }
      return doc;
    }));
  };

  const addSigner = (documentId: string, signer: Omit<Signer, 'id' | 'order'>) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    const newSigner: Signer = {
      ...signer,
      id: Date.now().toString(),
      order: document.signers.length + 1,
      status: 'pending',
      reminderCount: 0
    };

    updateDocument(documentId, {
      signers: [...document.signers, newSigner]
    });
  };

  const updateSigner = (signerId: string, updates: Partial<Signer>) => {
    setDocuments(prev => prev.map(doc => ({
      ...doc,
      signers: doc.signers.map(signer =>
        signer.id === signerId ? { ...signer, ...updates } : signer
      )
    })));
  };

  const removeSigner = (documentId: string, signerId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    updateDocument(documentId, {
      signers: document.signers.filter(signer => signer.id !== signerId),
      fields: document.fields.filter(field => field.signerId !== signerId)
    });
  };

  const sendDocument = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    // Mark first signer as sent if sequential, all signers if parallel
    const updatedSigners = document.signers.map((signer, index) => {
      if (document.signingOrder === 'sequential') {
        return index === 0 ? { ...signer, status: 'sent' as const } : signer;
      } else {
        return { ...signer, status: 'sent' as const };
      }
    });

    updateDocument(documentId, {
      status: 'sent',
      signers: updatedSigners
    });
  };

  const sendReminder = (signerId: string) => {
    updateSigner(signerId, {
      reminderCount: (documents.find(doc => 
        doc.signers.find(s => s.id === signerId)
      )?.signers.find(s => s.id === signerId)?.reminderCount || 0) + 1,
      lastReminder: new Date()
    });
  };

  const bulkSend = (documentIds: string[]) => {
    documentIds.forEach(id => sendDocument(id));
  };

  const bulkDelete = (documentIds: string[]) => {
    documentIds.forEach(id => deleteDocument(id));
  };

  const bulkMove = (documentIds: string[], folder: string) => {
    documentIds.forEach(id => updateDocument(id, { folder }));
  };

  const bulkTag = (documentIds: string[], tags: string[]) => {
    documentIds.forEach(id => updateDocument(id, { tags }));
  };

  const getDocumentsByFolder = (folder: string) => {
    return documents.filter(doc => doc.folder === folder);
  };

  const getDocumentsByTag = (tag: string) => {
    return documents.filter(doc => doc.tags?.includes(tag));
  };

  const getDocumentsByStatus = (status: Document['status']) => {
    return documents.filter(doc => doc.status === status);
  };

  const searchDocuments = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.signers.some(signer => 
        signer.name.toLowerCase().includes(lowerQuery) ||
        signer.email.toLowerCase().includes(lowerQuery)
      ) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const value = {
    documents,
    currentDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    setCurrentDocument,
    addField,
    updateField,
    deleteField,
    addSigner,
    updateSigner,
    removeSigner,
    sendDocument,
    sendReminder,
    bulkSend,
    bulkDelete,
    bulkMove,
    bulkTag,
    getDocumentsByFolder,
    getDocumentsByTag,
    getDocumentsByStatus,
    searchDocuments
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};
