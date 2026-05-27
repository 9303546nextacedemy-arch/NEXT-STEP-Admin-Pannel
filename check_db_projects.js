import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUzsW6CM7s9KgGTn7ihdfHDnIhkjnQcvk",
  authDomain: "next-step-academy-5b9ab.firebaseapp.com",
  projectId: "next-step-academy-5b9ab",
  storageBucket: "next-step-academy-5b9ab.firebasestorage.app",
  messagingSenderId: "546747081697",
  appId: "1:546747081697:web:6c3ba5a0cd2542631fa8a0",
  measurementId: "G-FP5Z6XRRSF",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProjects() {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`ID: ${doc.id}, Title: ${data.title}`);
      console.log(`- createdAt: ${data.createdAt ? (data.createdAt.seconds || data.createdAt) : 'MISSING'}`);
      console.log(`- isActive: ${data.isActive}`);
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

checkProjects();
