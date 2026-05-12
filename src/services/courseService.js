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
import { normalizeSubjects, newSubjectId } from "../utils/courseSubjects";

const COLLECTION_NAME = "courses";

export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  getCourseById: async (courseId) => {
    const snap = await getDoc(doc(db, COLLECTION_NAME, courseId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  /** Append one subject to a course (used from lecture/notes/live forms). */
  appendSubjectToCourse: async (courseId, { title }) => {
    const t = String(title ?? "").trim();
    if (!courseId || !t) throw new Error("Course and subject title required");
    const ref = doc(db, COLLECTION_NAME, courseId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Course not found");
    const next = [...normalizeSubjects(snap.data().subjects), { id: newSubjectId(), title: t }];
    await updateDoc(ref, { subjects: next, updatedAt: serverTimestamp() });
    return next[next.length - 1];
  },

  // Add a new course
  addCourse: async (courseData) => {
    const subjects = normalizeSubjects(courseData.subjects);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...courseData,
      subjects,
      isActive: courseData.isActive ?? true,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update a course
  updateCourse: async (courseId, courseData) => {
    const docRef = doc(db, COLLECTION_NAME, courseId);
    const patch = { ...courseData };
    if (Object.prototype.hasOwnProperty.call(patch, "subjects")) {
      patch.subjects = normalizeSubjects(patch.subjects);
    }
    await updateDoc(docRef, {
      ...patch,
      updatedAt: serverTimestamp()
    });
  },

  // Delete a course
  deleteCourse: async (courseId) => {
    const docRef = doc(db, COLLECTION_NAME, courseId);
    await deleteDoc(docRef);
  }
};
