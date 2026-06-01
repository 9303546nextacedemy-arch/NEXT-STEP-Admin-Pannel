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
  },

  // Jitsi Settings
  async getJitsiSettings() {
    try {
      const docRef = doc(db, 'settings', 'jitsi');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      return { domain: 'meet.jit.si', appId: '', secret: '' };
    } catch (error) {
      console.error('Error fetching Jitsi settings:', error);
      return { domain: 'meet.jit.si', appId: '', secret: '' };
    }
  },

  async updateJitsiSettings(settings) {
    const docRef = doc(db, 'settings', 'jitsi');
    await setDoc(docRef, settings, { merge: true });
  },

  // YouTube Settings
  async getYoutubeSettings() {
    try {
      const docRef = doc(db, 'settings', 'youtube');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      return { clientId: '', clientSecret: '', gmail: '', refreshToken: '' };
    } catch (error) {
      console.error('Error fetching YouTube settings:', error);
      return { clientId: '', clientSecret: '', gmail: '', refreshToken: '' };
    }
  },

  async updateYoutubeSettings(settings) {
    const docRef = doc(db, 'settings', 'youtube');
    await setDoc(docRef, settings, { merge: true });
  }
};
