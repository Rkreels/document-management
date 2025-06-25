
// Configuration for hosting at different paths
export const getBasePath = () => {
  return '/document-management';
};

export const getFullUrl = (path: string) => {
  const basePath = getBasePath();
  // Remove leading slash from path if it exists to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath ? `${basePath}/${cleanPath}` : basePath;
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
