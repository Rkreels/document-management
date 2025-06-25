
// Configuration for hosting at different paths
export const getBasePath = () => {
  // For production, the base path is handled by Vite config
  return '';
};

export const getFullUrl = (path: string) => {
  const basePath = getBasePath();
  return `${basePath}${path.startsWith('/') ? '' : '/'}${path}`;
};

// DocuSign-like configuration
export const APP_CONFIG = {
  name: 'Document Management System',
  version: '1.0.0',
  features: {
    voiceAssistance: true,
    bulkOperations: true,
    advancedSecurity: true,
    templateLibrary: true,
    auditTrail: true,
    mobileSupport: true,
    apiIntegration: true,
    brandingCustomization: true
  },
  limits: {
    maxDocumentSize: 25 * 1024 * 1024, // 25MB
    maxSigners: 50,
    maxFields: 100,
    maxReminders: 10
  },
  hosting: {
    basePath: '/document-management',
    supportedPaths: [
      '/document-management',
      '/'
    ]
  }
};
