// Removed @react-pdf/renderer dependency for compatibility

// Create a robust PDF generation system that never fails
export class RobustPDFGenerator {
  
  // Generate realistic document PDFs with proper business formatting
  static generateValidSamplePDF(templateName: string): string {
    const documentContent = this.getDocumentContent(templateName);
    
    // Calculate content length
    const contentLines = documentContent.split('\n');
    const contentStream = contentLines.map((line, idx) => 
      `0 -${idx === 0 ? 0 : 18} Td\n(${line}) Tj`
    ).join('\n');
    
    const streamContent = `BT
/F1 11 Tf
50 750 Td
${contentStream}
ET`;

    const streamLength = streamContent.length;
    
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
/F2 5 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 6 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

6 0 obj
<<
/Length ${streamLength}
>>
stream
${streamContent}
endstream
endobj

xref
0 7
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
0000000258 00000 n 
0000000327 00000 n 
0000000401 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
${500 + streamLength}
%%EOF`;

    return btoa(pdfContent);
  }

  // Get realistic document content based on template type
  private static getDocumentContent(templateName: string): string {
    const templates: Record<string, string> = {
      'Employment Contract': `EMPLOYMENT AGREEMENT

This Employment Agreement is entered into on [Date], between:

EMPLOYER: [Company Name]
Address: [Company Address]
  
EMPLOYEE: [Employee Name]  
Address: [Employee Address]

1. POSITION AND DUTIES
The Employee is hired for the position of [Position Title]. The Employee agrees to
perform duties as assigned by the Employer in a professional manner.

2. COMPENSATION  
The Employee shall receive an annual salary of [Annual Salary], payable in
accordance with the Employer's standard payroll schedule.

3. BENEFITS
The Employee shall be entitled to standard company benefits including health
insurance, paid time off, and retirement plan contributions.

4. TERM
This agreement shall commence on [Start Date] and continue until terminated by
either party with appropriate notice.

5. CONFIDENTIALITY
Employee agrees to maintain confidentiality of all proprietary company information.

SIGNATURES:
Employee: _____________________ Date: _____
HR Manager: ___________________ Date: _____`,

      'Non-Disclosure Agreement': `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is made on [Date], between:

DISCLOSING PARTY: [Party Name]
Address: [Address]

RECEIVING PARTY: [Party Name]
Address: [Address]

1. CONFIDENTIAL INFORMATION
For purposes of this Agreement, "Confidential Information" means all technical
and business information disclosed by Disclosing Party.

2. OBLIGATIONS
Receiving Party agrees to:
a) Maintain confidentiality of all Confidential Information
b) Not disclose to any third parties without written consent
c) Use information solely for the stated business purpose

3. TERM
This Agreement shall remain in effect for [Duration] from the Effective Date.

4. RETURN OF MATERIALS
Upon termination, Receiving Party shall return all Confidential Information.

5. REMEDIES
Parties acknowledge that breach may cause irreparable harm and agree to
injunctive relief in addition to other remedies.

SIGNATURES:
Disclosing Party: ______________ Date: _____
Receiving Party: ______________ Date: _____`,

      'Lease Agreement': `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is entered into on [Date], between:

LANDLORD: [Landlord Name]
Address: [Landlord Address]

TENANT: [Tenant Name]
Address: [Current Address]

PROPERTY ADDRESS: [Rental Property Address]

1. TERM
The term of this lease shall be [Lease Term], commencing on [Start Date]
and ending on [End Date].

2. RENT
Tenant agrees to pay monthly rent of [Monthly Rent Amount], due on the
[Day] of each month. Payment shall be made to [Payment Address].

3. SECURITY DEPOSIT
Tenant shall pay a security deposit of [Deposit Amount], to be held for damages.

4. UTILITIES
Tenant shall be responsible for: [List of Utilities]
Landlord shall be responsible for: [List of Utilities]

5. MAINTENANCE
Tenant agrees to maintain premises in good condition and report repairs promptly.

6. TERMINATION
Either party may terminate with [Notice Period] written notice.

SIGNATURES:
Landlord: _____________________ Date: _____
Tenant: _______________________ Date: _____`,

      'Sales Contract': `SALES CONTRACT

This Sales Contract is made on [Date], between:

SELLER: [Seller Name/Company]
Address: [Seller Address]

BUYER: [Buyer Name/Company]
Address: [Buyer Address]

1. GOODS/SERVICES
Seller agrees to sell and Buyer agrees to purchase:
[Description of Goods/Services]

2. PURCHASE PRICE
The total purchase price is [Amount], payable as follows:
- Deposit: [Amount] due on [Date]
- Balance: [Amount] due on [Date]

3. DELIVERY
Delivery shall be made to [Delivery Address] on or before [Delivery Date].
Risk of loss passes to Buyer upon delivery.

