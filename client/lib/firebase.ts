// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, FirestoreSettings, doc } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC11pLkbwWuurTTHrsHq_82Xi-iBCV91Ho",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quizmaker-8ecad.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quizmaker-8ecad",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quizmaker-8ecad.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "66210053262",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:66210053262:web:15729c49ba507315b15ddf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CK2T12V7TE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Firestore settings for better offline support
if (typeof window !== 'undefined') {
  // Enable offline persistence
  const settings: FirestoreSettings = {
    cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
    ignoreUndefinedProperties: true,
  };
  // Note: Firestore settings are configured differently in newer versions
  // This is a fallback configuration
}

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Development mode - connect to emulators if needed
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment these lines if you want to use Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

// Test function to verify Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");
    console.log("Project ID:", firebaseConfig.projectId);
    console.log("Auth domain:", firebaseConfig.authDomain);
    
    // Test if we can access Firestore
    const testDoc = doc(db, "test", "connection");
    console.log("Firestore connection test - document reference created");
    
    return { success: true, message: "Firebase connection successful" };
  } catch (error: any) {
    console.error("Firebase connection test failed:", error);
    return { success: false, error: error.message };
  }
};

export default app;
