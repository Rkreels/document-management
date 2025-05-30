
import React, { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';
import { useDocument } from '@/contexts/DocumentContext';

export const SmartVoiceGuide: React.FC = () => {
  const location = useLocation();
  const { speak, settings } = useVoice();
  const { documents, templates } = useDocument();

  const provideContextualGuidance = useCallback(() => {
    if (!settings.enabled) return;

    const path = location.pathname;
    
    // Dashboard guidance
    if (path === '/dashboard') {
      const documentCount = documents.length;
      const draftCount = documents.filter(doc => doc.status === 'draft').length;
      const pendingCount = documents.filter(doc => doc.status === 'sent').length;
      
      if (documentCount === 0) {
        speak("Welcome to your dashboard! You don't have any documents yet. I recommend starting by uploading a PDF document or creating one from a template. Would you like me to guide you through the process?", 'normal');
      } else if (draftCount > 0) {
        speak(`You have ${draftCount} draft document${draftCount > 1 ? 's' : ''} that need attention. Consider adding signature fields and sending them for signing to complete the process.`, 'normal');
      } else if (pendingCount > 0) {
        speak(`Great! You have ${pendingCount} document${pendingCount > 1 ? 's' : ''} currently out for signing. You can track their progress from here.`, 'normal');
      } else {
        speak(`Your dashboard shows ${documentCount} document${documentCount > 1 ? 's' : ''}. All appear to be completed - excellent work! You can create new documents or manage existing ones.`, 'normal');
      }
    }
    
    // Document Editor guidance
    else if (path.includes('/editor/')) {
      setTimeout(() => {
        speak("You're now in the document editor. First, add signature and text fields where signers need to interact. Then add signers and assign fields to them. Finally, preview and send the document for signing.", 'normal');
      }, 1500);
    }
    
    // Templates guidance
    else if (path === '/templates') {
      if (templates.length === 0) {
        speak("Templates help you create documents faster by reusing common layouts. Start by creating your first template, or use one of our pre-made templates for common document types.", 'normal');
      } else {
        speak(`You have ${templates.length} template${templates.length > 1 ? 's' : ''} available. You can create new documents from these templates, edit existing templates, or create new ones.`, 'normal');
      }
    }
    
    // Document Preview guidance
    else if (path.includes('/preview/')) {
      const currentDoc = documents.find(doc => path.includes(doc.id));
      if (currentDoc) {
        const fieldCount = currentDoc.fields.length;
        const signerCount = currentDoc.signers.length;
        
        if (currentDoc.status === 'draft') {
          speak(`This document has ${fieldCount} field${fieldCount !== 1 ? 's' : ''} and ${signerCount} signer${signerCount !== 1 ? 's' : ''}. Review the document carefully, then send it for signing when you're ready. You can also test the signing experience using the signing mode.`, 'normal');
        } else {
          speak(`This document is ${currentDoc.status}. You can view its current status and track signing progress here.`, 'normal');
        }
      }
    }
    
    // Voice Training guidance
    else if (path === '/voice-training') {
      speak("Welcome to voice training! These interactive lessons will help you master all voice-guided features. Start with the basics and work your way up to advanced techniques.", 'normal');
    }
    
    // Settings guidance
    else if (path === '/settings') {
      speak("Here you can customize your voice assistant settings. Adjust speech rate, volume, and enable advanced features like detailed guidance and training mode.", 'normal');
    }
  }, [location.pathname, speak, settings.enabled, documents, templates]);

  const provideActionGuidance = useCallback((action: string, context?: any) => {
    if (!settings.enabled) return;

    switch (action) {
      case 'document-ready-to-send':
        speak("Your document looks ready! You have fields and signers configured. I recommend sending it for signing now. Click the 'Send for Signing' button to proceed.", 'high');
        break;
        
      case 'empty-document':
        speak("This document doesn't have any fields yet. Add signature fields, text fields, or other interactive elements before sending it for signing.", 'normal');
        break;
        
      case 'missing-signers':
        speak("You've added fields but no signers. Add at least one signer and assign fields to them before sending the document.", 'normal');
        break;
        
      case 'field-added':
        speak(`${context?.fieldType || 'Field'} added successfully! Position it where signers need to interact. You can drag to reposition or resize as needed.`, 'normal');
        break;
        
      case 'signer-added':
        speak(`Signer ${context?.signerName || ''} added successfully! Now assign fields to this signer so they know what to complete.`, 'normal');
        break;
        
      case 'document-sent':
        speak("Excellent! Your document has been sent for signing. All signers will receive email notifications with secure signing links. You can track progress from your dashboard.", 'high');
        break;
        
      case 'template-created':
        speak("Template created successfully! You can now use this template to quickly create similar documents in the future.", 'normal');
        break;
    }
  }, [speak, settings.enabled]);

  // Provide guidance when location changes
  useEffect(() => {
    const timer = setTimeout(provideContextualGuidance, 1000);
    return () => clearTimeout(timer);
  }, [provideContextualGuidance]);

  // Make the guidance function available globally
  useEffect(() => {
    (window as any).voiceGuide = {
      provideActionGuidance,
      provideContextualGuidance
    };
  }, [provideActionGuidance, provideContextualGuidance]);

  return null; // This component doesn't render anything
};
