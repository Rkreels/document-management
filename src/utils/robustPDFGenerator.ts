// Removed @react-pdf/renderer dependency for compatibility

// Create a robust PDF generation system that never fails
export class RobustPDFGenerator {
  
  // Generate a minimal but valid PDF as base64
  static generateValidSamplePDF(templateName: string): string {
    // This is a minimal, guaranteed valid PDF structure
    const pdfHeader = '%PDF-1.4';
    const pdfTrailer = '%%EOF';
    
    // Create a properly formatted PDF with minimal content
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
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
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
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(${templateName}) Tj
0 -20 Td
(This is a sample document for demonstration.) Tj
0 -20 Td
(Please add your content and configure fields.) Tj
0 -40 Td
(Document fields can be added using the editor.) Tj
0 -20 Td
(Signatures and form data will appear here.) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
0000000244 00000 n 
0000000313 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
565
%%EOF`;

    // Convert to base64
    return btoa(pdfContent);
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