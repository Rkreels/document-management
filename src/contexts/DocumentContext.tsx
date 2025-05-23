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

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string; // base64 PDF data
  fields: DocumentField[];
  signers: Omit<Signer, 'id' | 'status' | 'signedAt'>[]; // Template signers without specific IDs
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags?: string[];
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
  templateId?: string; // Reference to template if created from one
  expiresAt?: Date;
  reminderSchedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    lastSent?: Date;
  };
}

interface DocumentContextType {
  documents: Document[];
  templates: DocumentTemplate[];
  currentDocument: Document | null;
  createDocument: (title: string, content: string, templateId?: string) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setCurrentDocument: (document: Document | null) => void;
  addField: (field: Omit<DocumentField, 'id'>) => void;
  updateField: (fieldId: string, updates: Partial<DocumentField>) => void;
  removeField: (fieldId: string) => void;
  addSigner: (signer: Omit<Signer, 'id'>) => void;
  updateSigner: (signerId: string, updates: Partial<Signer>) => void;
  removeSigner: (signerId: string) => void;
  // Template methods
  createTemplate: (template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => DocumentTemplate;
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  createDocumentFromTemplate: (templateId: string, title: string) => Document;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
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

  // Load templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('docuSignClone_templates');
    if (saved) {
      try {
        const parsedTemplates = JSON.parse(saved).map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt),
        }));
        setTemplates(parsedTemplates);
      } catch (error) {
        console.error('Error loading templates from localStorage:', error);
      }
    }
  }, []);

  // Save documents to localStorage whenever documents change
  useEffect(() => {
    localStorage.setItem('docuSignClone_documents', JSON.stringify(documents));
  }, [documents]);

  // Save templates to localStorage whenever templates change
  useEffect(() => {
    localStorage.setItem('docuSignClone_templates', JSON.stringify(templates));
  }, [templates]);

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
    };

    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      templates,
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
      createTemplate,
      updateTemplate,
      deleteTemplate,
      createDocumentFromTemplate,
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
