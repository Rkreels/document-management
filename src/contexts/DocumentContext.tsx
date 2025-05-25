import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateDemoData } from '@/services/demoData';

export interface DocumentField {
  id: string;
  type: 'signature' | 'text' | 'date' | 'checkbox' | 'radio' | 'dropdown' | 'formula';
  x: number;
  y: number;
  width: number;
  height: number;
  signerId?: string;
  required: boolean;
  value?: string;
  label?: string;
  options?: string[]; // For radio and dropdown
  formula?: string; // For formula fields
  conditionalLogic?: {
    dependsOn: string;
    condition: 'equals' | 'not_equals' | 'contains';
    value: string;
    action: 'show' | 'hide' | 'require';
  };
  validation?: {
    type: 'email' | 'phone' | 'number' | 'custom';
    pattern?: string;
    message?: string;
  };
  tooltip?: string;
  placeholder?: string;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: 'signer' | 'viewer' | 'approver' | 'cc' | 'witness';
  status: 'pending' | 'signed' | 'declined' | 'viewed';
  signedAt?: Date;
  order: number;
  canDelegate: boolean;
  delegatedTo?: {
    name: string;
    email: string;
    delegatedAt: Date;
  };
  requireAuth?: 'none' | 'email' | 'sms' | 'knowledge';
  ipRestrictions?: string[];
  language?: string;
  timezone?: string;
  phoneNumber?: string;
  accessCode?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  fields: Omit<DocumentField, 'id'>[];
  signers: Omit<Signer, 'id' | 'status' | 'signedAt'>[];
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags?: string[];
  isPublic: boolean;
  usageCount: number;
  thumbnail?: string;
  industry?: string;
  estimatedTime?: number; // in minutes
}

export interface Document {
  id: string;
  title: string;
  content: string;
  fields: DocumentField[];
  signers: Signer[];
  status: 'draft' | 'sent' | 'completed' | 'declined' | 'expired' | 'voided';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  templateId?: string;
  expiresAt?: Date;
  reminderSchedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    lastSent?: Date;
    customMessage?: string;
  };
  signingOrder: 'parallel' | 'sequential';
  auditTrail: AuditEntry[];
  metadata?: {
    source?: string;
    customFields?: Record<string, string>;
    tags?: string[];
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  };
  notifications?: {
    emailTemplate?: string;
    sendCopyToSender: boolean;
    ccEmails?: string[];
    customMessage?: string;
  };
  security?: {
    requireAuth: boolean;
    allowPrinting: boolean;
    allowDownload: boolean;
    watermark?: string;
    passwordProtected?: boolean;
    encryptionLevel?: 'standard' | 'high';
  };
  workflow?: {
    approvalRequired: boolean;
    approvers?: string[];
    escalationRules?: {
      timeLimit: number; // hours
      escalateTo: string;
    };
  };
  analytics?: {
    viewCount: number;
    timeSpent?: number; // seconds
    clickHeatmap?: { x: number; y: number; count: number }[];
  };
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  ipAddress?: string;
  details?: string;
  deviceInfo?: string;
  location?: string;
}

export interface Notification {
  id: string;
  documentId: string;
  type: 'reminder' | 'completion' | 'decline' | 'view' | 'approval' | 'escalation';
  recipientEmail: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'opened' | 'clicked';
  scheduledFor?: Date;
  retryCount?: number;
}

interface DocumentContextType {
  documents: Document[];
  templates: DocumentTemplate[];
  notifications: Notification[];
  currentDocument: Document | null;
  
  // Document CRUD
  createDocument: (title: string, content: string, templateId?: string) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => Document;
  voidDocument: (id: string, reason: string) => void;
  
  // Document management
  setCurrentDocument: (document: Document | null) => void;
  sendDocument: (id: string, message?: string) => void;
  
  // Field management
  addField: (field: Omit<DocumentField, 'id'>) => void;
  updateField: (fieldId: string, updates: Partial<DocumentField>) => void;
  removeField: (fieldId: string) => void;
  
  // Signer management
  addSigner: (signer: Omit<Signer, 'id'>) => void;
  updateSigner: (signerId: string, updates: Partial<Signer>) => void;
  removeSigner: (signerId: string) => void;
  delegateSigner: (signerId: string, delegate: { name: string; email: string }) => void;
  
