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
  orderBy,
  deleteField,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { notificationService } from "./notificationService";

const COLLECTION_NAME = "lectures";

function normalizeLiveVisibilityMinutes(raw) {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? "60").trim(), 10);
  if (!Number.isFinite(n) || n < 1) return 60;
  return Math.min(Math.floor(n), 10080);
}

function normalizeLectureDescription(data, { isUpdate } = {}) {
  const patch = { ...data };
  if (!Object.prototype.hasOwnProperty.call(patch, "description")) return patch;
  if (typeof patch.description !== "string") {
    delete patch.description;
    return patch;
  }
  const t = patch.description.trim();
  if (t) patch.description = t;
  else if (isUpdate) patch.description = deleteField();
  else delete patch.description;
  return patch;
}

export const lectureService = {
  getLecturesByCourse: async (courseId) => {
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

  addLecture: async (lectureData) => {
    const videoUrl =
      typeof lectureData.videoUrl === "string"
        ? lectureData.videoUrl.trim()
        : lectureData.videoUrl;
    const title =
      typeof lectureData.title === "string"
        ? lectureData.title.trim()
        : lectureData.title;
    let payload = normalizeLectureDescription({ ...lectureData, title, videoUrl });
    payload.isLive = !!payload.isLive;
    if (payload.isLive) {
      payload.liveScheduledAt = payload.liveScheduledAt ? new Date(payload.liveScheduledAt).toISOString() : "";
      payload.liveVisibilityMinutes = normalizeLiveVisibilityMinutes(payload.liveVisibilityMinutes);
    } else {
      delete payload.liveScheduledAt;
      delete payload.liveVisibilityMinutes;
    }
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
      kind: payload.isLive ? 'live' : 'lecture',
      title: payload.isLive ? 'Live lecture update' : 'New lecture uploaded',
      message: payload.isLive
        ? `${payload.liveScheduledAt ? 'A live lecture is scheduled' : 'A live lecture is now running'}: "${payload.title}"${payload.subjectTitle ? ` for ${payload.subjectTitle}` : ''}${payload.chapterTitle ? ` (${payload.chapterTitle})` : ''}.`
        : `A new lecture "${payload.title}" is now available${payload.subjectTitle ? ` in ${payload.subjectTitle}` : ''}${payload.chapterTitle ? ` (${payload.chapterTitle})` : ''}.`,
      courseId: payload.courseId,
      courseTitle: payload.courseTitle,
      subjectTitle: payload.subjectTitle,
      chapterTitle: payload.chapterTitle,
    });
    return docRef.id;
  },

  updateLecture: async (lectureId, lectureData) => {
    let patch = normalizeLectureDescription({ ...lectureData }, { isUpdate: true });
    delete patch.id;
    if (typeof patch.videoUrl === "string") patch.videoUrl = patch.videoUrl.trim();
    if (typeof patch.title === "string") patch.title = patch.title.trim();
    patch.isLive = !!patch.isLive;
    if (patch.isLive) {
      patch.liveScheduledAt = patch.liveScheduledAt ? new Date(patch.liveScheduledAt).toISOString() : "";
      patch.liveVisibilityMinutes = normalizeLiveVisibilityMinutes(patch.liveVisibilityMinutes);
    } else {
      patch.liveScheduledAt = deleteField();
      patch.liveVisibilityMinutes = deleteField();
    }
    if (Object.prototype.hasOwnProperty.call(patch, "chapterId")) {
      if (!patch.chapterId) {
        delete patch.chapterId;
        delete patch.chapterTitle;
      } else {
        patch.chapterTitle =
          typeof patch.chapterTitle === "string"
            ? patch.chapterTitle.trim()
            : patch.chapterTitle || "";
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
    const docRef = doc(db, COLLECTION_NAME, lectureId);
    await updateDoc(docRef, {
      ...patch,
      updatedAt: serverTimestamp()
    });
  },

  deleteLecture: async (lectureId) => {
    const docRef = doc(db, COLLECTION_NAME, lectureId);
    await deleteDoc(docRef);
  }
};
