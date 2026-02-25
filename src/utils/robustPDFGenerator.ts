import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class RobustPDFGenerator {
  
  static async generateRealPDF(templateName: string): Promise<string> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { height } = page.getSize();

      const lines = this.getDocumentContent(templateName).split('\n');
      let y = height - 60;

      for (const line of lines) {
        if (y < 40) break;
        const trimmed = line.trimEnd();
        const isBold = /^[A-Z][A-Z\s\-:]+$/.test(trimmed) || trimmed.startsWith('SECTION') || trimmed.length > 0 && trimmed === trimmed.toUpperCase() && trimmed.length > 3;
        const fontSize = isBold ? 13 : 10;
        const usedFont = isBold ? boldFont : font;

        if (trimmed.length === 0) {
          y -= 10;
          continue;
        }

        // Word-wrap long lines
        const maxWidth = 500;
        const words = trimmed.split(' ');
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = usedFont.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > maxWidth && currentLine) {
            page.drawText(currentLine, { x: 50, y, size: fontSize, font: usedFont, color: rgb(0.1, 0.1, 0.1) });
            y -= fontSize + 4;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          page.drawText(currentLine, { x: 50, y, size: fontSize, font: usedFont, color: rgb(0.1, 0.1, 0.1) });
          y -= fontSize + 4;
        }
      }

      // Add a footer line
      page.drawLine({ start: { x: 50, y: 35 }, end: { x: 562, y: 35 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
      page.drawText(`Document: ${templateName}  |  Generated for Demo`, { x: 50, y: 22, size: 7, font, color: rgb(0.5, 0.5, 0.5) });

      const pdfBytes = await pdfDoc.save();
      // Convert Uint8Array to base64
      let binary = '';
      const bytes = new Uint8Array(pdfBytes);
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('pdf-lib generation failed, using fallback:', error);
      return this.generateValidSamplePDF(templateName);
    }
  }

  // Synchronous fallback
  static generateValidSamplePDF(templateName: string): string {
    const documentContent = this.getDocumentContent(templateName);
    const contentLines = documentContent.split('\n').filter(l => l.trim());
    const contentStream = contentLines.map((line, idx) => 
      `0 -${idx === 0 ? 0 : 16} Td\n(${line.replace(/[()\\]/g, '\\$&')}) Tj`
    ).join('\n');
    
    const streamContent = `BT\n/F1 10 Tf\n50 740 Td\n${contentStream}\nET`;
    const streamLength = streamContent.length;
    
    const pdfContent = `%PDF-1.4
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
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
0000000258 00000 n 
0000000327 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

    return btoa(pdfContent);
  }

  static getDocumentContent(templateName: string): string {
    const templates: Record<string, string> = {
      'Employment Agreement': `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of January 15, 2026,
by and between TechCorp International, Inc. ("Employer") and Sarah Chen ("Employee").

RECITALS

WHEREAS, the Employer desires to employ the Employee in the capacity described herein;
WHEREAS, the Employee desires to accept such employment under the terms stated;

NOW, THEREFORE, in consideration of the mutual covenants, the parties agree:

SECTION 1 - POSITION AND DUTIES
1.1 The Employee is hereby employed as Senior Software Engineer.
1.2 Employee shall report to the VP of Engineering.
1.3 Employee agrees to devote full working time to the duties assigned.

SECTION 2 - COMPENSATION
2.1 Base Salary: $145,000 per annum, paid bi-weekly.
2.2 Performance Bonus: Up to 15% of base salary, reviewed annually.
2.3 Stock Options: 10,000 shares vesting over 4 years with 1-year cliff.

SECTION 3 - BENEFITS
3.1 Health, dental, and vision insurance effective from start date.
3.2 401(k) retirement plan with 4% employer match.
3.3 25 days paid time off annually plus company holidays.

SECTION 4 - TERM AND TERMINATION
4.1 Employment is at-will and may be terminated by either party.
4.2 Employer shall provide 30 days written notice of termination.
4.3 Severance of 3 months base salary upon involuntary termination.

SECTION 5 - CONFIDENTIALITY
5.1 Employee agrees to maintain strict confidentiality of proprietary information.
5.2 This obligation survives termination of employment.

SIGNATURES:
_________________________         Date: ___________
Sarah Chen, Employee

_________________________         Date: ___________
David Park, HR Manager`,

      'Non-Disclosure Agreement': `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("NDA") is made effective as of January 5, 2026,

BETWEEN:
  Disclosing Party: TechCorp International, Inc.
  Address: 500 Innovation Drive, Suite 200, San Francisco, CA 94105

  Receiving Party: Innovatech Solutions, LLC
  Address: 1200 Market Street, Floor 8, New York, NY 10001

RECITALS
The parties wish to explore a potential business partnership and must share
certain confidential and proprietary information during discussions.

SECTION 1 - DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" shall mean all non-public information disclosed by
either party, including but not limited to: trade secrets, business plans,
financial data, customer lists, technical specifications, software source code,
marketing strategies, and any information marked "Confidential."

SECTION 2 - OBLIGATIONS OF RECEIVING PARTY
2.1 Maintain confidentiality using the same degree of care as own information.
2.2 Not disclose to any third party without prior written consent.
2.3 Use information solely for evaluating the proposed partnership.
2.4 Limit access to employees with a need-to-know basis.

SECTION 3 - EXCLUSIONS
This Agreement does not apply to information that:
(a) Is or becomes publicly available through no fault of the Receiving Party;
(b) Was already in possession prior to disclosure;
(c) Is independently developed without use of Confidential Information;
(d) Is disclosed pursuant to a court order or legal requirement.

SECTION 4 - TERM
This Agreement remains in effect for three (3) years from the Effective Date.

SECTION 5 - RETURN OF MATERIALS
Upon termination, all Confidential Information shall be returned or destroyed.

SECTION 6 - REMEDIES
Breach may cause irreparable harm; injunctive relief shall be available.

SIGNATURES:
_________________________         Date: ___________
Robert Wilson, Company Representative

_________________________         Date: ___________
Jennifer Lee, Partner Representative`,

      'Vendor Service Contract': `VENDOR SERVICE CONTRACT - Q1 2026

Contract Number: VSC-2026-0301
Effective Date: February 1, 2026
Expiration Date: April 30, 2026

PARTIES:
  Client: TechCorp International, Inc.
  Vendor: [To Be Determined]

SCOPE OF SERVICES
The Vendor shall provide the following services:
1. Cloud infrastructure management and monitoring
2. 24/7 technical support with 15-minute response SLA
3. Monthly security audits and compliance reporting
4. Database optimization and performance tuning

SERVICE LEVEL AGREEMENTS
- Uptime Guarantee: 99.95% monthly availability
- Response Time: Critical issues within 15 minutes
- Resolution Time: P1 within 4 hours, P2 within 8 hours
- Reporting: Monthly performance and incident reports

COMPENSATION
- Monthly Service Fee: $12,500
- Setup Fee (one-time): $5,000
- Overage Rate: $150/hour beyond agreed scope
- Payment Terms: Net 30 from invoice date

TERMS AND CONDITIONS
This contract is in DRAFT status and pending vendor assignment.
All terms are subject to final negotiation and approval.

SIGNATURES:
_________________________         Date: ___________
Client Representative

_________________________         Date: ___________
Vendor Representative`,

      'Lease Agreement': `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is entered into on January 15, 2026, between:

LANDLORD: James Mitchell
Address: 456 Oak Avenue, Suite 100, Chicago, IL 60601

TENANT: Emily Rodriguez
Address: (current) 789 Elm Street, Apt 3B, Chicago, IL 60614

PROPERTY: 123 Main Street, Unit 4A, Chicago, IL 60610

SECTION 1 - LEASE TERM
1.1 Lease commences: March 1, 2026
1.2 Lease expires: February 28, 2027
1.3 Option to renew: Available with 60 days written notice

SECTION 2 - RENT
2.1 Monthly Rent: $2,450.00
2.2 Due Date: 1st of each month
2.3 Late Fee: $75 if received after the 5th
2.4 Payment Method: Electronic transfer or certified check

SECTION 3 - SECURITY DEPOSIT
3.1 Amount: $4,900.00 (two months' rent)
3.2 To be returned within 30 days of lease termination
3.3 Deductions only for damages beyond normal wear and tear

SECTION 4 - UTILITIES
Tenant responsible for: Electric, gas, internet, cable
Landlord responsible for: Water, sewer, trash removal

SECTION 5 - MAINTENANCE AND REPAIRS
5.1 Landlord maintains structural elements and major systems.
5.2 Tenant maintains cleanliness and reports issues promptly.
5.3 Emergency repairs: Contact property management at (312) 555-0198.

SECTION 6 - RULES AND RESTRICTIONS
6.1 No smoking inside the premises.
6.2 Pets allowed with $500 pet deposit (max 2 pets under 50 lbs).
6.3 No alterations without written landlord approval.

SIGNATURES:
_________________________         Date: ___________
Emily Rodriguez, Tenant

_________________________         Date: ___________
James Mitchell, Landlord`,

      'Sales Agreement': `SALES AGREEMENT - ENTERPRISE LICENSE

Agreement Number: SA-2025-1120
Effective Date: November 20, 2025

SELLER: CloudVault Technologies, Inc.
Address: 200 Tech Park Blvd, Austin, TX 78701
Contact: Michelle Wang, VP Sales

BUYER: Apex Digital Solutions, Corp.
Address: 3500 Commerce Drive, Seattle, WA 98101
Contact: Alex Turner, Director of IT

PRODUCT DESCRIPTION
Enterprise Software License - CloudVault Platform v5.0
- Unlimited user seats
- All premium modules included
- Priority support (24/7)
- Custom integrations package
- On-premise deployment option

PRICING
License Fee (Annual): $89,500.00
Implementation Services: $15,000.00
Training Package (40 hours): $8,000.00
Total Contract Value: $112,500.00

PAYMENT SCHEDULE
- 50% upon contract signing: $56,250.00
- 25% upon go-live: $28,125.00
- 25% Net 30 after go-live: $28,125.00

WARRANTY
12-month warranty covering all defects and performance issues.
99.9% uptime SLA with financial credits for any breach.

SIGNATURES:
_________________________         Date: ___________
Alex Turner, Buyer

_________________________         Date: ___________
Michelle Wang, Seller`,

      'Consulting Agreement': `PROFESSIONAL CONSULTING AGREEMENT

Date: January 20, 2026

CLIENT: MarketPro Analytics, Inc.
Address: 900 Market Center, Floor 12, Boston, MA 02108
Contact: Lisa Anderson, CEO

CONSULTANT: Carlos Martinez, Independent Consultant
Address: 2100 Sunset Boulevard, Miami, FL 33139
Specialization: Digital Marketing Strategy & Analytics

SCOPE OF WORK
Phase 1 - Assessment (Weeks 1-2):
  - Audit current marketing channels and performance
  - Analyze customer acquisition costs and ROI
  - Review competitive landscape and market positioning

Phase 2 - Strategy Development (Weeks 3-4):
  - Develop comprehensive digital marketing strategy
  - Create channel-specific action plans
  - Design KPI framework and measurement dashboard

Phase 3 - Implementation Support (Weeks 5-8):
  - Guide implementation of recommended strategies
  - Train internal team on analytics tools
  - Provide weekly progress reviews

COMPENSATION
Consulting Fee: $175/hour
Estimated Total: $28,000 (160 hours)
Payment Terms: Bi-weekly invoicing, Net 15

DELIVERABLES
1. Marketing Audit Report
2. Strategic Plan Document
3. KPI Dashboard Setup
4. Training Materials and Documentation
5. Final Recommendations Report

CONFIDENTIALITY
Both parties agree to maintain confidentiality of all proprietary information.

SIGNATURES:
_________________________         Date: ___________
Carlos Martinez, Consultant

_________________________         Date: ___________
Lisa Anderson, Client`,

      'Board Resolution': `BOARD RESOLUTION - ANNUAL MEETING

Resolution Number: BR-2025-AM-001
Date: October 15, 2025
Location: Corporate Headquarters, Board Room A

PRESENT:
  Thomas Blake, Chairman of the Board
  Patricia Hayes, Corporate Secretary
  Michael Torres, Board Member
  Sandra Williams, Board Member
  Richard Cooper, Board Member

QUORUM: A quorum of the Board of Directors was confirmed present.

RESOLUTION 1 - APPROVAL OF ANNUAL FINANCIAL STATEMENTS
RESOLVED, that the Board approves the audited financial statements for
fiscal year 2024-2025, as prepared by Ernst & Associates, CPAs.
Revenue: $45.2M | Net Income: $8.7M | Assets: $62.3M

RESOLUTION 2 - DIVIDEND DECLARATION
RESOLVED, that a quarterly dividend of $0.45 per share be declared,
payable to shareholders of record as of November 1, 2025.

RESOLUTION 3 - EXECUTIVE COMPENSATION
RESOLVED, that the executive compensation packages for FY2025-2026
be approved as recommended by the Compensation Committee.

RESOLUTION 4 - STRATEGIC INITIATIVES
RESOLVED, that the Board authorizes management to proceed with
the proposed expansion into the European market with a budget of $5M.

VOTE: Resolutions 1-3 approved unanimously.
Resolution 4: DECLINED (3 in favor, 2 opposed - insufficient majority).

SIGNATURES:
_________________________         Date: ___________
Thomas Blake, Chairman

_________________________         Date: ___________
Patricia Hayes, Secretary`,

      'Freelancer Contract': `FREELANCER CONTRACT - DESIGN WORK

Contract ID: FC-2025-DW-088
Date: September 1, 2025

CLIENT: TechCorp International, Inc.
Project Manager: Alex Rivera

FREELANCER: Nina Patel
Specialization: UI/UX Design
Portfolio: ninapatel.design

PROJECT: Website Redesign - Corporate Platform

DELIVERABLES
1. User Research & Personas (Week 1-2)
   - User interviews (minimum 10 participants)
   - Persona development (3-5 personas)
   - Journey mapping

2. Wireframes & Prototypes (Week 3-4)
   - Low-fidelity wireframes for all pages
   - Interactive prototype in Figma
   - Mobile-responsive designs

3. Visual Design (Week 5-6)
   - High-fidelity mockups
   - Design system components
   - Icon set and illustration style guide

4. Developer Handoff (Week 7-8)
   - Annotated design specs
   - Asset export package
   - CSS/Tailwind token definitions

COMPENSATION
Fixed Project Fee: $18,500
Payment Schedule:
  - 30% upfront: $5,550
  - 40% at prototype approval: $7,400
  - 30% upon final delivery: $5,550

STATUS: EXPIRED - Contract expired October 1, 2025 without completion.

SIGNATURES:
_________________________         Date: ___________
Nina Patel, Freelancer`,

      'Insurance Policy Renewal': `INSURANCE POLICY RENEWAL

Policy Number: INS-2026-BIZ-4472
Renewal Period: March 1, 2026 - February 28, 2027
Status: DRAFT - Pending Review

POLICYHOLDER
Company: TechCorp International, Inc.
Address: 500 Innovation Drive, Suite 200, San Francisco, CA 94105
Contact: Finance Department

COVERAGE SUMMARY

General Liability Insurance
  - Per Occurrence Limit: $2,000,000
  - Annual Aggregate: $5,000,000
  - Deductible: $5,000

Professional Liability (E&O)
  - Per Claim Limit: $3,000,000
  - Annual Aggregate: $5,000,000
  - Retroactive Date: January 1, 2020

Cyber Liability Insurance
  - Data Breach Coverage: $5,000,000
  - Business Interruption: $1,000,000
  - Forensic Investigation: $500,000
  - Notification Costs: $250,000

Workers Compensation
  - As required by California state law
  - Employer's Liability: $1,000,000

ANNUAL PREMIUM SUMMARY
General Liability: $12,400
Professional Liability: $18,750
Cyber Liability: $15,200
Workers Compensation: $8,900
Total Annual Premium: $55,250

TERMS AND CONDITIONS
Review all coverage limits and confirm acceptance before binding.

SIGNATURES:
_________________________         Date: ___________
Policyholder Authorized Signatory

_________________________         Date: ___________
Insurance Agent`,

      'Intellectual Property Assignment': `INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

Agreement Date: August 15, 2025
Status: VOIDED

ASSIGNOR: Kevin O'Brien
Address: 150 Innovation Way, Portland, OR 97201

ASSIGNEE: TechCorp International, Inc.
Address: 500 Innovation Drive, Suite 200, San Francisco, CA 94105
Contact: Rachel Kim, Legal Department

RECITALS
WHEREAS, the Assignor has developed certain intellectual property during
the course of a consulting engagement with the Assignee;

ASSIGNED INTELLECTUAL PROPERTY
1. Patent Application: "Distributed Cache Optimization Algorithm"
   - Application Number: US-2025-0089234
   - Filing Date: June 10, 2025

2. Software: CacheBoost Library v2.0
   - Source code, documentation, and related materials
   - All derivative works and improvements

3. Trade Secrets: Performance optimization methodologies
   - Benchmark data and analysis
   - Architecture design documents

CONSIDERATION
Total Assignment Fee: $75,000
Payment: Lump sum within 30 days of execution

REPRESENTATIONS AND WARRANTIES
Assignor represents that:
(a) Assignor is the sole owner of the IP
(b) IP does not infringe on any third-party rights
(c) There are no pending claims against the IP

NOTICE: This agreement has been VOIDED as of September 10, 2025
due to unresolved ownership disputes regarding Patent Application.

SIGNATURES:
_________________________         Date: ___________
Kevin O'Brien, Assignor

_________________________         Date: ___________
Rachel Kim, Assignee Representative`,
    };

    return templates[templateName] || templates['Employment Agreement'];
  }

  static generateHTMLDocument(templateName: string): string {
    const content = this.getDocumentContent(templateName);
    const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${templateName}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6;white-space:pre-wrap;}</style>
</head><body><h1>${templateName}</h1><pre>${content}</pre></body></html>`;
    return btoa(htmlContent);
  }

  static generateFallbackDocument(templateName: string): string {
    return btoa(this.getDocumentContent(templateName));
  }
}

export const validatePDFData = (data: string): boolean => {
  try {
    if (!data || data.length === 0) return false;
    let cleanData = data;
    if (data.includes('base64,')) cleanData = data.split('base64,')[1];
    const decoded = atob(cleanData);
    return decoded.startsWith('%PDF');
  } catch { return false; }
};

export const getDocumentContent = (templateName: string): { content: string; type: 'pdf' | 'html' | 'text' } => {
  try {
    const pdfContent = RobustPDFGenerator.generateValidSamplePDF(templateName);
    if (validatePDFData(pdfContent)) return { content: pdfContent, type: 'pdf' };
  } catch (error) { console.warn('PDF generation failed:', error); }

  try {
    return { content: RobustPDFGenerator.generateHTMLDocument(templateName), type: 'html' };
  } catch (error) { console.warn('HTML fallback failed:', error); }

  return { content: RobustPDFGenerator.generateFallbackDocument(templateName), type: 'text' };
};
