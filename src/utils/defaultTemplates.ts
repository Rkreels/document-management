import { DocumentTemplate } from '@/contexts/DocumentContext';

// Generate a valid sample PDF with the template name
const generateSamplePDF = (templateName: string): string => {
  return 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKFNhbXBsZSBEb2N1bWVudCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago6cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMxMiAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwNQolJUVPRg==';
};

export const defaultTemplates: DocumentTemplate[] = [
  {
    id: 'template-employment-contract',
    name: 'Employment Contract',
    description: 'Comprehensive employment agreement with standard terms and conditions',
    category: 'Legal',
    tags: ['employment', 'contract', 'legal'],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    fields: [
      { 
        id: 'emp-name', 
        type: 'text', 
        label: 'Employee Name', 
        required: true, 
        x: 10, 
        y: 20, 
        width: 30, 
        height: 5,
        position: { x: 10, y: 20 },
        size: { width: 30, height: 5 },
        page: 1
      },
      { 
        id: 'emp-position', 
        type: 'text', 
        label: 'Position', 
        required: true, 
        x: 10, 
        y: 30, 
        width: 30, 
        height: 5,
        position: { x: 10, y: 30 },
        size: { width: 30, height: 5 },
        page: 1
      },
      { 
        id: 'start-date', 
        type: 'date', 
        label: 'Start Date', 
        required: true, 
        x: 10, 
        y: 40, 
        width: 25, 
        height: 5,
        position: { x: 10, y: 40 },
        size: { width: 25, height: 5 },
        page: 1
      },
      { 
        id: 'salary', 
        type: 'text', 
        label: 'Annual Salary', 
        required: true, 
        x: 10, 
        y: 50, 
        width: 25, 
        height: 5,
        position: { x: 10, y: 50 },
        size: { width: 25, height: 5 },
        page: 1
      },
      { 
        id: 'emp-signature', 
        type: 'signature', 
        label: 'Employee Signature', 
        required: true, 
        x: 10, 
        y: 75, 
        width: 30, 
        height: 8,
        position: { x: 10, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'employee'
      },
      { 
        id: 'hr-signature', 
        type: 'signature', 
        label: 'HR Manager Signature', 
        required: true, 
        x: 50, 
        y: 75, 
        width: 30, 
        height: 8,
        position: { x: 50, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'hr-manager'
      }
    ],
    signers: [
      { id: 'employee', name: 'Employee', email: '', role: 'employee', order: 1, status: 'pending' },
      { id: 'hr-manager', name: 'HR Manager', email: '', role: 'hr', order: 2, status: 'pending' }
    ],
    content: generateSamplePDF('Employment Contract')
  },
  {
    id: 'template-nda',
    name: 'Non-Disclosure Agreement',
    description: 'Standard confidentiality agreement for protecting sensitive information',
    category: 'Legal',
    tags: ['nda', 'confidentiality', 'legal'],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    fields: [
      {
        id: 'disclosing-party',
        type: 'text',
        label: 'Disclosing Party',
        required: true,
        x: 10,
        y: 20,
        width: 35,
        height: 5,
        position: { x: 10, y: 20 },
        size: { width: 35, height: 5 },
        page: 1
      },
      {
        id: 'receiving-party',
        type: 'text',
        label: 'Receiving Party',
        required: true,
        x: 10,
        y: 30,
        width: 35,
        height: 5,
        position: { x: 10, y: 30 },
        size: { width: 35, height: 5 },
        page: 1
      },
      {
        id: 'effective-date',
        type: 'date',
        label: 'Effective Date',
        required: true,
        x: 10,
        y: 40,
        width: 25,
        height: 5,
        position: { x: 10, y: 40 },
        size: { width: 25, height: 5 },
        page: 1
      },
      {
        id: 'disclosing-signature',
        type: 'signature',
        label: 'Disclosing Party Signature',
        required: true,
        x: 10,
        y: 75,
        width: 30,
        height: 8,
        position: { x: 10, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'disclosing'
      },
      {
        id: 'receiving-signature',
        type: 'signature',
        label: 'Receiving Party Signature',
        required: true,
        x: 50,
        y: 75,
        width: 30,
        height: 8,
        position: { x: 50, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'receiving'
      }
    ],
    signers: [
      { id: 'disclosing', name: 'Disclosing Party', email: '', role: 'party1', order: 1, status: 'pending' },
      { id: 'receiving', name: 'Receiving Party', email: '', role: 'party2', order: 2, status: 'pending' }
    ],
    content: generateSamplePDF('Non-Disclosure Agreement')
  },
  {
    id: 'template-lease-agreement',
    name: 'Lease Agreement',
    description: 'Residential or commercial property lease contract',
    category: 'Real Estate',
    tags: ['lease', 'rental', 'property'],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    fields: [
      {
        id: 'tenant-name',
        type: 'text',
        label: 'Tenant Name',
        required: true,
        x: 10,
        y: 20,
        width: 35,
        height: 5,
        position: { x: 10, y: 20 },
        size: { width: 35, height: 5 },
        page: 1
      },
      {
        id: 'property-address',
        type: 'text',
        label: 'Property Address',
        required: true,
        x: 10,
        y: 30,
        width: 50,
        height: 5,
        position: { x: 10, y: 30 },
        size: { width: 50, height: 5 },
        page: 1
      },
      {
        id: 'lease-term',
        type: 'text',
        label: 'Lease Term',
        required: true,
        x: 10,
        y: 40,
        width: 25,
        height: 5,
        position: { x: 10, y: 40 },
        size: { width: 25, height: 5 },
        page: 1
      },
      {
        id: 'monthly-rent',
        type: 'text',
        label: 'Monthly Rent',
        required: true,
        x: 10,
        y: 50,
        width: 25,
        height: 5,
        position: { x: 10, y: 50 },
        size: { width: 25, height: 5 },
        page: 1
      },
      {
        id: 'tenant-signature',
        type: 'signature',
        label: 'Tenant Signature',
        required: true,
        x: 10,
        y: 75,
        width: 30,
        height: 8,
        position: { x: 10, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'tenant'
      },
      {
        id: 'landlord-signature',
        type: 'signature',
        label: 'Landlord Signature',
        required: true,
        x: 50,
        y: 75,
        width: 30,
        height: 8,
        position: { x: 50, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'landlord'
      }
    ],
    signers: [
      { id: 'tenant', name: 'Tenant', email: '', role: 'tenant', order: 1, status: 'pending' },
      { id: 'landlord', name: 'Landlord', email: '', role: 'landlord', order: 2, status: 'pending' }
    ],
    content: generateSamplePDF('Lease Agreement')
  },
  {
    id: 'template-sales-contract',
    name: 'Sales Contract',
    description: 'Purchase agreement for goods or services',
    category: 'Business',
    tags: ['sales', 'purchase', 'contract'],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    fields: [
      {
        id: 'buyer-name',
        type: 'text',
        label: 'Buyer Name',
        required: true,
        x: 10,
        y: 20,
        width: 35,
        height: 5,
        position: { x: 10, y: 20 },
        size: { width: 35, height: 5 },
        page: 1
      },
      {
        id: 'seller-name',
        type: 'text',
        label: 'Seller Name',
        required: true,
        x: 10,
        y: 30,
        width: 35,
        height: 5,
        position: { x: 10, y: 30 },
        size: { width: 35, height: 5 },
        page: 1
      },
      {
        id: 'purchase-price',
        type: 'text',
        label: 'Purchase Price',
        required: true,
        x: 10,
        y: 40,
        width: 25,
        height: 5,
        position: { x: 10, y: 40 },
        size: { width: 25, height: 5 },
        page: 1
      },
      {
        id: 'delivery-date',
        type: 'date',
        label: 'Delivery Date',
        required: true,
        x: 10,
        y: 50,
        width: 25,
        height: 5,
        position: { x: 10, y: 50 },
        size: { width: 25, height: 5 },
        page: 1
      },
      {
        id: 'buyer-signature',
        type: 'signature',
        label: 'Buyer Signature',
        required: true,
        x: 10,
        y: 75,
        width: 30,
        height: 8,
        position: { x: 10, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'buyer'
      },
      {
        id: 'seller-signature',
        type: 'signature',
        label: 'Seller Signature',
        required: true,
        x: 50,
        y: 75,
        width: 30,
        height: 8,
        position: { x: 50, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'seller'
      }
    ],
    signers: [
      { id: 'buyer', name: 'Buyer', email: '', role: 'buyer', order: 1, status: 'pending' },
      { id: 'seller', name: 'Seller', email: '', role: 'seller', order: 2, status: 'pending' }
    ],
    content: generateSamplePDF('Sales Contract')
  },
  {
    id: 'template-service-agreement',
    name: 'Service Agreement',
    description: 'Professional services contract with terms and deliverables',
    category: 'Business',
    tags: ['service', 'professional', 'contract'],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    fields: [
      {
        id: 'client-name',
        type: 'text',
        label: 'Client Name',
        required: true,
        x: 10,
        y: 20,
        width: 35,
        height: 5,
        position: { x: 10, y: 20 },
        size: { width: 35, height: 5 },
        page: 1
      },
      {
        id: 'service-description',
        type: 'text',
        label: 'Service Description',
        required: true,
        x: 10,
        y: 30,
        width: 50,
        height: 10,
        position: { x: 10, y: 30 },
        size: { width: 50, height: 10 },
        page: 1
      },
      {
        id: 'service-fee',
        type: 'text',
        label: 'Service Fee',
        required: true,
        x: 10,
        y: 45,
        width: 25,
        height: 5,
        position: { x: 10, y: 45 },
        size: { width: 25, height: 5 },
        page: 1
      },
      {
        id: 'completion-date',
        type: 'date',
        label: 'Expected Completion',
        required: true,
        x: 10,
        y: 55,
        width: 25,
        height: 5,
        position: { x: 10, y: 55 },
        size: { width: 25, height: 5 },
        page: 1
      },
      {
        id: 'client-signature',
        type: 'signature',
        label: 'Client Signature',
        required: true,
        x: 10,
        y: 75,
        width: 30,
        height: 8,
        position: { x: 10, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'client'
      },
      {
        id: 'provider-signature',
        type: 'signature',
        label: 'Service Provider Signature',
        required: true,
        x: 50,
        y: 75,
        width: 30,
        height: 8,
        position: { x: 50, y: 75 },
        size: { width: 30, height: 8 },
        page: 1,
        signerId: 'provider'
      }
    ],
    signers: [
      { id: 'client', name: 'Client', email: '', role: 'client', order: 1, status: 'pending' },
      { id: 'provider', name: 'Service Provider', email: '', role: 'provider', order: 2, status: 'pending' }
    ],
    content: generateSamplePDF('Service Agreement')
  }
];