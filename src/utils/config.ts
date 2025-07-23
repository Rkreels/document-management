
export const getBasePath = (): string => {
  return '';
};

export const getFullUrl = (path: string): string => {
  const basePath = getBasePath();
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
};

export const getApiUrl = (endpoint: string): string => {
  const apiBase = process.env.VITE_API_URL || 'https://api.example.com';
  return `${apiBase}${endpoint}`;
};

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};
