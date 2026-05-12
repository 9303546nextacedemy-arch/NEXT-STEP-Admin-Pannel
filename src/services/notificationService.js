import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const COLLECTION_NAME = 'notifications';

const clean = (v) => String(v || '').trim();

export const notificationService = {
  // Send a new notification
  sendNotification: async (notificationData) => {
    try {
      const targetCourseIds = Array.isArray(notificationData.targetCourseIds)
        ? notificationData.targetCourseIds.filter(Boolean)
        : [];
      const callerMeta =
        notificationData.meta && typeof notificationData.meta === "object"
          ? { ...notificationData.meta }
          : {};
      const deepRaw = clean(notificationData.deepLink || callerMeta.deepLink);
      callerMeta.deepLink = deepRaw
        ? deepRaw.startsWith("/")
          ? deepRaw
          : `/${deepRaw}`
        : "/notifications";

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        title: clean(notificationData.title),
        message: clean(notificationData.message),
        type: notificationData.type || 'info',
        targetType: targetCourseIds.length > 0 ? 'courses' : 'all',
        targetCourseIds,
        meta: callerMeta,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error sending notification: ", error);
      throw error;
    }
  },

  // Get all notifications (optional, if we want a history page)
  getAllNotifications: async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting notifications: ", error);
      throw error;
    }
  },

  sendMaterialNotification: async ({
    kind,
    title,
    message,
    courseId,
    courseTitle,
    subjectTitle,
    chapterTitle,
  }) => {
    return notificationService.sendNotification({
      title,
      message,
      type: kind === 'live' ? 'alert' : 'info',
      targetCourseIds: courseId ? [courseId] : [],
      meta: {
        kind,
        courseId: courseId || '',
        courseTitle: clean(courseTitle),
        subjectTitle: clean(subjectTitle),
        chapterTitle: clean(chapterTitle),
        deepLink: '/notifications',
      },
    });
  }
};
