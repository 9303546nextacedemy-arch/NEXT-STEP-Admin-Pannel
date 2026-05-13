import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/** These Google accounts are hardcoded super-admins for emergency access. */
export const SUPER_ADMIN_EMAILS = [
  '9303546nextacedemy@gmail.com',
  '97487787lecnextstepyt@gmail.com'
];

export async function isAllowedAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.trim().toLowerCase();
  
  // 1. Check super admins
  if (SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === lower)) return true;

  // 2. Check Firestore
  try {
    const docRef = doc(db, 'admin_config', 'authorized_admins');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const emails = snap.data().emails || [];
      return emails.some(e => e.toLowerCase() === lower);
    }
  } catch (error) {
    console.error('Error checking admin auth in firestore:', error);
  }

  return false;
}
