import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ValidationRule {
  type: 'email' | 'phone' | 'number' | 'custom';
  pattern?: string;
  message?: string;
}

export interface ConditionalLogic {
  dependsOn: string;
  condition: 'equals' | 'not_equals' | 'contains';
  value: string;
  action: 'show' | 'hide' | 'require';
}

export interface ReminderSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  customMessage?: string;
}

export interface NotificationSettings {
  sendCopyToSender: boolean;
  ccEmails?: string[];
}

export interface DelegatedTo {
  name: string;
  email: string;
}

export interface DocumentField {
  id: string;
  type: 'signature' | 'text' | 'date' | 'checkbox' | 'radio' | 'dropdown' | 'textarea' | 'number' | 'email' | 'formula' | 'attachment' | 'initial' | 'stamp';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  value?: string | boolean;
  label?: string;
  required?: boolean;
  signer?: string;
  signerId?: string;
  options?: string[];
  formula?: string;
  validation?: ValidationRule;
  conditionalLogic?: ConditionalLogic;
  tooltip?: string;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
  order: number;
  canDelegate?: boolean;
  requireAuth?: 'none' | 'email' | 'sms' | 'knowledge';
  delegatedTo?: DelegatedTo;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'sent' | 'completed' | 'voided' | 'declined' | 'expired';
  signingOrder: 'parallel' | 'sequential';
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  auditTrail: AuditEvent[];
  fields: DocumentField[];
  signers: Signer[];
  expiresAt?: Date;
  completedAt?: Date;
  reminderSchedule?: ReminderSchedule;
  notifications?: NotificationSettings;
  security?: {
    requireAuth: boolean;
    allowPrinting: boolean;
    allowDownload: boolean;
  };
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  details: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  content: string;
  fields: DocumentField[];
  signers: Signer[];
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  isPublic?: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  status?: 'sent' | 'delivered' | 'failed';
  recipientEmail?: string;
  sentAt?: Date;
}

export interface DocumentContextType {
  documents: Document[];
  templates: DocumentTemplate[];
  notifications: Notification[];
  currentDocument: Document | null;
  setCurrentDocument: (document: Document | null) => void;
  createDocument: (title: string, content: string) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  addField: (field: Omit<DocumentField, 'id'>) => void;
  updateField: (fieldId: string, updates: Partial<DocumentField>) => void;
  removeField: (fieldId: string) => void;
  addSigner: (signer: Omit<Signer, 'id'>) => void;
  updateSigner: (signerId: string, updates: Partial<Signer>) => void;
  removeSigner: (signerId: string) => void;
  sendDocument: (documentId: string, message?: string) => void;
  uploadPDF: (file: File) => Promise<string>;
  createTemplate: (template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => DocumentTemplate;
  updateTemplate: (templateId: string, updates: Partial<DocumentTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  createDocumentFromTemplate: (templateId: string) => Document;
  markNotificationAsRead: (notificationId: string) => void;
  getDocumentStats: () => {
    total: number;
    completed: number;
    pending: number;
    draft: number;
    averageCompletionTime: number;
  };
  duplicateDocument: (documentId: string) => Document;
  sendReminder: (documentId: string, signerId: string) => void;
  createNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

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

  const createDocument = (title: string, content: string): Document => {
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      title,
      content,
      status: 'draft',
      signingOrder: 'parallel',
      createdAt: new Date(),
      updatedAt: new Date(),
      auditTrail: [],
      fields: [],
      signers: []
    };
    
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
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
      id: `field-${Date.now()}`
    };
    
    updateDocument(currentDocument.id, {
      fields: [...currentDocument.fields, newField]
    });
  };

