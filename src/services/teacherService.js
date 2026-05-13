import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const COLLECTION_NAME = "teachers";

export const teacherService = {
  // Get all teachers
  getAllTeachers: async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  getTeacherById: async (teacherId) => {
    const snap = await getDoc(doc(db, COLLECTION_NAME, teacherId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  // Add a new teacher
  addTeacher: async (teacherData) => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...teacherData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update a teacher
  updateTeacher: async (teacherId, teacherData) => {
    const docRef = doc(db, COLLECTION_NAME, teacherId);
    await updateDoc(docRef, {
      ...teacherData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete a teacher
  deleteTeacher: async (teacherId) => {
    const docRef = doc(db, COLLECTION_NAME, teacherId);
    await deleteDoc(docRef);
  }
};