  // Template management
  createTemplate: (template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => DocumentTemplate;
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  createDocumentFromTemplate: (templateId: string, title: string) => Document;
  
  // Workflow management
  setSigningOrder: (documentId: string, order: 'parallel' | 'sequential') => void;
  moveToNextSigner: (documentId: string) => void;
  
  // Analytics
  getDocumentStats: () => {
    total: number;
    completed: number;
    pending: number;
    averageCompletionTime: number;
    completionRate: number;
  };
  
  // Notifications
  sendReminder: (documentId: string, signerId?: string) => void;
  createNotification: (notification: Omit<Notification, 'id'>) => void;
  
  // Bulk operations
  bulkAction: (documentIds: string[], action: 'send' | 'void' | 'delete' | 'remind') => void;
  
  // Advanced features
  scheduleReminder: (documentId: string, scheduledFor: Date, customMessage?: string) => void;
  exportDocument: (documentId: string, format: 'pdf' | 'docx') => void;
  createSigningLink: (documentId: string, signerId: string) => string;
  
  // Demo data
  loadDemoData: () => void;
  clearAllData: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([sampleDocument]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(sampleDocument);

  // Load data from localStorage or demo data on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem('docuSignClone_documents');
    const savedTemplates = localStorage.getItem('docuSignClone_templates');
    const savedNotifications = localStorage.getItem('docuSignClone_notifications');
    
    // If no saved data exists, load demo data
    if (!savedDocs || !savedTemplates) {
      const demoData = generateDemoData();
      setDocuments(demoData.documents);
      setTemplates(demoData.templates);
      setNotifications(demoData.notifications);
      
      // Save demo data to localStorage
      localStorage.setItem('docuSignClone_documents', JSON.stringify(demoData.documents));
      localStorage.setItem('docuSignClone_templates', JSON.stringify(demoData.templates));
      localStorage.setItem('docuSignClone_notifications', JSON.stringify(demoData.notifications));
    } else {
      // Load existing data
      try {
        const parsedDocs = JSON.parse(savedDocs).map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
          completedAt: doc.completedAt ? new Date(doc.completedAt) : undefined,
          expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : undefined,
          auditTrail: doc.auditTrail?.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          })) || [],
          signers: doc.signers?.map((signer: any) => ({
            ...signer,
            signedAt: signer.signedAt ? new Date(signer.signedAt) : undefined,
          })) || [],
        }));
        setDocuments(parsedDocs);
        
        const parsedTemplates = JSON.parse(savedTemplates).map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt),
        }));
        setTemplates(parsedTemplates);
        
        if (savedNotifications) {
          const parsedNotifications = JSON.parse(savedNotifications).map((notif: any) => ({
            ...notif,
            sentAt: new Date(notif.sentAt),
            scheduledFor: notif.scheduledFor ? new Date(notif.scheduledFor) : undefined,
          }));
          setNotifications(parsedNotifications);
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        // Fallback to demo data if parsing fails
        const demoData = generateDemoData();
        setDocuments(demoData.documents);
        setTemplates(demoData.templates);
        setNotifications(demoData.notifications);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('docuSignClone_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('docuSignClone_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('docuSignClone_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addAuditEntry = (documentId: string, action: string, user: string, details?: string) => {
    const entry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action,
      user,
      details,
      deviceInfo: navigator.userAgent,
      ipAddress: '192.168.1.1', // Would be real IP in production
    };
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, auditTrail: [...doc.auditTrail, entry] }
        : doc
    ));
  };

  const createDocument = (title: string, content: string, templateId?: string): Document => {
    const newDocument: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      fields: [],
      signers: [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      templateId,
      signingOrder: 'parallel',
      auditTrail: [],
      analytics: {
        viewCount: 0,
        timeSpent: 0,
        clickHeatmap: [],
      },
      security: {
        requireAuth: false,
        allowPrinting: true,
        allowDownload: true,
      },
      notifications: {
        sendCopyToSender: true,
        ccEmails: [],
      },
    };

    addAuditEntry(newDocument.id, 'Document Created', 'System', `Document "${title}" created`);
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
    const doc = documents.find(d => d.id === id);
    if (doc) {
      addAuditEntry(id, 'Document Deleted', 'User', `Document "${doc.title}" deleted`);
    }
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (currentDocument?.id === id) {
      setCurrentDocument(null);
    }
  };

  const duplicateDocument = (id: string): Document => {
    const original = documents.find(doc => doc.id === id);
    if (!original) throw new Error('Document not found');

    const duplicate = createDocument(
      `${original.title} (Copy)`,
      original.content
    );

    updateDocument(duplicate.id, {
      fields: original.fields.map(field => ({
        ...field,
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
      signers: original.signers.map(signer => ({
        ...signer,
        id: `signer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        signedAt: undefined,
      })),
      security: original.security,
      notifications: original.notifications,
    });

    return duplicate;
  };

  const voidDocument = (id: string, reason: string) => {
    updateDocument(id, { status: 'voided' });
    addAuditEntry(id, 'Document Voided', 'User', reason);
  };

  const sendDocument = (id: string, message?: string) => {
    updateDocument(id, { status: 'sent' });
    addAuditEntry(id, 'Document Sent', 'User', message || 'Document sent for signing');
  };

  const getDocumentStats = () => {
    const total = documents.length;
    const completed = documents.filter(d => d.status === 'completed').length;
    const pending = documents.filter(d => d.status === 'sent').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const completedDocs = documents.filter(d => d.completedAt);
    const averageCompletionTime = completedDocs.length > 0 
      ? completedDocs.reduce((acc, doc) => {
          const timeDiff = doc.completedAt!.getTime() - doc.createdAt.getTime();
          return acc + timeDiff;
        }, 0) / completedDocs.length / (1000 * 60 * 60 * 24)
      : 0;

    return { total, completed, pending, averageCompletionTime, completionRate };
  };

  const bulkAction = (documentIds: string[], action: 'send' | 'void' | 'delete' | 'remind') => {
    documentIds.forEach(id => {
      switch (action) {
        case 'send':
          sendDocument(id);
          break;
        case 'void':
          voidDocument(id, 'Bulk void operation');
          break;
        case 'delete':
          deleteDocument(id);
          break;
        case 'remind':
          sendReminder(id);
          break;
      }
    });
  };

  const scheduleReminder = (documentId: string, scheduledFor: Date, customMessage?: string) => {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      type: 'reminder',
      recipientEmail: 'system@company.com', // Would be dynamic in production
      sentAt: new Date(),
      status: 'sent',
      scheduledFor,
    };
    
    setNotifications(prev => [...prev, notification]);
    addAuditEntry(documentId, 'Reminder Scheduled', 'User', 
      `Reminder scheduled for ${scheduledFor.toLocaleDateString()}`);
  };

  const exportDocument = (documentId: string, format: 'pdf' | 'docx') => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    
    addAuditEntry(documentId, 'Document Exported', 'User', `Exported as ${format.toUpperCase()}`);
    // In a real app, this would trigger a download
    console.log(`Exporting ${doc.title} as ${format}`);
  };

  const createSigningLink = (documentId: string, signerId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/sign/${documentId}/${signerId}`;
  };

  const loadDemoData = () => {
    const demoData = generateDemoData();
    setDocuments(demoData.documents);
    setTemplates(demoData.templates);
    setNotifications(demoData.notifications);
  };

  const clearAllData = () => {
    setDocuments([]);
    setTemplates([]);
    setNotifications([]);
    setCurrentDocument(null);
    localStorage.removeItem('docuSignClone_documents');
    localStorage.removeItem('docuSignClone_templates');
    localStorage.removeItem('docuSignClone_notifications');
  };

  const delegateSigner = (signerId: string, delegate: { name: string; email: string }) => {
    if (!currentDocument) return;

    const updatedSigners = currentDocument.signers.map(signer =>
      signer.id === signerId 
        ? { 
            ...signer, 
            delegatedTo: { ...delegate, delegatedAt: new Date() },
            status: 'pending' as const
          } 
        : signer
    );
    
    updateDocument(currentDocument.id, { signers: updatedSigners });
    addAuditEntry(currentDocument.id, 'Signer Delegated', 'User', 
      `Signer ${signerId} delegated to ${delegate.name} (${delegate.email})`);
  };

  const setSigningOrder = (documentId: string, order: 'parallel' | 'sequential') => {
    updateDocument(documentId, { signingOrder: order });
    addAuditEntry(documentId, 'Signing Order Changed', 'User', `Changed to ${order} signing`);
  };

  const moveToNextSigner = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc || doc.signingOrder !== 'sequential') return;

    const nextSigner = doc.signers
      .filter(s => s.status === 'pending')
      .sort((a, b) => a.order - b.order)[0];

    if (nextSigner) {
      addAuditEntry(documentId, 'Next Signer Notified', 'System', 
        `Notified ${nextSigner.name} (${nextSigner.email})`);
    }
  };

  const sendReminder = (documentId: string, signerId?: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;

    const targetSigners = signerId 
      ? doc.signers.filter(s => s.id === signerId)
      : doc.signers.filter(s => s.status === 'pending');

    targetSigners.forEach(signer => {
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        documentId,
        type: 'reminder',
        recipientEmail: signer.email,
        sentAt: new Date(),
        status: 'sent',
      };
      
      setNotifications(prev => [...prev, notification]);
      addAuditEntry(documentId, 'Reminder Sent', 'System', `Reminder sent to ${signer.email}`);
    });
  };

  const createNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const addField = (field: Omit<DocumentField, 'id'>) => {
    if (!currentDocument) return;

    const newField: DocumentField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedFields = [...currentDocument.fields, newField];
    updateDocument(currentDocument.id, { fields: updatedFields });
    addAuditEntry(currentDocument.id, 'Field Added', 'User', `Added ${field.type} field`);
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
    addAuditEntry(currentDocument.id, 'Field Removed', 'User', `Removed field ${fieldId}`);
  };

  const addSigner = (signer: Omit<Signer, 'id'>) => {
    if (!currentDocument) return;

    const newSigner: Signer = {
      ...signer,
      id: `signer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedSigners = [...currentDocument.signers, newSigner];
    updateDocument(currentDocument.id, { signers: updatedSigners });
    addAuditEntry(currentDocument.id, 'Signer Added', 'User', `Added signer ${signer.name} (${signer.email})`);
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

    const signer = currentDocument.signers.find(s => s.id === signerId);
    const updatedSigners = currentDocument.signers.filter(signer => signer.id !== signerId);
    updateDocument(currentDocument.id, { signers: updatedSigners });
    
    if (signer) {
      addAuditEntry(currentDocument.id, 'Signer Removed', 'User', 
        `Removed signer ${signer.name} (${signer.email})`);
    }
  };

  const createTemplate = (template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>): DocumentTemplate => {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<DocumentTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, ...updates, updatedAt: new Date() }
        : template
    ));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const createDocumentFromTemplate = (templateId: string, title: string): Document => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    updateTemplate(templateId, { usageCount: template.usageCount + 1 });

    const newDocument: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content: template.content,
      fields: template.fields.map(field => ({
        ...field,
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
      signers: template.signers.map(signer => ({
        ...signer,
        id: `signer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending' as const,
      })),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      templateId,
      signingOrder: 'parallel',
      auditTrail: [],
      analytics: {
        viewCount: 0,
        timeSpent: 0,
        clickHeatmap: [],
      },
      security: {
        requireAuth: false,
        allowPrinting: true,
        allowDownload: true,
      },
      notifications: {
        sendCopyToSender: true,
        ccEmails: [],
      },
    };

    addAuditEntry(newDocument.id, 'Document Created from Template', 'User', 
      `Created from template: ${template.name}`);
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      templates,
      notifications,
      currentDocument,
      createDocument,
      updateDocument,
      deleteDocument,
      duplicateDocument,
      voidDocument,
      setCurrentDocument,
      sendDocument,
      addField,
      updateField,
      removeField,
      addSigner,
      updateSigner,
      removeSigner,
      delegateSigner,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      createDocumentFromTemplate,
      setSigningOrder,
      moveToNextSigner,
      getDocumentStats,
      sendReminder,
      createNotification,
      bulkAction,
      scheduleReminder,
      exportDocument,
      createSigningLink,
      loadDemoData,
      clearAllData,
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

const sampleDocument = {
  id: 'sample-1',
  title: 'Sample Contract Document',
  content: 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKFNhbXBsZSBEb2N1bWVudCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago6cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMxMiAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwNQolJUVPRg==',
  status: 'draft' as const,
  signingOrder: 'sequential' as const,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  fields: [
    {
      id: 'field-1',
      type: 'signature' as const,
      x: 10,
      y: 20,
      width: 20,
      height: 8,
      signerId: 'signer-1',
      required: true,
      label: 'Client Signature'
    },
    {
      id: 'field-2',
      type: 'text' as const,
      x: 10,
      y: 35,
      width: 25,
      height: 6,
      signerId: 'signer-1',
      required: true,
      label: 'Full Name'
    }
  ],
  signers: [
    {
      id: 'signer-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'client',
      status: 'pending' as const,
      order: 1
    }
  ]
};
