
import { DocumentTemplate } from '@/contexts/DocumentContext';

export const defaultTemplates: DocumentTemplate[] = [
  {
    id: 'employment-contract',
    name: 'Employment Contract',
    description: 'Standard employment agreement with signature fields for employee and employer',
    category: 'HR & Employment',
    content: '', // Will be set to a sample PDF data
    fields: [
      {
        id: 'employee-name',
        type: 'text',
        x: 15,
        y: 20,
        width: 25,
        height: 4,
        page: 1,
        label: 'Employee Name',
        required: true,
        signerId: 'employee'
      },
      {
        id: 'employee-signature',
        type: 'signature',
        x: 15,
        y: 80,
        width: 20,
        height: 8,
        page: 1,
        label: 'Employee Signature',
        required: true,
        signerId: 'employee'
      },
      {
        id: 'employer-signature',
        type: 'signature',
        x: 60,
        y: 80,
        width: 20,
        height: 8,
        page: 1,
        label: 'Employer Signature',
        required: true,
        signerId: 'employer'
      }
    ],
    signers: [
      {
        id: 'employee',
        name: 'Employee',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      },
      {
        id: 'employer',
        name: 'Employer',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 2
      }
    ],
    tags: ['employment', 'hr', 'contract'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'nda-agreement',
    name: 'Non-Disclosure Agreement',
    description: 'Standard NDA template for protecting confidential information',
    category: 'Legal',
    content: '',
    fields: [
      {
        id: 'disclosing-party',
        type: 'text',
        x: 15,
        y: 15,
        width: 25,
        height: 4,
        page: 1,
        label: 'Disclosing Party',
        required: true,
        signerId: 'party1'
      },
      {
        id: 'receiving-party',
        type: 'text',
        x: 15,
        y: 25,
        width: 25,
        height: 4,
        page: 1,
        label: 'Receiving Party',
        required: true,
        signerId: 'party2'
      },
      {
        id: 'effective-date',
        type: 'date',
        x: 60,
        y: 15,
        width: 15,
        height: 4,
        page: 1,
        label: 'Effective Date',
        required: true
      },
      {
        id: 'party1-signature',
        type: 'signature',
        x: 15,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Disclosing Party Signature',
        required: true,
        signerId: 'party1'
      },
      {
        id: 'party2-signature',
        type: 'signature',
        x: 60,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Receiving Party Signature',
        required: true,
        signerId: 'party2'
      }
    ],
    signers: [
      {
        id: 'party1',
        name: 'Disclosing Party',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      },
      {
        id: 'party2',
        name: 'Receiving Party',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 2
      }
    ],
    tags: ['nda', 'legal', 'confidentiality'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'purchase-agreement',
    name: 'Purchase Agreement',
    description: 'Template for buying and selling goods or services',
    category: 'Sales',
    content: '',
    fields: [
      {
        id: 'buyer-name',
        type: 'text',
        x: 15,
        y: 20,
        width: 25,
        height: 4,
        page: 1,
        label: 'Buyer Name',
        required: true,
        signerId: 'buyer'
      },
      {
        id: 'seller-name',
        type: 'text',
        x: 15,
        y: 30,
        width: 25,
        height: 4,
        page: 1,
        label: 'Seller Name',
        required: true,
        signerId: 'seller'
      },
      {
        id: 'purchase-amount',
        type: 'text',
        x: 60,
        y: 20,
        width: 15,
        height: 4,
        page: 1,
        label: 'Purchase Amount',
        required: true
      },
      {
        id: 'buyer-signature',
        type: 'signature',
        x: 15,
        y: 80,
        width: 20,
        height: 8,
        page: 1,
        label: 'Buyer Signature',
        required: true,
        signerId: 'buyer'
      },
      {
        id: 'seller-signature',
        type: 'signature',
        x: 60,
        y: 80,
        width: 20,
        height: 8,
        page: 1,
        label: 'Seller Signature',
        required: true,
        signerId: 'seller'
      }
    ],
    signers: [
      {
        id: 'buyer',
        name: 'Buyer',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      },
      {
        id: 'seller',
        name: 'Seller',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 2
      }
    ],
    tags: ['purchase', 'sales', 'agreement'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'lease-agreement',
    name: 'Lease Agreement',
    description: 'Residential or commercial property lease template',
    category: 'Real Estate',
    content: '',
    fields: [
      {
        id: 'tenant-name',
        type: 'text',
        x: 15,
        y: 20,
        width: 25,
        height: 4,
        page: 1,
        label: 'Tenant Name',
        required: true,
        signerId: 'tenant'
      },
      {
        id: 'landlord-name',
        type: 'text',
        x: 15,
        y: 30,
        width: 25,
        height: 4,
        page: 1,
        label: 'Landlord Name',
        required: true,
        signerId: 'landlord'
      },
      {
        id: 'monthly-rent',
        type: 'text',
        x: 60,
        y: 20,
        width: 15,
        height: 4,
        page: 1,
        label: 'Monthly Rent',
        required: true
      },
      {
        id: 'lease-term',
        type: 'text',
        x: 60,
        y: 30,
        width: 15,
        height: 4,
        page: 1,
        label: 'Lease Term',
        required: true
      },
      {
        id: 'tenant-signature',
        type: 'signature',
        x: 15,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Tenant Signature',
        required: true,
        signerId: 'tenant'
      },
      {
        id: 'landlord-signature',
        type: 'signature',
        x: 60,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Landlord Signature',
        required: true,
        signerId: 'landlord'
      }
    ],
    signers: [
      {
        id: 'tenant',
        name: 'Tenant',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      },
      {
        id: 'landlord',
        name: 'Landlord',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 2
      }
    ],
    tags: ['lease', 'rental', 'real estate'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'service-agreement',
    name: 'Service Agreement',
    description: 'Professional services contract template',
    category: 'Professional Services',
    content: '',
    fields: [
      {
        id: 'client-name',
        type: 'text',
        x: 15,
        y: 20,
        width: 25,
        height: 4,
        page: 1,
        label: 'Client Name',
        required: true,
        signerId: 'client'
      },
      {
        id: 'service-provider',
        type: 'text',
        x: 15,
        y: 30,
        width: 25,
        height: 4,
        page: 1,
        label: 'Service Provider',
        required: true,
        signerId: 'provider'
      },
      {
        id: 'service-fee',
        type: 'text',
        x: 60,
        y: 20,
        width: 15,
        height: 4,
        page: 1,
        label: 'Service Fee',
        required: true
      },
      {
        id: 'client-signature',
        type: 'signature',
        x: 15,
        y: 80,
        width: 20,
        height: 8,
        page: 1,
        label: 'Client Signature',
        required: true,
        signerId: 'client'
      },
      {
        id: 'provider-signature',
        type: 'signature',
        x: 60,
        y: 80,
        width: 20,
        height: 8,
        page: 1,
        label: 'Provider Signature',
        required: true,
        signerId: 'provider'
      }
    ],
    signers: [
      {
        id: 'client',
        name: 'Client',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      },
      {
        id: 'provider',
        name: 'Service Provider',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 2
      }
    ],
    tags: ['services', 'professional', 'contract'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'vendor-agreement',
    name: 'Vendor Agreement',
    description: 'Supplier and vendor contract template',
    category: 'Business',
    content: '',
    fields: [
      {
        id: 'company-name',
        type: 'text',
        x: 15,
        y: 20,
        width: 25,
        height: 4,
        page: 1,
        label: 'Company Name',
        required: true,
        signerId: 'company'
      },
      {
        id: 'vendor-name',
        type: 'text',
        x: 15,
        y: 30,
        width: 25,
        height: 4,
        page: 1,
        label: 'Vendor Name',
        required: true,
        signerId: 'vendor'
      },
      {
        id: 'contract-value',
        type: 'text',
        x: 60,
        y: 20,
        width: 15,
        height: 4,
        page: 1,
        label: 'Contract Value',
        required: true
      },
      {
        id: 'company-signature',
        type: 'signature',
        x: 15,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Company Signature',
        required: true,
        signerId: 'company'
      },
      {
        id: 'vendor-signature',
        type: 'signature',
        x: 60,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Vendor Signature',
        required: true,
        signerId: 'vendor'
      }
    ],
    signers: [
      {
        id: 'company',
        name: 'Company',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      },
      {
        id: 'vendor',
        name: 'Vendor',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 2
      }
    ],
    tags: ['vendor', 'supplier', 'business'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'consulting-agreement',
    name: 'Consulting Agreement',
    description: 'Independent contractor and consulting services template',
    category: 'Professional Services',
    content: '',
    fields: [
      {
        id: 'consultant-name',
        type: 'text',
        x: 15,
        y: 20,
        width: 25,
        height: 4,
        page: 1,
        label: 'Consultant Name',
        required: true,
        signerId: 'consultant'
      },
      {
        id: 'client-company',
        type: 'text',
        x: 15,
        y: 30,
        width: 25,
        height: 4,
        page: 1,
        label: 'Client Company',
        required: true,
        signerId: 'client'
      },
      {
        id: 'hourly-rate',
        type: 'text',
        x: 60,
        y: 20,
        width: 15,
        height: 4,
        page: 1,
        label: 'Hourly Rate',
        required: true
      },
      {
        id: 'consultant-signature',
        type: 'signature',
        x: 15,
        y: 80,
        width: 20,
        height: 8,
        page: 1,
        label: 'Consultant Signature',
        required: true,
        signerId: 'consultant'
      },
      {
        id: 'client-signature',
        type: 'signature',
        x: 60,
        y: 80,
        width: 20,
        height: 8,
        page: 1,
        label: 'Client Signature',
        required: true,
        signerId: 'client'
      }
    ],
    signers: [
      {
        id: 'consultant',
        name: 'Consultant',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      },
      {
        id: 'client',
        name: 'Client',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 2
      }
    ],
    tags: ['consulting', 'contractor', 'services'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'partnership-agreement',
    name: 'Partnership Agreement',
    description: 'Business partnership formation template',
    category: 'Business',
    content: '',
    fields: [
      {
        id: 'partner1-name',
        type: 'text',
        x: 15,
        y: 20,
        width: 25,
        height: 4,
        page: 1,
        label: 'Partner 1 Name',
        required: true,
        signerId: 'partner1'
      },
      {
        id: 'partner2-name',
        type: 'text',
        x: 15,
        y: 30,
        width: 25,
        height: 4,
        page: 1,
        label: 'Partner 2 Name',
        required: true,
        signerId: 'partner2'
      },
      {
        id: 'business-name',
        type: 'text',
        x: 60,
        y: 20,
        width: 20,
        height: 4,
        page: 1,
        label: 'Business Name',
        required: true
      },
      {
        id: 'partner1-signature',
        type: 'signature',
        x: 15,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Partner 1 Signature',
        required: true,
        signerId: 'partner1'
      },
      {
        id: 'partner2-signature',
        type: 'signature',
        x: 60,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Partner 2 Signature',
        required: true,
        signerId: 'partner2'
      }
    ],
    signers: [
      {
        id: 'partner1',
        name: 'Partner 1',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      },
      {
        id: 'partner2',
        name: 'Partner 2',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 2
      }
    ],
    tags: ['partnership', 'business', 'formation'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'loan-agreement',
    name: 'Loan Agreement',
    description: 'Personal or business loan documentation template',
    category: 'Financial',
    content: '',
    fields: [
      {
        id: 'borrower-name',
        type: 'text',
        x: 15,
        y: 20,
        width: 25,
        height: 4,
        page: 1,
        label: 'Borrower Name',
        required: true,
        signerId: 'borrower'
      },
      {
        id: 'lender-name',
        type: 'text',
        x: 15,
        y: 30,
        width: 25,
        height: 4,
        page: 1,
        label: 'Lender Name',
        required: true,
        signerId: 'lender'
      },
      {
        id: 'loan-amount',
        type: 'text',
        x: 60,
        y: 20,
        width: 15,
        height: 4,
        page: 1,
        label: 'Loan Amount',
        required: true
      },
      {
        id: 'interest-rate',
        type: 'text',
        x: 60,
        y: 30,
        width: 15,
        height: 4,
        page: 1,
        label: 'Interest Rate',
        required: true
      },
      {
        id: 'borrower-signature',
        type: 'signature',
        x: 15,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Borrower Signature',
        required: true,
        signerId: 'borrower'
      },
      {
        id: 'lender-signature',
        type: 'signature',
        x: 60,
        y: 85,
        width: 20,
        height: 8,
        page: 1,
        label: 'Lender Signature',
        required: true,
        signerId: 'lender'
      }
    ],
    signers: [
      {
        id: 'borrower',
        name: 'Borrower',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      },
      {
        id: 'lender',
        name: 'Lender',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 2
      }
    ],
    tags: ['loan', 'financial', 'agreement'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'invoice-template',
    name: 'Invoice Template',
    description: 'Professional invoice with signature approval',
    category: 'Financial',
    content: '',
    fields: [
      {
        id: 'invoice-number',
        type: 'text',
        x: 60,
        y: 15,
        width: 20,
        height: 4,
        page: 1,
        label: 'Invoice Number',
        required: true
      },
      {
        id: 'client-name',
        type: 'text',
        x: 15,
        y: 25,
        width: 30,
        height: 4,
        page: 1,
        label: 'Client Name',
        required: true
      },
      {
        id: 'total-amount',
        type: 'text',
        x: 60,
        y: 50,
        width: 20,
        height: 4,
        page: 1,
        label: 'Total Amount',
        required: true
      },
      {
        id: 'client-approval',
        type: 'signature',
        x: 15,
        y: 80,
        width: 25,
        height: 8,
        page: 1,
        label: 'Client Approval Signature',
        required: true,
        signerId: 'client'
      }
    ],
    signers: [
      {
        id: 'client',
        name: 'Client',
        email: '',
        role: 'signer',
        status: 'pending',
        order: 1
      }
    ],
    tags: ['invoice', 'billing', 'payment'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
