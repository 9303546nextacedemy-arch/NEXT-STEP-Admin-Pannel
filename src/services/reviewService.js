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

const COLLECTION_NAME = "reviews";

export const reviewService = {
  // Get all reviews for the admin panel
  getAllReviews: async () => {
    await ensureFirebaseClientAuth();
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Subscribe to all reviews in real-time (for Admin Panel / Counts)
  subscribeAllReviews: (onUpdate, onError) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(reviews);
    }, onError);
  },

  // Get only approved reviews for the landing page
  getApprovedReviews: async () => {
    await ensureFirebaseClientAuth();
    // To prevent Firestore composite index requirements on dynamic filters + sorting,
    // we fetch all and filter approved ones in memory.
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(review => review.status === 'approved');
  },

  // Subscribe to approved reviews in real-time
  subscribeApprovedReviews: async (onUpdate, onError) => {
    await ensureFirebaseClientAuth();
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
      const reviews = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(review => review.status === 'approved');
      onUpdate(reviews);
    }, onError);
  },

  // Add a new review (defaults to pending approval)
  addReview: async (reviewData) => {
    await ensureFirebaseClientAuth();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...reviewData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update status (approved, rejected, pending)
  updateReviewStatus: async (reviewId, status) => {
    const docRef = doc(db, COLLECTION_NAME, reviewId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  },

  // Delete review permanently
  deleteReview: async (reviewId) => {
    const docRef = doc(db, COLLECTION_NAME, reviewId);
    await deleteDoc(docRef);
  }
};
