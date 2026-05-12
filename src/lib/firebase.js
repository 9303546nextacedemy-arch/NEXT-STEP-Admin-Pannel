import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInAnonymously } from "firebase/auth";
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

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);

/** If no Firebase user yet, sign in anonymously (e.g. legacy flows). When an admin is signed in with Google, that user is returned instead. Firestore rules must allow that admin (or anonymous) to read/write as needed. */
export async function ensureFirebaseClientAuth() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}
export const storage = getStorage(app);

export default app;
