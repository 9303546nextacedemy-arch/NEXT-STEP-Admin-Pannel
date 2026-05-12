/** Only this Google account may use the admin panel. */
export const ALLOWED_ADMIN_EMAIL = '9303546nextacedemy@gmail.com';

export function isAllowedAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase() === ALLOWED_ADMIN_EMAIL.toLowerCase();
}
