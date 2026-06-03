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

const COLLECTION_NAME = "liveClasses";

export const liveClassService = {
  getAllLiveClasses: async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  getLiveClassesByCourse: async (courseId) => {
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

  addLiveClass: async (classData) => {
    const payload = { ...classData };
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

    // Auto-send notification to the batch students
    if (payload.courseId) {
      try {
        await addDoc(collection(db, "notifications"), {
          title: `📅 Live Class Scheduled: ${payload.title || "New Class"}`,
          message: payload.subjectTitle 
            ? `${payload.subjectTitle}${payload.chapterTitle ? " — " + payload.chapterTitle : ""}`
            : "A new live class has been scheduled. Check the Live section for details!",
          type: "alert",
          targetType: "courses",
          targetCourseIds: [payload.courseId],
          meta: { deepLink: "/live", kind: "live", courseId: payload.courseId },
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Auto-notification for live class failed:", e);
      }
    }

    return docRef.id;
  },

  updateLiveClass: async (classId, classData) => {
    const patch = { ...classData };
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
    const docRef = doc(db, COLLECTION_NAME, classId);
    await updateDoc(docRef, {
      ...patch,
      updatedAt: serverTimestamp()
    });
  },

  deleteLiveClass: async (classId) => {
    const docRef = doc(db, COLLECTION_NAME, classId);
    await deleteDoc(docRef);
  }
};
