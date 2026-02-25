
import React, { createContext, useState, useEffect, useContext } from 'react';
import { RobustPDFGenerator } from '@/utils/robustPDFGenerator';

export interface DocumentField {
  id: string;
  type: 'text' | 'signature' | 'date' | 'checkbox' | 'dropdown' | 'radio' | 'textarea' | 'number' | 'email' | 'formula' | 'attachment' | 'initial' | 'stamp';
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
  // Adding individual x, y, width, height properties for backward compatibility
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  signerId?: string;
  tooltip?: string;
  validation?: {
    type: 'regex' | 'date' | 'email' | 'phone' | 'number' | 'custom';
    pattern?: string;
    message?: string;
  };
  options?: string[];
  formula?: string;
  conditionalLogic?: {
    dependsOn: string;
    condition: 'equals' | 'not_equals' | 'contains';
    value: string;
    action: 'show' | 'hide' | 'require';
  };
}

export interface Document {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'sent' | 'in-progress' | 'completed' | 'declined' | 'expired' | 'voided';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  sentAt?: Date;
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
  reminderSchedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    customMessage?: string;
  };
  notifications?: {
    sendCopyToSender: boolean;
    ccEmails?: string[];
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
  delegatedTo?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  fields: DocumentField[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  content?: string;
  signers?: Signer[];
}

// Export alias for backward compatibility
export type DocumentTemplate = Template;

export interface Notification {
  id: string;
  type: 'reminder' | 'completed' | 'declined' | 'expired' | 'signed';
  title: string;
  message: string;
  documentId: string;
  signerId?: string;
  createdAt: Date;
  read: boolean;
  status?: 'sent' | 'pending' | 'failed';
  recipientEmail?: string;
  timestamp?: Date;
  sentAt?: Date;
}

export interface DocumentStats {
  total: number;
  pending: number;
  completed: number;
  declined: number;
  expired: number;
  averageCompletionTime: number;
}

export const DocumentContext = createContext<any>(null);

interface DocumentContextType {
  documents: Document[];
  templates: Template[];
  notifications: Notification[];
  currentDocument: Document | null;
  createDocument: (title: string, content?: string) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => Document;
  setCurrentDocument: (document: Document | null) => void;
  addField: (documentId: string, field: Omit<DocumentField, 'id'>) => void;
  updateField: (documentId: string, fieldId: string, updates: Partial<DocumentField>) => void;
  deleteField: (documentId: string, fieldId: string) => void;
  removeField: (documentId: string, fieldId: string) => void;
  addSigner: (documentId: string, signer: Omit<Signer, 'id' | 'order'>) => void;
  updateSigner: (signerId: string, updates: Partial<Signer>) => void;
  removeSigner: (documentId: string, signerId: string) => void;
  sendDocument: (documentId: string, message?: string) => void;
  sendReminder: (signerId: string) => void;
  bulkSend: (documentIds: string[]) => void;
  bulkDelete: (documentIds: string[]) => void;
  bulkMove: (documentIds: string[], folder: string) => void;
  bulkTag: (documentIds: string[], tags: string[]) => void;
  getDocumentsByFolder: (folder: string) => Document[];
  getDocumentsByTag: (tag: string) => Document[];
  getDocumentsByStatus: (status: Document['status']) => Document[];
  searchDocuments: (query: string) => Document[];
  getDocumentStats: () => DocumentStats;
  createTemplate: (name: string, fields: DocumentField[]) => Template;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  addTemplate: (template: Omit<Template, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) => Template;
  createDocumentFromTemplate: (templateId: string, title: string) => Document;
}

export const useDocument = () => useContext(DocumentContext) as DocumentContextType;

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

  useEffect(() => {
    const makeField = (id: string, type: DocumentField['type'], label: string, signerId?: string): DocumentField => ({
      id, type, label, required: true,
      position: { x: 10 + Math.random() * 40, y: 20 + Math.random() * 50 },
      size: { width: type === 'signature' ? 25 : 20, height: type === 'signature' ? 8 : 5 },
      x: 10, y: 20, width: 20, height: 5, page: 1, signerId
    });

    const makeSigner = (id: string, name: string, email: string, role: string, order: number, status: Signer['status'], signedAt?: Date): Signer => ({
      id, name, email, role, status, order, signedAt, canDelegate: order === 1, requireAuth: 'email' as const, reminderCount: 0
    });

    const docTemplateMap: Record<string, string> = {
      'doc-1': 'Employment Agreement',
      'doc-2': 'Non-Disclosure Agreement',
      'doc-3': 'Vendor Service Contract',
      'doc-4': 'Lease Agreement',
      'doc-5': 'Sales Agreement',
      'doc-6': 'Consulting Agreement',
      'doc-7': 'Board Resolution',
      'doc-8': 'Freelancer Contract',
      'doc-9': 'Insurance Policy Renewal',
      'doc-10': 'Intellectual Property Assignment',
    };

    // Generate real PDFs for all documents asynchronously
    const loadDocuments = async () => {
      const pdfContents: Record<string, string> = {};
      
      await Promise.all(
        Object.entries(docTemplateMap).map(async ([docId, templateName]) => {
          try {
            pdfContents[docId] = await RobustPDFGenerator.generateRealPDF(templateName);
          } catch {
            pdfContents[docId] = RobustPDFGenerator.generateValidSamplePDF(templateName);
          }
        })
      );

      const initialDocuments: Document[] = [
        {
          id: 'doc-1', title: 'Employment Agreement - Sarah Chen', content: pdfContents['doc-1'], status: 'completed',
          createdAt: new Date('2025-12-01'), updatedAt: new Date('2025-12-15'), completedAt: new Date('2025-12-15'), sentAt: new Date('2025-12-02'),
          fields: [makeField('f1', 'signature', 'Employee Signature', 's1'), makeField('f2', 'text', 'Full Name', 's1'), makeField('f3', 'date', 'Date', 's1')],
          signers: [makeSigner('s1', 'Sarah Chen', 'sarah.chen@techcorp.com', 'Employee', 1, 'signed', new Date('2025-12-10')), makeSigner('s2', 'David Park', 'david.park@hr.com', 'HR Manager', 2, 'signed', new Date('2025-12-15'))],
          signingOrder: 'sequential', tags: ['employment', 'hr'], folder: 'HR', priority: 'high',
          audit: { views: 12, downloads: 3, ipAddresses: ['192.168.1.1'] }
        },
        {
          id: 'doc-2', title: 'NDA - Partnership with Innovatech', content: pdfContents['doc-2'], status: 'sent',
          createdAt: new Date('2026-01-05'), updatedAt: new Date('2026-01-10'), sentAt: new Date('2026-01-06'),
          fields: [makeField('f4', 'signature', 'Company Rep', 's3'), makeField('f5', 'signature', 'Partner Rep', 's4')],
          signers: [makeSigner('s3', 'Robert Wilson', 'robert@company.com', 'Company Rep', 1, 'signed', new Date('2026-01-08')), makeSigner('s4', 'Jennifer Lee', 'jen@innovatech.com', 'Partner', 2, 'pending')],
          signingOrder: 'sequential', tags: ['nda', 'partnership'], folder: 'Legal', priority: 'high',
          expiresAt: new Date('2026-02-28'),
          audit: { views: 8, downloads: 1, ipAddresses: [] }
        },
        {
          id: 'doc-3', title: 'Vendor Service Contract - Q1 2026', content: pdfContents['doc-3'], status: 'draft',
          createdAt: new Date('2026-02-01'), updatedAt: new Date('2026-02-10'),
          fields: [makeField('f6', 'text', 'Vendor Name'), makeField('f7', 'text', 'Service Description'), makeField('f8', 'signature', 'Client Signature')],
          signers: [], signingOrder: 'parallel', tags: ['vendor', 'contract'], folder: 'Procurement', priority: 'normal',
          audit: { views: 3, downloads: 0, ipAddresses: [] }
        },
        {
          id: 'doc-4', title: 'Lease Agreement - 123 Main Street', content: pdfContents['doc-4'], status: 'in-progress',
          createdAt: new Date('2026-01-15'), updatedAt: new Date('2026-02-05'), sentAt: new Date('2026-01-16'),
          fields: [makeField('f9', 'signature', 'Tenant Signature', 's5'), makeField('f10', 'signature', 'Landlord Signature', 's6'), makeField('f11', 'date', 'Move-in Date', 's5')],
          signers: [makeSigner('s5', 'Emily Rodriguez', 'emily@tenant.com', 'Tenant', 1, 'signed', new Date('2026-01-25')), makeSigner('s6', 'James Mitchell', 'james@property.com', 'Landlord', 2, 'pending')],
          signingOrder: 'sequential', tags: ['lease', 'real-estate'], folder: 'Real Estate', priority: 'normal',
          audit: { views: 15, downloads: 2, ipAddresses: ['10.0.0.1'] }
        },
        {
          id: 'doc-5', title: 'Sales Agreement - Enterprise License', content: pdfContents['doc-5'], status: 'completed',
          createdAt: new Date('2025-11-20'), updatedAt: new Date('2025-12-01'), completedAt: new Date('2025-12-01'), sentAt: new Date('2025-11-21'),
          fields: [makeField('f12', 'signature', 'Buyer Signature', 's7'), makeField('f13', 'text', 'Purchase Amount', 's7'), makeField('f14', 'signature', 'Seller Signature', 's8')],
          signers: [makeSigner('s7', 'Alex Turner', 'alex@buyer.com', 'Buyer', 1, 'signed', new Date('2025-11-28')), makeSigner('s8', 'Michelle Wang', 'michelle@seller.com', 'Seller', 2, 'signed', new Date('2025-12-01'))],
          signingOrder: 'sequential', tags: ['sales', 'enterprise'], folder: 'Sales', priority: 'high',
          audit: { views: 20, downloads: 5, ipAddresses: ['172.16.0.1'] }
        },
        {
          id: 'doc-6', title: 'Consulting Agreement - MarketPro', content: pdfContents['doc-6'], status: 'sent',
          createdAt: new Date('2026-01-20'), updatedAt: new Date('2026-02-01'), sentAt: new Date('2026-01-21'),
          fields: [makeField('f15', 'signature', 'Consultant Signature', 's9'), makeField('f16', 'text', 'Scope of Work', 's9')],
          signers: [makeSigner('s9', 'Carlos Martinez', 'carlos@consultant.com', 'Consultant', 1, 'pending'), makeSigner('s10', 'Lisa Anderson', 'lisa@marketpro.com', 'Client', 2, 'pending')],
          signingOrder: 'parallel', tags: ['consulting', 'services'], folder: 'Consulting', priority: 'normal',
          expiresAt: new Date('2026-03-15'),
          audit: { views: 5, downloads: 0, ipAddresses: [] }
        },
        {
          id: 'doc-7', title: 'Board Resolution - Annual Meeting', content: pdfContents['doc-7'], status: 'declined',
          createdAt: new Date('2025-10-15'), updatedAt: new Date('2025-11-01'), sentAt: new Date('2025-10-16'),
          fields: [makeField('f17', 'signature', 'Chairman Signature', 's11'), makeField('f18', 'signature', 'Secretary Signature', 's12')],
          signers: [makeSigner('s11', 'Thomas Blake', 'thomas@board.com', 'Chairman', 1, 'signed', new Date('2025-10-20')), makeSigner('s12', 'Patricia Hayes', 'patricia@board.com', 'Secretary', 2, 'declined')],
          signingOrder: 'sequential', tags: ['governance', 'board'], folder: 'Governance', priority: 'urgent',
          audit: { views: 30, downloads: 4, ipAddresses: ['10.10.10.1'] }
        },
        {
          id: 'doc-8', title: 'Freelancer Contract - Design Work', content: pdfContents['doc-8'], status: 'expired',
          createdAt: new Date('2025-09-01'), updatedAt: new Date('2025-10-01'), sentAt: new Date('2025-09-02'),
          expiresAt: new Date('2025-10-01'),
          fields: [makeField('f19', 'signature', 'Freelancer Signature', 's13'), makeField('f20', 'text', 'Project Name', 's13')],
          signers: [makeSigner('s13', 'Nina Patel', 'nina@design.com', 'Freelancer', 1, 'pending')],
          signingOrder: 'sequential', tags: ['freelance', 'design'], folder: 'Contractors', priority: 'low',
          audit: { views: 7, downloads: 1, ipAddresses: [] }
        },
        {
          id: 'doc-9', title: 'Insurance Policy Renewal', content: pdfContents['doc-9'], status: 'draft',
          createdAt: new Date('2026-02-10'), updatedAt: new Date('2026-02-14'),
          fields: [makeField('f21', 'text', 'Policy Number'), makeField('f22', 'checkbox', 'Agree to Terms'), makeField('f23', 'signature', 'Policyholder Signature')],
          signers: [], signingOrder: 'sequential', tags: ['insurance', 'renewal'], folder: 'Insurance', priority: 'normal',
          audit: { views: 2, downloads: 0, ipAddresses: [] }
        },
        {
          id: 'doc-10', title: 'Intellectual Property Assignment', content: pdfContents['doc-10'], status: 'voided',
          createdAt: new Date('2025-08-15'), updatedAt: new Date('2025-09-10'), sentAt: new Date('2025-08-16'),
          fields: [makeField('f24', 'signature', 'Assignor Signature', 's14'), makeField('f25', 'signature', 'Assignee Signature', 's15')],
          signers: [makeSigner('s14', "Kevin O'Brien", 'kevin@inventor.com', 'Assignor', 1, 'signed', new Date('2025-08-25')), makeSigner('s15', 'Rachel Kim', 'rachel@company.com', 'Assignee', 2, 'pending')],
          signingOrder: 'sequential', tags: ['ip', 'legal'], folder: 'Legal', priority: 'high',
          audit: { views: 18, downloads: 3, ipAddresses: ['192.168.0.50'] }
        },
      ];
      setDocuments(initialDocuments);
    };

    loadDocuments();

    const initialTemplates: Template[] = [
      { id: 'tpl-1', name: 'Standard NDA', description: 'Non-disclosure agreement template', category: 'Legal', fields: [makeField('tf1', 'text', 'Company Name'), makeField('tf2', 'signature', 'Party A Signature'), makeField('tf3', 'signature', 'Party B Signature')], usageCount: 15, createdAt: new Date('2025-06-01'), updatedAt: new Date('2025-12-01'), tags: ['nda', 'legal'] },
      { id: 'tpl-2', name: 'Employment Agreement', description: 'Standard employment contract', category: 'HR', fields: [makeField('tf4', 'text', 'Employee Name'), makeField('tf5', 'text', 'Position'), makeField('tf6', 'signature', 'Employee Signature')], usageCount: 22, createdAt: new Date('2025-05-15'), updatedAt: new Date('2025-11-20'), tags: ['employment', 'hr'] },
      { id: 'tpl-3', name: 'Service Agreement', description: 'Professional services contract', category: 'Business', fields: [makeField('tf7', 'text', 'Service Description'), makeField('tf8', 'text', 'Fee Amount'), makeField('tf9', 'signature', 'Client Signature')], usageCount: 8, createdAt: new Date('2025-07-10'), updatedAt: new Date('2025-10-15'), tags: ['service', 'contract'] },
      { id: 'tpl-4', name: 'Lease Agreement', description: 'Property rental contract', category: 'Real Estate', fields: [makeField('tf10', 'text', 'Property Address'), makeField('tf11', 'date', 'Lease Start'), makeField('tf12', 'signature', 'Tenant Signature')], usageCount: 12, createdAt: new Date('2025-04-20'), updatedAt: new Date('2025-09-30'), tags: ['lease', 'property'] },
      { id: 'tpl-5', name: 'Purchase Order', description: 'Standard purchase order form', category: 'Finance', fields: [makeField('tf13', 'text', 'Item Description'), makeField('tf14', 'text', 'Quantity'), makeField('tf15', 'signature', 'Approver Signature')], usageCount: 30, createdAt: new Date('2025-03-01'), updatedAt: new Date('2025-08-15'), tags: ['purchase', 'finance'] },
      { id: 'tpl-6', name: 'Contractor Agreement', description: 'Independent contractor contract', category: 'HR', fields: [makeField('tf16', 'text', 'Contractor Name'), makeField('tf17', 'text', 'Project Scope'), makeField('tf18', 'signature', 'Contractor Signature')], usageCount: 6, createdAt: new Date('2025-08-01'), updatedAt: new Date('2025-12-10'), tags: ['contractor', 'freelance'] },
      { id: 'tpl-7', name: 'Partnership Agreement', description: 'Business partnership terms', category: 'Legal', fields: [makeField('tf19', 'text', 'Partner A Name'), makeField('tf20', 'text', 'Partner B Name'), makeField('tf21', 'signature', 'Partner A Signature')], usageCount: 4, createdAt: new Date('2025-06-15'), updatedAt: new Date('2025-11-05'), tags: ['partnership', 'legal'] },
      { id: 'tpl-8', name: 'Release of Liability', description: 'Liability waiver form', category: 'Legal', fields: [makeField('tf22', 'text', 'Participant Name'), makeField('tf23', 'checkbox', 'Acknowledge Risk'), makeField('tf24', 'signature', 'Participant Signature')], usageCount: 18, createdAt: new Date('2025-02-10'), updatedAt: new Date('2025-07-20'), tags: ['waiver', 'liability'] },
      { id: 'tpl-9', name: 'Invoice Template', description: 'Standard invoice for billing', category: 'Finance', fields: [makeField('tf25', 'text', 'Client Name'), makeField('tf26', 'text', 'Amount Due'), makeField('tf27', 'date', 'Due Date')], usageCount: 45, createdAt: new Date('2025-01-05'), updatedAt: new Date('2025-12-20'), tags: ['invoice', 'billing'] },
      { id: 'tpl-10', name: 'Offer Letter', description: 'Job offer letter template', category: 'HR', fields: [makeField('tf28', 'text', 'Candidate Name'), makeField('tf29', 'text', 'Salary'), makeField('tf30', 'signature', 'HR Signature')], usageCount: 10, createdAt: new Date('2025-04-01'), updatedAt: new Date('2025-10-25'), tags: ['offer', 'hiring'] },
    ];
    setTemplates(initialTemplates);

    const initialNotifications: Notification[] = [
      { id: 'n1', type: 'signed', title: 'Document Signed', message: 'Sarah Chen signed Employment Agreement', documentId: 'doc-1', signerId: 's1', createdAt: new Date('2025-12-10'), read: false, status: 'sent' },
      { id: 'n2', type: 'completed', title: 'Document Completed', message: 'Employment Agreement fully executed', documentId: 'doc-1', createdAt: new Date('2025-12-15'), read: false, status: 'sent' },
      { id: 'n3', type: 'reminder', title: 'Reminder Sent', message: 'Reminder sent to Jennifer Lee for NDA', documentId: 'doc-2', signerId: 's4', createdAt: new Date('2026-01-15'), read: false, status: 'sent' },
      { id: 'n4', type: 'signed', title: 'Document Signed', message: 'Emily Rodriguez signed Lease Agreement', documentId: 'doc-4', signerId: 's5', createdAt: new Date('2026-01-25'), read: true, status: 'sent' },
      { id: 'n5', type: 'completed', title: 'Sale Completed', message: 'Sales Agreement fully signed by all parties', documentId: 'doc-5', createdAt: new Date('2025-12-01'), read: true, status: 'sent' },
      { id: 'n6', type: 'declined', title: 'Document Declined', message: 'Patricia Hayes declined Board Resolution', documentId: 'doc-7', signerId: 's12', createdAt: new Date('2025-11-01'), read: true, status: 'sent' },
      { id: 'n7', type: 'expired', title: 'Document Expired', message: 'Freelancer Contract has expired', documentId: 'doc-8', createdAt: new Date('2025-10-01'), read: false, status: 'sent' },
      { id: 'n8', type: 'reminder', title: 'Pending Signature', message: 'Carlos Martinez has not signed Consulting Agreement', documentId: 'doc-6', signerId: 's9', createdAt: new Date('2026-02-01'), read: false, status: 'sent' },
      { id: 'n9', type: 'signed', title: 'Document Signed', message: 'Robert Wilson signed NDA - Partnership', documentId: 'doc-2', signerId: 's3', createdAt: new Date('2026-01-08'), read: true, status: 'sent' },
      { id: 'n10', type: 'reminder', title: 'Action Required', message: 'James Mitchell needs to sign Lease Agreement', documentId: 'doc-4', signerId: 's6', createdAt: new Date('2026-02-10'), read: false, status: 'pending' },
    ];
    setNotifications(initialNotifications);
  }, []);

  const getDocumentStats = (): DocumentStats => {
    const total = documents.length;
    const pending = documents.filter(d => d.status === 'sent' || d.status === 'in-progress').length;
    const completed = documents.filter(d => d.status === 'completed').length;
    const declined = documents.filter(d => d.status === 'declined').length;
    const expired = documents.filter(d => d.status === 'expired').length;
    
    // Calculate average completion time
    const completedDocs = documents.filter(d => d.status === 'completed' && d.completedAt && d.sentAt);
    const avgTime = completedDocs.length > 0 
      ? completedDocs.reduce((sum, doc) => {
          const sentTime = doc.sentAt?.getTime() || 0;
          const completedTime = doc.completedAt?.getTime() || 0;
          return sum + (completedTime - sentTime);
        }, 0) / completedDocs.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      total,
      pending,
      completed,
      declined,
      expired,
      averageCompletionTime: avgTime
    };
  };

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
      fields: original.fields.map(field => ({ 
        ...field, 
        id: Date.now().toString() + Math.random(),
        x: field.position.x,
        y: field.position.y,
        width: field.size.width,
        height: field.size.height
      })),
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
      ...field,
      x: field.position.x,
      y: field.position.y,
      width: field.size.width,
      height: field.size.height
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
            field.id === fieldId ? { 
              ...field, 
              ...updates,
              x: updates.x !== undefined ? updates.x : field.x,
              y: updates.y !== undefined ? updates.y : field.y,
              width: updates.width !== undefined ? updates.width : field.width,
              height: updates.height !== undefined ? updates.height : field.height,
              position: {
                x: updates.x !== undefined ? updates.x : field.position.x,
                y: updates.y !== undefined ? updates.y : field.position.y
              },
              size: {
                width: updates.width !== undefined ? updates.width : field.size.width,
                height: updates.height !== undefined ? updates.height : field.size.height
              }
            } : field
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

  const removeField = (documentId: string, fieldId: string) => {
    deleteField(documentId, fieldId);
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

  const sendDocument = (documentId: string, message?: string) => {
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
      sentAt: new Date(),
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

  const createTemplate = (name: string, fields: DocumentField[]): Template => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name,
      fields,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, ...updates, updatedAt: new Date() }
        : template
    ));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const createNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    addNotification(notification);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addTemplate = (template: Omit<Template, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Template => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const createDocumentFromTemplate = (templateId: string, title: string): Document => {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');
    
    const newDocument = createDocument(title, template.content);
    updateDocument(newDocument.id, {
      fields: template.fields.map(field => ({
        ...field,
        id: Date.now().toString() + Math.random()
      })),
      signers: template.signers || []
    });
    
    // Increment template usage count
    updateTemplate(templateId, { usageCount: template.usageCount + 1 });
    
    return newDocument;
  };

  const value = {
    documents,
    templates,
    notifications,
    currentDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    setCurrentDocument,
    addField,
    updateField,
    deleteField,
    removeField,
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
    searchDocuments,
    getDocumentStats,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addNotification,
    createNotification,
    markNotificationAsRead,
    clearAllNotifications,
    addTemplate,
    createDocumentFromTemplate
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};
