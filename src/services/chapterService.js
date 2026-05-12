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
} from "firebase/firestore";
import { db, ensureFirebaseClientAuth } from "../lib/firebase";

const COLLECTION_NAME = "chapters";

export const chapterService = {
  /**
   * @param {string} courseId
   * @param {string|null|undefined} subjectScope - `undefined`: all chapters. `null`/empty: chapters with no subjectId (legacy). string: that subjectId only.
   */
  getChaptersByCourse: async (courseId, subjectScope = undefined) => {
    if (!courseId) return [];
    await ensureFirebaseClientAuth();
    const q = query(
      collection(db, COLLECTION_NAME),
      where("courseId", "==", courseId)
    );
    const snap = await getDocs(q);
    let list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (subjectScope === undefined) return list;
    const sid = String(subjectScope ?? "").trim();
    if (!sid) return list.filter((c) => !c.subjectId);
    return list.filter((c) => c.subjectId === sid);
  },

  addChapter: async ({ courseId, title, subjectId, subjectTitle }) => {
    const t = String(title ?? "").trim();
    if (!courseId || !t) throw new Error("Course and chapter title required");
    await ensureFirebaseClientAuth();
    const snap = await getDocs(
      query(collection(db, COLLECTION_NAME), where("courseId", "==", courseId))
    );
    const sid = String(subjectId ?? "").trim();
    let maxOrder = 0;
    snap.docs.forEach((d) => {
      const data = d.data();
      if (sid) {
        if (data.subjectId !== sid) return;
      } else if (data.subjectId) {
        return;
      }
      const o = data.order;
      if (typeof o === "number" && o > maxOrder) maxOrder = o;
    });
    const payload = {
      courseId,
      title: t,
      order: maxOrder + 1,
      createdAt: serverTimestamp(),
    };
    if (sid) {
      payload.subjectId = sid;
      payload.subjectTitle = String(subjectTitle ?? "").trim() || sid;
    }
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return docRef.id;
  },

  updateChapter: async (chapterId, { title }) => {
    const t = String(title ?? "").trim();
    if (!t) throw new Error("Title required");
    await ensureFirebaseClientAuth();
    await updateDoc(doc(db, COLLECTION_NAME, chapterId), {
      title: t,
      updatedAt: serverTimestamp(),
    });
  },

  deleteChapter: async (chapterId) => {
    await ensureFirebaseClientAuth();
    await deleteDoc(doc(db, COLLECTION_NAME, chapterId));
  },
};
