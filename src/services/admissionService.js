import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db, ensureFirebaseClientAuth } from "../lib/firebase";

const COLLECTION_NAME = "admissions";

export const admissionService = {
  // Get all admission requests (one-time fetch)
  getAllAdmissionRequests: async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Subscribe to all admission requests in real-time (for Admin Panel)
  subscribeAdmissionRequests: (onUpdate, onError) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(requests);
    }, onError);
  },

  // Submit a new admission request (from Landing Page)
  addAdmissionRequest: async (requestData) => {
    await ensureFirebaseClientAuth();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...requestData,
      status: 'pending', // defaults to pending
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update status (pending, contacted, enrolled, cancelled)
  updateAdmissionStatus: async (requestId, status) => {
    const docRef = doc(db, COLLECTION_NAME, requestId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  },

  // Delete an admission request permanently
  deleteAdmissionRequest: async (requestId) => {
    const docRef = doc(db, COLLECTION_NAME, requestId);
    await deleteDoc(docRef);
  }
};