  const updateField = (fieldId: string, updates: Partial<DocumentField>) => {
    if (!currentDocument) return;
    
    updateDocument(currentDocument.id, {
      fields: currentDocument.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  };

  const removeField = (fieldId: string) => {
    if (!currentDocument) return;
    
    updateDocument(currentDocument.id, {
      fields: currentDocument.fields.filter(field => field.id !== fieldId)
    });
  };

  const addSigner = (signer: Omit<Signer, 'id'>) => {
    if (!currentDocument) return;
    
    const newSigner: Signer = {
      ...signer,
      id: `signer-${Date.now()}`
    };
    
    updateDocument(currentDocument.id, {
      signers: [...currentDocument.signers, newSigner]
    });
  };

  const updateSigner = (signerId: string, updates: Partial<Signer>) => {
    if (!currentDocument) return;
    
    updateDocument(currentDocument.id, {
      signers: currentDocument.signers.map(signer =>
        signer.id === signerId ? { ...signer, ...updates } : signer
      )
    });
  };

  const removeSigner = (signerId: string) => {
    if (!currentDocument) return;
    
    updateDocument(currentDocument.id, {
      signers: currentDocument.signers.filter(signer => signer.id !== signerId)
    });
  };

  const sendDocument = (documentId: string, message?: string) => {
    updateDocument(documentId, {
      status: 'sent',
      sentAt: new Date()
    });
    
    createNotification({
      type: 'success',
      title: 'Document Sent',
      message: message || 'Document has been sent for signing'
    });
  };

  const uploadPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const createTemplate = (template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>): DocumentTemplate => {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (templateId: string, updates: Partial<DocumentTemplate>) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId ? { ...template, ...updates, updatedAt: new Date() } : template
    ));
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const createDocumentFromTemplate = (templateId: string): Document => {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');
    
    const newDocument = createDocument(template.title, template.content);
    updateDocument(newDocument.id, {
      fields: template.fields,
      signers: template.signers
    });
    
    return newDocument;
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  };

  const getDocumentStats = () => {
    const total = documents.length;
    const completed = documents.filter(doc => doc.status === 'completed').length;
    const pending = documents.filter(doc => doc.status === 'sent').length;
    const draft = documents.filter(doc => doc.status === 'draft').length;
    
    const completedDocs = documents.filter(doc => doc.status === 'completed' && doc.sentAt && doc.completedAt);
    const averageCompletionTime = completedDocs.length > 0 
      ? completedDocs.reduce((acc, doc) => {
          const timeDiff = doc.completedAt!.getTime() - doc.sentAt!.getTime();
          return acc + (timeDiff / (1000 * 60 * 60 * 24)); // Convert to days
        }, 0) / completedDocs.length
      : 0;

    return {
      total,
      completed,
      pending,
      draft,
      averageCompletionTime
    };
  };

  const duplicateDocument = (documentId: string): Document => {
    const originalDoc = documents.find(doc => doc.id === documentId);
    if (!originalDoc) throw new Error('Document not found');
    
    const duplicatedDoc = createDocument(`${originalDoc.title} (Copy)`, originalDoc.content);
    updateDocument(duplicatedDoc.id, {
      fields: originalDoc.fields.map(field => ({ ...field, id: `field-${Date.now()}-${Math.random()}` })),
      signers: originalDoc.signers.map(signer => ({ ...signer, id: `signer-${Date.now()}-${Math.random()}`, status: 'pending' as const }))
    });
    
    return duplicatedDoc;
  };

  const sendReminder = (documentId: string, signerId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    const signer = document?.signers.find(s => s.id === signerId);
    
    if (document && signer) {
      createNotification({
        type: 'info',
        title: 'Reminder Sent',
        message: `Reminder sent to ${signer.name} for document "${document.title}"`
      });
    }
  };

  const createNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  // Initialize with demo data
  useEffect(() => {
    const demoDocument: Document = {
      id: 'sample-doc-1',
      title: 'Sample Employment Contract',
      content: 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKFNhbXBsZSBEb2N1bWVudCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago6cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDAw1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMxMiAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwNQolJUVPRg==',
      status: 'draft',
      signingOrder: 'parallel',
      createdAt: new Date(),
      updatedAt: new Date(),
      auditTrail: [],
      fields: [
        {
          id: 'field-1',
          type: 'signature',
          x: 10,
          y: 80,
          width: 25,
          height: 8,
          page: 1,
          required: true,
          label: 'Signature',
          signer: 'signer-1',
          signerId: 'signer-1'
        },
        {
          id: 'field-2',
          type: 'text',
          x: 40,
          y: 80,
          width: 20,
          height: 6,
          page: 1,
          required: true,
          label: 'Full Name',
          signer: 'signer-1',
          signerId: 'signer-1'
        },
        {
          id: 'field-3',
          type: 'date',
          x: 70,
          y: 80,
          width: 15,
          height: 6,
          page: 1,
          required: true,
          label: 'Date',
          signer: 'signer-1',
          signerId: 'signer-1'
        }
      ],
      signers: [
        {
          id: 'signer-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'Employee',
          status: 'pending',
          order: 1
        }
      ]
    };

    setDocuments([demoDocument]);
    setCurrentDocument(demoDocument);
  }, []);

  const value: DocumentContextType = {
    documents,
    templates,
    notifications,
    currentDocument,
    setCurrentDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    addField,
    updateField,
    removeField,
    addSigner,
    updateSigner,
    removeSigner,
    sendDocument,
    uploadPDF,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createDocumentFromTemplate,
    markNotificationAsRead,
    getDocumentStats,
    duplicateDocument,
    sendReminder,
    createNotification
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};
