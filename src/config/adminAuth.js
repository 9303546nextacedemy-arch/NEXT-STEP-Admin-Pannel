/** These Google accounts may use the admin panel. */
export const ALLOWED_ADMIN_EMAILS = [
  '9303546nextacedemy@gmail.com',
  '97487787lecnextstepyt@gmail.com'
];

export function isAllowedAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.trim().toLowerCase();
  return ALLOWED_ADMIN_EMAILS.some(e => e.toLowerCase() === lower);
}
