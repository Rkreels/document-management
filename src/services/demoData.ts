
import { Document, DocumentTemplate, Signer, DocumentField, Notification } from '@/contexts/DocumentContext';

export const generateDemoData = () => {
  const demoSigners: Omit<Signer, 'id'>[] = [
    {
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'signer',
      status: 'signed',
      order: 1,
      canDelegate: true,
      requireAuth: 'email',
      signedAt: new Date('2024-05-20T10:30:00Z'),
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@client.com',
      role: 'signer',
      status: 'pending',
      order: 2,
      canDelegate: false,
      requireAuth: 'sms',
    },
    {
      name: 'Mike Davis',
      email: 'mike.davis@legal.com',
      role: 'approver',
      status: 'pending',
      order: 3,
      canDelegate: true,
      requireAuth: 'knowledge',
    },
    {
      name: 'Lisa Chen',
      email: 'lisa.chen@hr.com',
      role: 'cc',
      status: 'pending',
      order: 4,
      canDelegate: false,
      requireAuth: 'email',
    },
  ];

  const demoFields: Omit<DocumentField, 'id'>[] = [
    {
      type: 'signature',
      x: 15,
      y: 20,
      width: 20,
      height: 8,
      position: { x: 15, y: 20 },
      size: { width: 20, height: 8 },
      page: 1,
      required: true,
      label: 'Employee Signature',
      signerId: 'signer_1',
    },
    {
      type: 'text',
      x: 10,
      y: 35,
      width: 25,
      height: 5,
      position: { x: 10, y: 35 },
      size: { width: 25, height: 5 },
      page: 1,
      required: true,
      label: 'Full Name',
      value: 'John Smith',
      validation: {
        type: 'custom',
        pattern: '^[A-Za-z\\s]+$',
        message: 'Please enter a valid name',
      },
    },
    {
      type: 'date',
      x: 45,
      y: 35,
      width: 15,
      height: 5,
      position: { x: 45, y: 35 },
      size: { width: 15, height: 5 },
      page: 1,
      required: true,
      label: 'Date of Birth',
      validation: {
        type: 'custom',
        pattern: '^\\d{2}/\\d{2}/\\d{4}$',
        message: 'Please enter date in MM/DD/YYYY format',
      },
    },
    {
      type: 'checkbox',
      x: 10,
      y: 50,
      width: 5,
      height: 5,
      position: { x: 10, y: 50 },
      size: { width: 5, height: 5 },
      page: 1,
      required: true,
      label: 'I agree to terms and conditions',
      value: 'true',
    },
    {
      type: 'dropdown',
      x: 10,
      y: 65,
      width: 20,
      height: 5,
      position: { x: 10, y: 65 },
      size: { width: 20, height: 5 },
      page: 1,
      required: true,
      label: 'Department',
      options: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'],
      value: 'Engineering',
    },
    {
      type: 'radio',
      x: 40,
      y: 65,
      width: 25,
      height: 10,
      position: { x: 40, y: 65 },
      size: { width: 25, height: 10 },
      page: 1,
      required: true,
      label: 'Employment Type',
      options: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      value: 'Full-time',
    },
  ];

  const demoDocuments: Document[] = [
    {
      id: 'doc_1',
      title: 'Employment Agreement - John Smith',
      content: btoa(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 1250 >>
stream
BT
/F1 14 Tf
250 750 Td
(EMPLOYMENT AGREEMENT) Tj
/F1 11 Tf
0 -30 Td
(This Employment Agreement is entered into on May 15, 2024, between:) Tj
0 -25 Td
(EMPLOYER: TechCorp Industries Inc.) Tj
0 -15 Td
(Address: 123 Business Plaza, San Francisco, CA 94102) Tj
0 -25 Td
(EMPLOYEE: John Smith) Tj
0 -15 Td
(Address: 456 Resident St, San Francisco, CA 94103) Tj
0 -30 Td
(1. POSITION AND DUTIES) Tj
0 -15 Td
(The Employee is hired for the position of Senior Software Engineer.) Tj
0 -15 Td
(Employee agrees to perform duties professionally and diligently.) Tj
0 -25 Td
(2. COMPENSATION) Tj
0 -15 Td
(Annual salary: $125,000, payable bi-weekly via direct deposit.) Tj
0 -25 Td
(3. BENEFITS) Tj
0 -15 Td
(Health insurance, 401k matching, 20 days PTO, stock options.) Tj
0 -25 Td
(4. START DATE) Tj
0 -15 Td
(Employment commences on June 1, 2024.) Tj
0 -30 Td
(SIGNATURES:) Tj
0 -25 Td
(Employee: _____________________ Date: _____) Tj
0 -20 Td
(HR Manager: ___________________ Date: _____) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000252 00000 n 
0000000321 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1623
%%EOF`),
      fields: demoFields.map((field, index) => ({
        ...field,
        id: `field_${index + 1}`,
        signerId: index === 0 ? 'signer_1' : undefined,
      })),
      signers: demoSigners.map((signer, index) => ({
        ...signer,
        id: `signer_${index + 1}`,
      })),
      status: 'sent',
      createdAt: new Date('2024-05-15T09:00:00Z'),
      updatedAt: new Date('2024-05-20T15:30:00Z'),
      signingOrder: 'sequential',
      reminderSchedule: {
        enabled: true,
        frequency: 'weekly',
        customMessage: 'Please complete your employment agreement signature.',
      },
      expiresAt: new Date('2024-06-15T23:59:59Z'),
      security: {
        requireAuth: true,
        allowPrinting: false,
        allowDownload: true,
        watermark: false,
        ipRestriction: false,
      },
      notifications: {
        sendCopyToSender: true,
        ccEmails: ['hr@company.com'],
      },
    },
    {
      id: 'doc_2',
      title: 'NDA - Client Partnership',
      content: btoa(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 1180 >>
stream
BT
/F1 14 Tf
220 750 Td
(NON-DISCLOSURE AGREEMENT) Tj
/F1 11 Tf
0 -30 Td
(This NDA is made on May 20, 2024, between:) Tj
0 -25 Td
(DISCLOSING PARTY: TechCorp Industries Inc.) Tj
0 -15 Td
(Address: 123 Business Plaza, San Francisco, CA 94102) Tj
0 -25 Td
(RECEIVING PARTY: Innovation Partners LLC) Tj
0 -15 Td
(Address: 789 Partner Ave, San Jose, CA 95110) Tj
0 -30 Td
(1. CONFIDENTIAL INFORMATION) Tj
0 -15 Td
(All technical and business information disclosed hereby.) Tj
0 -25 Td
(2. OBLIGATIONS) Tj
0 -15 Td
(Receiving Party agrees to:) Tj
0 -15 Td
(a) Maintain strict confidentiality) Tj
0 -15 Td
(b) Not disclose to third parties) Tj
0 -15 Td
(c) Use only for stated business purpose) Tj
0 -25 Td
(3. TERM) Tj
0 -15 Td
(Agreement effective for 3 years from execution date.) Tj
0 -30 Td
(SIGNATURES:) Tj
0 -25 Td
(Disclosing Party: ______________ Date: _____) Tj
0 -20 Td
(Receiving Party: ______________ Date: _____) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000252 00000 n 
0000000321 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1553
%%EOF`),
      fields: [
        {
          id: 'field_nda_1',
          type: 'signature',
          x: 15,
          y: 80,
          width: 20,
          height: 8,
          position: { x: 15, y: 80 },
          size: { width: 20, height: 8 },
          page: 1,
          required: true,
          label: 'Company Representative',
          signerId: 'signer_nda_1',
        },
        {
          id: 'field_nda_2',
          type: 'signature',
          x: 55,
          y: 80,
          width: 20,
          height: 8,
          position: { x: 55, y: 80 },
          size: { width: 20, height: 8 },
          page: 1,
          required: true,
          label: 'Client Representative',
          signerId: 'signer_nda_2',
        },
      ],
      signers: [
        {
          id: 'signer_nda_1',
          name: 'Robert Wilson',
          email: 'robert.wilson@company.com',
          role: 'signer',
          status: 'signed',
          order: 1,
          canDelegate: true,
          requireAuth: 'email',
          signedAt: new Date('2024-05-22T14:20:00Z'),
        },
        {
          id: 'signer_nda_2',
          name: 'Jennifer Brown',
          email: 'jennifer.brown@client.com',
          role: 'signer',
          status: 'pending',
          order: 2,
          canDelegate: false,
          requireAuth: 'sms',
        },
      ],
      status: 'sent',
      createdAt: new Date('2024-05-20T11:00:00Z'),
      updatedAt: new Date('2024-05-22T14:20:00Z'),
      signingOrder: 'parallel',
      expiresAt: new Date('2024-06-20T23:59:59Z'),
    },
    {
      id: 'doc_3',
      title: 'Vendor Service Agreement',
      content: btoa(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 1100 >>
stream
BT
/F1 14 Tf
210 750 Td
(PROFESSIONAL SERVICES AGREEMENT) Tj
/F1 11 Tf
0 -30 Td
(This Services Agreement dated May 23, 2024, between:) Tj
0 -25 Td
(CLIENT: TechCorp Industries Inc.) Tj
0 -15 Td
(Address: 123 Business Plaza, San Francisco, CA 94102) Tj
0 -25 Td
(SERVICE PROVIDER: Expert Consulting Group) Tj
0 -15 Td
(Address: 321 Professional Way, Oakland, CA 94612) Tj
0 -30 Td
(1. SERVICES) Tj
0 -15 Td
(Provider shall deliver IT consulting and implementation services.) Tj
0 -25 Td
(2. COMPENSATION) Tj
0 -15 Td
(Total contract value: $75,000) Tj
0 -15 Td
(Payment: Net 30 upon milestone completion) Tj
0 -25 Td
(3. TERM) Tj
0 -15 Td
(Six month engagement commencing June 1, 2024) Tj
0 -25 Td
(4. DELIVERABLES) Tj
0 -15 Td
(System architecture design, implementation, training) Tj
0 -30 Td
(SIGNATURES:) Tj
0 -25 Td
(Client: _______________________ Date: _____) Tj
0 -20 Td
(Service Provider: _____________ Date: _____) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000252 00000 n 
0000000321 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1473
%%EOF`),
      fields: [],
      signers: [],
      status: 'draft',
      createdAt: new Date('2024-05-23T16:45:00Z'),
      updatedAt: new Date('2024-05-23T16:45:00Z'),
      signingOrder: 'sequential',
    },
    {
      id: 'doc_4',
      title: 'Partnership Agreement - Completed',
      content: btoa(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 1220 >>
stream
BT
/F1 14 Tf
240 750 Td
(STRATEGIC PARTNERSHIP AGREEMENT) Tj
/F1 11 Tf
0 -30 Td
(This Partnership Agreement dated May 8, 2024, between:) Tj
0 -25 Td
(PARTY A: TechCorp Industries Inc.) Tj
0 -15 Td
(Address: 123 Business Plaza, San Francisco, CA 94102) Tj
0 -25 Td
(PARTY B: Innovation Partners LLC) Tj
0 -15 Td
(Address: 789 Partner Ave, San Jose, CA 95110) Tj
0 -30 Td
(1. PURPOSE) Tj
0 -15 Td
(Joint development and marketing of enterprise software solutions.) Tj
0 -25 Td
(2. TERM) Tj
0 -15 Td
(Initial term of 5 years with automatic renewal provisions.) Tj
0 -25 Td
(3. CONTRIBUTIONS) Tj
0 -15 Td
(Party A: Technology platform and development resources) Tj
0 -15 Td
(Party B: Market access and distribution channels) Tj
0 -25 Td
(4. REVENUE SHARING) Tj
0 -15 Td
(Net revenues split 60/40 after deducting agreed expenses.) Tj
0 -25 Td
(5. GOVERNANCE) Tj
0 -15 Td
(Joint steering committee with equal representation.) Tj
0 -30 Td
(EXECUTED SIGNATURES:) Tj
0 -25 Td
(Party A: Mark Thompson    Date: 05/10/2024) Tj
0 -20 Td
(Party B: Amanda Foster    Date: 05/11/2024) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000252 00000 n 
0000000321 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1593
%%EOF`),
      fields: [],
      signers: [
        {
          id: 'signer_complete_1',
          name: 'Mark Thompson',
          email: 'mark.thompson@partner.com',
          role: 'signer',
          status: 'signed',
          order: 1,
          canDelegate: false,
          requireAuth: 'email',
          signedAt: new Date('2024-05-10T12:00:00Z'),
        },
        {
          id: 'signer_complete_2',
          name: 'Amanda Foster',
          email: 'amanda.foster@company.com',
          role: 'signer',
          status: 'signed',
          order: 2,
          canDelegate: false,
          requireAuth: 'email',
          signedAt: new Date('2024-05-11T09:30:00Z'),
        },
      ],
      status: 'completed',
      createdAt: new Date('2024-05-08T14:00:00Z'),
      updatedAt: new Date('2024-05-11T09:30:00Z'),
      completedAt: new Date('2024-05-11T09:30:00Z'),
      signingOrder: 'sequential',
    },
  ];

  const demoTemplates: DocumentTemplate[] = [
    {
      id: 'template_1',
      name: 'Employment Agreement Template',
      description: 'Standard employment agreement for new hires',
      content: btoa(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 1300 >>
stream
BT
/F1 14 Tf
250 750 Td
(EMPLOYMENT AGREEMENT TEMPLATE) Tj
/F1 11 Tf
0 -30 Td
(This Employment Agreement is entered into on [Date], between:) Tj
0 -25 Td
(EMPLOYER: [Company Name]) Tj
0 -15 Td
(Address: [Company Address]) Tj
0 -25 Td
(EMPLOYEE: [Employee Name]) Tj
0 -15 Td
(Address: [Employee Address]) Tj
0 -30 Td
(1. POSITION AND DUTIES) Tj
0 -15 Td
(The Employee is hired for the position of [Position Title].) Tj
0 -15 Td
(Employee shall perform all duties professionally and competently.) Tj
0 -25 Td
(2. COMPENSATION) Tj
0 -15 Td
(Annual salary: [Annual Salary], payable [Payment Schedule].) Tj
0 -25 Td
(3. BENEFITS) Tj
0 -15 Td
(Health insurance, retirement plan, paid time off, and other benefits.) Tj
0 -25 Td
(4. EMPLOYMENT TERM) Tj
0 -15 Td
(Employment commences on [Start Date] and continues at will.) Tj
0 -25 Td
(5. CONFIDENTIALITY) Tj
0 -15 Td
(Employee agrees to protect all proprietary company information.) Tj
0 -30 Td
(SIGNATURES:) Tj
0 -25 Td
(Employee: _____________________ Date: _____) Tj
0 -20 Td
(HR Representative: ____________ Date: _____) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000252 00000 n 
0000000321 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1673
%%EOF`),
      fields: demoFields.map((field, index) => ({
        ...field,
        id: `template_field_${index + 1}`,
      })),
      signers: [
        {
          id: 'template_signer_1',
          name: 'Employee',
          email: '',
          role: 'signer',
          status: 'pending',
          order: 1,
          canDelegate: false,
          requireAuth: 'email',
        },
        {
          id: 'template_signer_2',
          name: 'HR Representative',
          email: 'hr@company.com',
          role: 'signer',
          status: 'pending',
          order: 2,
          canDelegate: true,
          requireAuth: 'email',
        },
      ],
      createdAt: new Date('2024-04-01T10:00:00Z'),
      updatedAt: new Date('2024-05-01T10:00:00Z'),
      category: 'HR',
      tags: ['employment', 'onboarding', 'legal'],
      usageCount: 15,
    },
    {
      id: 'template_2',
      name: 'NDA Template',
      description: 'Non-disclosure agreement for clients and partners',
      content: btoa(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 1200 >>
stream
BT
/F1 14 Tf
220 750 Td
(NON-DISCLOSURE AGREEMENT TEMPLATE) Tj
/F1 11 Tf
0 -30 Td
(This NDA is made on [Date], between:) Tj
0 -25 Td
(DISCLOSING PARTY: [Party Name]) Tj
0 -15 Td
(Address: [Address]) Tj
0 -25 Td
(RECEIVING PARTY: [Party Name]) Tj
0 -15 Td
(Address: [Address]) Tj
0 -30 Td
(1. CONFIDENTIAL INFORMATION) Tj
0 -15 Td
(All technical, business, and proprietary information disclosed.) Tj
0 -25 Td
(2. OBLIGATIONS OF RECEIVING PARTY) Tj
0 -15 Td
(a) Maintain strict confidentiality of all information) Tj
0 -15 Td
(b) Not disclose to any third parties without written consent) Tj
0 -15 Td
(c) Use information solely for the stated business purpose) Tj
0 -25 Td
(3. TERM AND TERMINATION) Tj
0 -15 Td
(Agreement shall remain in effect for [Duration] from date.) Tj
0 -25 Td
(4. REMEDIES) Tj
0 -15 Td
(Breach may cause irreparable harm; injunctive relief available.) Tj
0 -30 Td
(SIGNATURES:) Tj
0 -25 Td
(Disclosing Party: ______________ Date: _____) Tj
0 -20 Td
(Receiving Party: ______________ Date: _____) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000252 00000 n 
0000000321 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1573
%%EOF`),
      fields: [
        {
          id: 'template_nda_field_1',
          type: 'signature',
          x: 15,
          y: 80,
          width: 20,
          height: 8,
          position: { x: 15, y: 80 },
          size: { width: 20, height: 8 },
          page: 1,
          required: true,
          label: 'Party A Signature',
        },
        {
          id: 'template_nda_field_2',
          type: 'signature',
          x: 55,
          y: 80,
          width: 20,
          height: 8,
          position: { x: 55, y: 80 },
          size: { width: 20, height: 8 },
          page: 1,
          required: true,
          label: 'Party B Signature',
        },
      ],
      signers: [
        {
          id: 'template_nda_signer_1',
          name: 'Company Representative',
          email: '',
          role: 'signer',
          status: 'pending',
          order: 1,
          canDelegate: true,
          requireAuth: 'email',
        },
        {
          id: 'template_nda_signer_2',
          name: 'External Party',
          email: '',
          role: 'signer',
          status: 'pending',
          order: 2,
          canDelegate: false,
          requireAuth: 'sms',
        },
      ],
      createdAt: new Date('2024-03-15T14:30:00Z'),
      updatedAt: new Date('2024-05-15T14:30:00Z'),
      category: 'Legal',
      tags: ['confidentiality', 'legal', 'partnership'],
      usageCount: 8,
    },
  ];

  const demoNotifications: Notification[] = [
    {
      id: 'notif_1',
      documentId: 'doc_1',
      type: 'reminder',
      title: 'Reminder Sent',
      message: 'Reminder sent to Sarah Johnson',
      recipientEmail: 'sarah.johnson@client.com',
      sentAt: new Date('2024-05-21T10:00:00Z'),
      timestamp: new Date('2024-05-21T10:00:00Z'),
      read: false,
      status: 'sent',
      createdAt: new Date('2024-05-21T10:00:00Z'),
    },
    {
      id: 'notif_2',
      documentId: 'doc_2',
      type: 'completed',
      title: 'Document Completed',
      message: 'Document has been completed by all parties',
      recipientEmail: 'jennifer.brown@client.com',
      sentAt: new Date('2024-05-22T14:25:00Z'),
      timestamp: new Date('2024-05-22T14:25:00Z'),
      read: false,
      status: 'sent',
      createdAt: new Date('2024-05-22T14:25:00Z'),
    },
  ];

  return {
    documents: demoDocuments,
    templates: demoTemplates,
    notifications: demoNotifications,
  };
};
