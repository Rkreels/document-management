import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DocumentField {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  value?: string | boolean;
  label?: string;
  required?: boolean;
  signer?: string;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'sent' | 'completed' | 'declined' | 'voided' | 'expired';
  signingOrder: 'sequential' | 'parallel';
  createdAt: Date;
  updatedAt: Date;
  auditTrail: AuditEvent[];
  fields: DocumentField[];
  signers: Signer[];
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  type: string;
  user: string;
  details: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  fields: DocumentField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  documentId?: string;
}

interface DocumentContextType {
  documents: Document[];
  currentDocument: Document | null;
  templates: DocumentTemplate[];
  notifications: Notification[];
  setCurrentDocument: (document: Document | null) => void;
  createDocument: (title: string, content?: string) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  addField: (documentId: string, field: Omit<DocumentField, 'id'>) => void;
  updateField: (documentId: string, fieldId: string, updates: Partial<DocumentField>) => void;
  deleteField: (documentId: string, fieldId: string) => void;
  addSigner: (documentId: string, signer: Omit<Signer, 'id'>) => void;
  updateSigner: (documentId: string, signerId: string, updates: Partial<Signer>) => void;
  deleteSigner: (documentId: string, signerId: string) => void;
  sendDocument: (documentId: string) => void;
  signDocument: (documentId: string, signerId: string) => void;
  createTemplate: (template: Omit<DocumentTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  uploadPDFToDocument: (documentId: string, base64Data: string, fileName: string) => void;
  getDocumentStats: () => {
    total: number;
    completed: number;
    pending: number;
    draft: number;
    averageCompletionTime: number;
  };
}

export const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([sampleDocument]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(sampleDocument);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedDocuments = localStorage.getItem('documents');
    const savedTemplates = localStorage.getItem('templates');
    const savedNotifications = localStorage.getItem('notifications');

    if (savedDocuments) {
      try {
        const parsedDocuments = JSON.parse(savedDocuments);
        // Convert string dates back to Date objects
        const documentsWithDates = parsedDocuments.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
          auditTrail: doc.auditTrail.map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp)
          })),
          signers: doc.signers.map((signer: any) => ({
            ...signer,
            signedAt: signer.signedAt ? new Date(signer.signedAt) : undefined
          }))
        }));
        setDocuments(documentsWithDates);
      } catch (error) {
        console.error('Error parsing documents from localStorage:', error);
      }
    }

    if (savedTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedTemplates);
        const templatesWithDates = parsedTemplates.map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt)
        }));
        setTemplates(templatesWithDates);
      } catch (error) {
        console.error('Error parsing templates from localStorage:', error);
      }
    }

    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        const notificationsWithDates = parsedNotifications.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Error parsing notifications from localStorage:', error);
      }
    }
  }, []);

  // Helper function to generate unique IDs
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createDocument = (title: string, content?: string): Document => {
    const newDocument: Document = {
      id: generateId(),
      title,
      content: content || '', // Allow empty content initially
      status: 'draft',
      signingOrder: 'sequential',
      createdAt: new Date(),
      updatedAt: new Date(),
      auditTrail: [],
      fields: [],
      signers: []
    };

    setDocuments(prev => [...prev, newDocument]);
    setCurrentDocument(newDocument);
    
    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    savedDocuments.push(newDocument);
    localStorage.setItem('documents', JSON.stringify(savedDocuments));
    
    return newDocument;
  };

  const uploadPDFToDocument = (documentId: string, base64Data: string, fileName: string): void => {
    updateDocument(documentId, {
      content: base64Data,
      title: fileName.replace('.pdf', ''),
      updatedAt: new Date()
    });
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
    ));

    // Update currentDocument if it's the one being updated
    if (currentDocument && currentDocument.id === id) {
      setCurrentDocument(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : prev);
    }

    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = savedDocuments.map((doc: any) => 
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
    );
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));

    // Clear currentDocument if it's the one being deleted
    if (currentDocument && currentDocument.id === id) {
      setCurrentDocument(null);
    }

    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = savedDocuments.filter((doc: any) => doc.id !== id);
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };

  const addField = (documentId: string, field: Omit<DocumentField, 'id'>) => {
    const newField = { ...field, id: generateId() };
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { 
        ...doc, 
        fields: [...doc.fields, newField],
        updatedAt: new Date()
      } : doc
    ));

    // Update currentDocument if it's the one being modified
    if (currentDocument && currentDocument.id === documentId) {
      setCurrentDocument(prev => prev ? { 
        ...prev, 
        fields: [...prev.fields, newField],
        updatedAt: new Date()
      } : prev);
    }

    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = savedDocuments.map((doc: any) => 
      doc.id === documentId ? { 
        ...doc, 
        fields: [...doc.fields, newField],
        updatedAt: new Date()
      } : doc
    );
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };

  const updateField = (documentId: string, fieldId: string, updates: Partial<DocumentField>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { 
        ...doc, 
        fields: doc.fields.map(field => 
          field.id === fieldId ? { ...field, ...updates } : field
        ),
        updatedAt: new Date()
      } : doc
    ));

    // Update currentDocument if it's the one being modified
    if (currentDocument && currentDocument.id === documentId) {
      setCurrentDocument(prev => prev ? { 
        ...prev, 
        fields: prev.fields.map(field => 
          field.id === fieldId ? { ...field, ...updates } : field
        ),
        updatedAt: new Date()
      } : prev);
    }

    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = savedDocuments.map((doc: any) => 
      doc.id === documentId ? { 
        ...doc, 
        fields: doc.fields.map((field: any) => 
          field.id === fieldId ? { ...field, ...updates } : field
        ),
        updatedAt: new Date()
      } : doc
    );
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };

  const deleteField = (documentId: string, fieldId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { 
        ...doc, 
        fields: doc.fields.filter(field => field.id !== fieldId),
        updatedAt: new Date()
      } : doc
    ));

    // Update currentDocument if it's the one being modified
    if (currentDocument && currentDocument.id === documentId) {
      setCurrentDocument(prev => prev ? { 
        ...prev, 
        fields: prev.fields.filter(field => field.id !== fieldId),
        updatedAt: new Date()
      } : prev);
    }

    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = savedDocuments.map((doc: any) => 
      doc.id === documentId ? { 
        ...doc, 
        fields: doc.fields.filter((field: any) => field.id !== fieldId),
        updatedAt: new Date()
      } : doc
    );
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };

  const addSigner = (documentId: string, signer: Omit<Signer, 'id'>) => {
    const newSigner = { ...signer, id: generateId() };
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { 
        ...doc, 
        signers: [...doc.signers, newSigner],
        updatedAt: new Date()
      } : doc
    ));

    // Update currentDocument if it's the one being modified
    if (currentDocument && currentDocument.id === documentId) {
      setCurrentDocument(prev => prev ? { 
        ...prev, 
        signers: [...prev.signers, newSigner],
        updatedAt: new Date()
      } : prev);
    }

    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = savedDocuments.map((doc: any) => 
      doc.id === documentId ? { 
        ...doc, 
        signers: [...doc.signers, newSigner],
        updatedAt: new Date()
      } : doc
    );
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };

  const updateSigner = (documentId: string, signerId: string, updates: Partial<Signer>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { 
        ...doc, 
        signers: doc.signers.map(signer => 
          signer.id === signerId ? { ...signer, ...updates } : signer
        ),
        updatedAt: new Date()
      } : doc
    ));

    // Update currentDocument if it's the one being modified
    if (currentDocument && currentDocument.id === documentId) {
      setCurrentDocument(prev => prev ? { 
        ...prev, 
        signers: prev.signers.map(signer => 
          signer.id === signerId ? { ...signer, ...updates } : signer
        ),
        updatedAt: new Date()
      } : prev);
    }

    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = savedDocuments.map((doc: any) => 
      doc.id === documentId ? { 
        ...doc, 
        signers: doc.signers.map((signer: any) => 
          signer.id === signerId ? { ...signer, ...updates } : signer
        ),
        updatedAt: new Date()
      } : doc
    );
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };

  const deleteSigner = (documentId: string, signerId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { 
        ...doc, 
        signers: doc.signers.filter(signer => signer.id !== signerId),
        updatedAt: new Date()
      } : doc
    ));

    // Update currentDocument if it's the one being modified
    if (currentDocument && currentDocument.id === documentId) {
      setCurrentDocument(prev => prev ? { 
        ...prev, 
        signers: prev.signers.filter(signer => signer.id !== signerId),
        updatedAt: new Date()
      } : prev);
    }

    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = savedDocuments.map((doc: any) => 
      doc.id === documentId ? { 
        ...doc, 
        signers: doc.signers.filter((signer: any) => signer.id !== signerId),
        updatedAt: new Date()
      } : doc
    );
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };

  const sendDocument = (documentId: string) => {
    const auditEvent: AuditEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'document_sent',
      user: 'current_user',
      details: 'Document sent for signing'
    };

    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { 
        ...doc, 
        status: 'sent',
        auditTrail: [...doc.auditTrail, auditEvent],
        updatedAt: new Date()
      } : doc
    ));

    // Update currentDocument if it's the one being modified
    if (currentDocument && currentDocument.id === documentId) {
      setCurrentDocument(prev => prev ? { 
        ...prev, 
        status: 'sent',
        auditTrail: [...prev.auditTrail, auditEvent],
        updatedAt: new Date()
      } : prev);
    }

    // Save to localStorage
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = savedDocuments.map((doc: any) => 
      doc.id === documentId ? { 
        ...doc, 
        status: 'sent',
        auditTrail: [...doc.auditTrail, auditEvent],
        updatedAt: new Date()
      } : doc
    );
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));

    // Add notification
    addNotification({
      title: 'Document Sent',
      message: `Document "${documents.find(d => d.id === documentId)?.title}" has been sent for signing.`,
      type: 'success',
      documentId
    });
  };

  const signDocument = (documentId: string, signerId: string) => {
    const auditEvent: AuditEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'document_signed',
      user: signerId,
      details: 'Document signed by signer'
    };

    const updatedDocuments = documents.map(doc => {
      if (doc.id !== documentId) return doc;

      // Update the specific signer
      const updatedSigners = doc.signers.map(signer => 
        signer.id === signerId ? { 
          ...signer, 
          status: 'signed', 
          signedAt: new Date() 
        } : signer
      );

      // Check if all signers have signed
      const allSigned = updatedSigners.every(signer => signer.status === 'signed');
      
      return {
        ...doc,
        signers: updatedSigners,
        status: allSigned ? 'completed' : doc.status,
        auditTrail: [...doc.auditTrail, auditEvent],
        updatedAt: new Date()
      };
    });

    setDocuments(updatedDocuments);

    // Update currentDocument if it's the one being modified
    if (currentDocument && currentDocument.id === documentId) {
      const updatedDoc = updatedDocuments.find(doc => doc.id === documentId);
      if (updatedDoc) {
        setCurrentDocument(updatedDoc);
      }
    }

    // Save to localStorage
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));

    // Add notification
    const document = documents.find(d => d.id === documentId);
    const signer = document?.signers.find(s => s.id === signerId);
    
    addNotification({
      title: 'Document Signed',
      message: `${signer?.name} has signed "${document?.title}".`,
      type: 'success',
      documentId
    });
  };

  const createTemplate = (template: Omit<DocumentTemplate, 'id'>) => {
    const newTemplate = { 
      ...template, 
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTemplates(prev => [...prev, newTemplate]);

    // Save to localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('templates') || '[]');
    savedTemplates.push(newTemplate);
    localStorage.setItem('templates', JSON.stringify(savedTemplates));
  };

  const updateTemplate = (id: string, updates: Partial<DocumentTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates, updatedAt: new Date() } : template
    ));

    // Save to localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('templates') || '[]');
    const updatedTemplates = savedTemplates.map((template: any) => 
      template.id === id ? { ...template, ...updates, updatedAt: new Date() } : template
    );
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));

    // Save to localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('templates') || '[]');
    const updatedTemplates = savedTemplates.filter((template: any) => template.id !== id);
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Save to localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    savedNotifications.unshift(newNotification);
    localStorage.setItem('notifications', JSON.stringify(savedNotifications));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));

    // Save to localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = savedNotifications.map((notification: any) => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
  };

  const getDocumentStats = () => {
    const total = documents.length;
    const completed = documents.filter(doc => doc.status === 'completed').length;
    const pending = documents.filter(doc => doc.status === 'sent').length;
    const draft = documents.filter(doc => doc.status === 'draft').length;
    
    // Calculate average completion time
    const completedDocs = documents.filter(doc => doc.status === 'completed');
    let averageCompletionTime = 0;
    
    if (completedDocs.length > 0) {
      const totalTime = completedDocs.reduce((sum, doc) => {
        const timeDiff = doc.updatedAt.getTime() - doc.createdAt.getTime();
        return sum + (timeDiff / (1000 * 60 * 60 * 24)); // Convert to days
      }, 0);
      averageCompletionTime = totalTime / completedDocs.length;
    }

    return {
      total,
      completed,
      pending,
      draft,
      averageCompletionTime
    };
  };

  const value: DocumentContextType = {
    documents,
    currentDocument,
    templates,
    notifications,
    setCurrentDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    addField,
    updateField,
    deleteField,
    addSigner,
    updateSigner,
    deleteSigner,
    sendDocument,
    signDocument,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    uploadPDFToDocument,
    getDocumentStats,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

// Sample document for testing
export const sampleDocument: Document = {
  id: 'sample-doc-1',
  title: 'Sample Contract',
  content: '',
  status: 'draft',
  signingOrder: 'sequential',
  createdAt: new Date(),
  updatedAt: new Date(),
  auditTrail: [],
  fields: [
    {
      id: 'field-1',
      type: 'signature',
      x: 20,
      y: 30,
      width: 20,
      height: 10,
      page: 1,
      required: true,
      label: 'Signature',
      signer: 'signer-1'
    },
    {
      id: 'field-2',
      type: 'text',
      x: 50,
      y: 30,
      width: 30,
      height: 5,
      page: 1,
      required: true,
      label: 'Full Name',
      signer: 'signer-1'
    },
    {
      id: 'field-3',
      type: 'date',
      x: 20,
      y: 50,
      width: 15,
      height: 5,
      page: 1,
      required: true,
      label: 'Date',
      signer: 'signer-1'
    }
  ],
  signers: [
    {
      id: 'signer-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Client',
      status: 'pending'
    },
    {
      id: 'signer-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Agent',
      status: 'pending'
    }
  ]
};
