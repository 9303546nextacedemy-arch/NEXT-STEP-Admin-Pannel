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
  where
} from "firebase/firestore";
import { db } from "../lib/firebase";

const COLLECTION_NAME = "students";

export const studentService = {
  getAllStudents: async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  getAppRegistrations: async () => {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("registrationSource", "==", "app")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
      return tb - ta;
    });
  },

  addStudent: async (studentData) => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...studentData,
      isActive: studentData.isActive ?? true,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateStudent: async (studentId, studentData) => {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(docRef, {
      ...studentData,
      updatedAt: serverTimestamp()
    });
  },

  deleteStudent: async (studentId) => {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    await deleteDoc(docRef);
  }
};
