import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCUzsW6CM7s9KgGTn7ihdfHDnIhkjnQcvk",
  authDomain: "next-step-academy-5b9ab.firebaseapp.com",
  projectId: "next-step-academy-5b9ab",
  storageBucket: "next-step-academy-5b9ab.firebasestorage.app",
  messagingSenderId: "546747081697",
  appId: "1:546747081697:web:6c3ba5a0cd2542631fa8a0",
  measurementId: "G-FP5Z6XRRSF"
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