4. WARRANTIES
Seller warrants that goods are free from defects and conform to specifications.
Warranty period: [Duration]

5. INSPECTION AND ACCEPTANCE
Buyer shall inspect goods within [Days] of delivery and notify Seller of defects.

6. DISPUTE RESOLUTION
Disputes shall be resolved through arbitration in [Location].

SIGNATURES:
Seller: _______________________ Date: _____
Buyer: ________________________ Date: _____`,

      'Service Agreement': `PROFESSIONAL SERVICES AGREEMENT

This Services Agreement is entered into on [Date], between:

CLIENT: [Client Name/Company]
Address: [Client Address]

SERVICE PROVIDER: [Provider Name/Company]
Address: [Provider Address]

1. SERVICES
Provider agrees to perform the following services:
[Detailed Service Description]

2. COMPENSATION
Client agrees to pay Provider [Fee Amount] for services rendered.
Payment terms: [Payment Schedule]

3. TERM AND TERMINATION
Services shall commence on [Start Date] and continue until [End Date].
Either party may terminate with [Notice Period] written notice.

4. DELIVERABLES
Provider shall deliver the following:
- [Deliverable 1] by [Date]
- [Deliverable 2] by [Date]
- [Deliverable 3] by [Date]

5. INTELLECTUAL PROPERTY
All work product shall be owned by [Owner], with [Rights] retained by Provider.

6. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

7. INDEMNIFICATION
Each party shall indemnify the other against claims arising from their actions.

SIGNATURES:
Client: _______________________ Date: _____
Service Provider: _____________ Date: _____`
    };

    return templates[templateName] || templates['Employment Contract'];
  }

  // Fallback: Create a simple text-based document representation
  static generateFallbackDocument(templateName: string): string {
    const content = `
DOCUMENT: ${templateName}
${'='.repeat(50)}

This is a sample document template.

Fields can be configured in the editor:
- Text fields for information input
- Signature fields for digital signing
- Date fields for temporal data
- Checkbox fields for confirmations

This document preview ensures the application
never fails to display content, providing a
robust user experience.

Instructions:
1. Use the editor to customize fields
2. Add signers and configure workflows
3. Test signing functionality
4. Deploy for production use

Status: Ready for configuration
Created: ${new Date().toLocaleDateString()}
    `;
    
    return btoa(content);
  }

  // HTML-based document for universal display
  static generateHTMLDocument(templateName: string): string {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${templateName}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .content { margin-top: 30px; }
            .field-placeholder { border: 1px dashed #666; padding: 10px; margin: 10px 0; background: #f9f9f9; }
            .signature-area { height: 60px; border: 1px solid #333; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${templateName}</h1>
            <p>Sample Document Template</p>
        </div>
        <div class="content">
            <p>This is a demonstration document for the ${templateName} template.</p>
            
            <div class="field-placeholder">
                <strong>Text Field:</strong> [Enter information here]
            </div>
            
            <div class="field-placeholder">
                <strong>Date Field:</strong> [Select date]
            </div>
            
            <div class="field-placeholder">
                <strong>Checkbox:</strong> ☐ I agree to the terms
            </div>
            
            <p>Signature Areas:</p>
            <div class="signature-area">
                <small>Employee Signature & Date</small>
            </div>
            
            <div class="signature-area">
                <small>Manager Signature & Date</small>
            </div>
            
            <hr>
            <p><small>Document created: ${new Date().toLocaleDateString()}</small></p>
        </div>
    </body>
    </html>`;
    
    return btoa(htmlContent);
  }
}

// Utility to validate PDF data
export const validatePDFData = (data: string): boolean => {
  try {
    if (!data || data.length === 0) return false;
    
    // Remove data URL prefix if present
    let cleanData = data;
    if (data.includes('base64,')) {
      cleanData = data.split('base64,')[1];
    }
    
    // Decode and check for PDF header
    const decoded = atob(cleanData);
    return decoded.startsWith('%PDF');
  } catch {
    return false;
  }
};

// Get appropriate document content with fallbacks
export const getDocumentContent = (templateName: string): { content: string; type: 'pdf' | 'html' | 'text' } => {
  try {
    // First try to generate a valid PDF
    const pdfContent = RobustPDFGenerator.generateValidSamplePDF(templateName);
    if (validatePDFData(pdfContent)) {
      return { content: pdfContent, type: 'pdf' };
    }
  } catch (error) {
    console.warn('PDF generation failed, using HTML fallback:', error);
  }

  try {
    // Fallback to HTML document
    const htmlContent = RobustPDFGenerator.generateHTMLDocument(templateName);
    return { content: htmlContent, type: 'html' };
  } catch (error) {
    console.warn('HTML generation failed, using text fallback:', error);
  }

  // Final fallback to text
  const textContent = RobustPDFGenerator.generateFallbackDocument(templateName);
  return { content: textContent, type: 'text' };
};