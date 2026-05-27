import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/** Vite: set VITE_FIREBASE_* on Vercel (or .env locally). Fallbacks match the default web app for this project. */
function env(name, fallback) {
  const v = import.meta.env[name];
  if (v == null || String(v).trim() === "") return fallback;
  return String(v).trim();
}

const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_API_KEY", "AIzaSyCUzsW6CM7s9KgGTn7ihdfHDnIhkjnQcvk"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN", "next-step-academy-5b9ab.firebaseapp.com"),
  projectId: env("VITE_FIREBASE_PROJECT_ID", "next-step-academy-5b9ab"),
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET", "next-step-academy-5b9ab.firebasestorage.app"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID", "546747081697"),
  appId: env("VITE_FIREBASE_APP_ID", "1:546747081697:web:6c3ba5a0cd2542631fa8a0"),
  measurementId: env("VITE_FIREBASE_MEASUREMENT_ID", "G-FP5Z6XRRSF"),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);

let authInitialized = false;
let authInitResolve = null;
const authInitPromise = new Promise((resolve) => {
  authInitResolve = resolve;
});

// Set up a one-time listener to resolve the initialization promise
const unsubscribeInit = onAuthStateChanged(auth, (user) => {
  authInitialized = true;
  if (authInitResolve) {
    authInitResolve(user);
  }
  unsubscribeInit();
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);

/** If no Firebase user yet, sign in anonymously (e.g. legacy flows) but only for client/landing page flows. When an admin is signed in with Google, that user is returned instead. */
export async function ensureFirebaseClientAuth() {
  // 1. Wait for Firebase to restore session from storage (if any)
  if (!authInitialized) {
    await authInitPromise;
  }

  // 2. If already logged in (Google admin or previous anonymous session), return it
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // 3. Detect if we are currently in Admin Panel mode
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isAdmin = searchParams && (searchParams.get('admin') === 'true' || 
    (searchParams.get('admin') !== 'false' && (
      hostname.startsWith('admin.') || 
      hostname.includes('admin-panel') || 
      hostname.includes('adminpannel') ||
      hostname.includes('admin.')
    )));

  if (isAdmin) {
    // Never sign in anonymously in admin panel mode
    return null;
  }

  // 4. Client landing page: authenticate anonymously to read/write reviews
  const cred = await signInAnonymously(auth);
  return cred.user;
}
export const storage = getStorage(app);

export default app;
