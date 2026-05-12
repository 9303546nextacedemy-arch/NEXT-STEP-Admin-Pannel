import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy 
} from "firebase/firestore";
import { db } from "../lib/firebase";

const COLLECTION_NAME = "projects";

export const projectService = {
  getAllProjects: async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  addProject: async (projectData) => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...projectData,
      isActive: projectData.isActive ?? true,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateProject: async (projectId, projectData) => {
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await updateDoc(docRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
  },

  deleteProject: async (projectId) => {
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await deleteDoc(docRef);
  }
};
