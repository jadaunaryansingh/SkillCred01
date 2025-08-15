// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC11pLkbwWuurTTHrsHq_82Xi-iBCV91Ho",
  authDomain: "quizmaker-8ecad.firebaseapp.com",
  projectId: "quizmaker-8ecad",
  storageBucket: "quizmaker-8ecad.firebasestorage.app",
  messagingSenderId: "66210053262",
  appId: "1:66210053262:web:15729c49ba507315b15ddf",
  measurementId: "G-CK2T12V7TE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
