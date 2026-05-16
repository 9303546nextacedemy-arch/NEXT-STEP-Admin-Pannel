import raw from '../../shared/legalContent.json';

export const legalMeta = raw;

/** Production domain for Google Play & public legal pages */
export const DEFAULT_LEGAL_PUBLIC_URL = 'https://nextstepacademy.online';

export function getLegalPublicBaseUrl() {
  const fromEnv = import.meta.env.VITE_LEGAL_PUBLIC_URL;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/+$/, '');
  }
  return DEFAULT_LEGAL_PUBLIC_URL;
}

export function getLegalUrls() {
  const base = getLegalPublicBaseUrl();
  return {
    home: `${base}/legal`,
    terms: `${base}/legal/terms`,
    privacy: `${base}/legal/privacy`,
  };
}
