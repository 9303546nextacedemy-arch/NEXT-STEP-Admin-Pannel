import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  where,
  orderBy 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { notificationService } from "./notificationService";

const COLLECTION_NAME = "notes";

export const notesService = {
  getNotesByCourse: async (courseId) => {
    let q;
    if (courseId && courseId !== 'all') {
      q = query(
        collection(db, COLLECTION_NAME), 
        where("courseId", "==", courseId)
      );
    } else {
      q = query(
        collection(db, COLLECTION_NAME), 
        orderBy("createdAt", "desc")
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  addNotes: async (notesData) => {
    const payload = { ...notesData };
    if (!payload.chapterId) {
      delete payload.chapterId;
      delete payload.chapterTitle;
    } else {
      payload.chapterTitle =
        typeof payload.chapterTitle === "string"
          ? payload.chapterTitle.trim()
          : payload.chapterTitle || "";
    }
    if (!payload.subjectId) {
      delete payload.subjectId;
      delete payload.subjectTitle;
    } else {
      payload.subjectTitle =
        typeof payload.subjectTitle === "string"
          ? payload.subjectTitle.trim()
          : payload.subjectTitle || "";
    }
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...payload,
      createdAt: serverTimestamp()
    });
    await notificationService.sendMaterialNotification({
      kind: 'notes',
      title: 'New notes uploaded',
      message: `New notes "${payload.title}" are available${payload.subjectTitle ? ` in ${payload.subjectTitle}` : ''}${payload.chapterTitle ? ` (${payload.chapterTitle})` : ''}.`,
      courseId: payload.courseId,
      courseTitle: payload.courseTitle,
      subjectTitle: payload.subjectTitle,
      chapterTitle: payload.chapterTitle,
    });
    return docRef.id;
  },

  updateNotes: async (notesId, notesData) => {
    const patch = { ...notesData };
    delete patch.id;
    if (Object.prototype.hasOwnProperty.call(patch, "chapterId")) {
      if (!patch.chapterId) {
        delete patch.chapterId;
        delete patch.chapterTitle;
      } else if (typeof patch.chapterTitle === "string") {
        patch.chapterTitle = patch.chapterTitle.trim();
      }
    }
    if (Object.prototype.hasOwnProperty.call(patch, "subjectId")) {
      if (!patch.subjectId) {
        delete patch.subjectId;
        delete patch.subjectTitle;
      } else if (typeof patch.subjectTitle === "string") {
        patch.subjectTitle = patch.subjectTitle.trim();
      }
    }
    const docRef = doc(db, COLLECTION_NAME, notesId);
    await updateDoc(docRef, {
      ...patch,
      updatedAt: serverTimestamp()
    });
  },

  deleteNotes: async (notesId) => {
    const docRef = doc(db, COLLECTION_NAME, notesId);
    await deleteDoc(docRef);
  }
};
