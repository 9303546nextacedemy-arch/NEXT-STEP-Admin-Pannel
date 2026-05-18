/**
 * Helper utility to check if the current page should render the admin panel or the landing page.
 * It checks the hostname and search parameters.
 */
export const isSubdomainAdmin = () => {
  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  
  // 1. Allow explicit override via query parameter (e.g., ?admin=true or ?admin=false)
  if (searchParams.has('admin')) {
    return searchParams.get('admin') === 'true';
  }
  
  // 2. Subdomain check: if it starts with 'admin.' or contains admin patterns
  if (
    hostname.startsWith('admin.') || 
    hostname.includes('admin-panel') || 
    hostname.includes('adminpannel') ||
    hostname.includes('admin.')
  ) {
    return true;
  }
  
  // 3. Fallback: by default, the main domain opens the landing page website
  return false;
};

/**
 * Get the Admin URL based on current host
 */
export const getAdminUrl = () => {
  const protocol = window.location.protocol;
  const host = window.location.host;
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${host}/?admin=true`;
  }
  
  if (hostname.startsWith('www.')) {
    const cleanHost = host.replace(/^www\./, '');
    return `${protocol}//admin.${cleanHost}`;
  }
  
  if (!hostname.startsWith('admin.')) {
    return `${protocol}//admin.${host}`;
  }
  
  return `${protocol}//${host}`;
};

/**
 * Get the Main Website URL based on current host
 */
export const getMainWebsiteUrl = () => {
  const protocol = window.location.protocol;
  const host = window.location.host;
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${host}/?admin=false`;
  }
  
  if (hostname.startsWith('admin.')) {
    const cleanHost = host.replace(/^admin\./, '');
    return `${protocol}//${cleanHost}`;
  }
  
  return `${protocol}//${host}`;
};
