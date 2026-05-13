import { doc, getDoc, updateDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CONFIG_COLLECTION = 'admin_config';
const ADMINS_DOC = 'authorized_admins';
const APP_SETTINGS_DOC = 'app_settings';

export const adminSettingsService = {
  // Authorized Emails
  async getAuthorizedEmails() {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, ADMINS_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data().emails || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching authorized emails:', error);
      return [];
    }
  },

  async updateAuthorizedEmails(emails) {
    const docRef = doc(db, CONFIG_COLLECTION, ADMINS_DOC);
    await setDoc(docRef, { emails }, { merge: true });
  },

  // App Settings
  async getAppSettings() {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, APP_SETTINGS_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      return { maintenanceMode: false, demoMode: true };
    } catch (error) {
      console.error('Error fetching app settings:', error);
      return { maintenanceMode: false, demoMode: true };
    }
  },

  async updateAppSettings(settings) {
    const docRef = doc(db, CONFIG_COLLECTION, APP_SETTINGS_DOC);
    await setDoc(docRef, settings, { merge: true });
  }
};
