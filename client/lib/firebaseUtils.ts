import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User 
} from "firebase/auth";
import { auth, db } from "./firebase";
import { QuizQuestion } from "@shared/api";

// Types for Firebase data
export interface SavedQuiz {
  id?: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  isPublic: boolean;
  tags: string[];
}

export interface QuizAttempt {
  id?: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  answers: {
    questionId: number;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
  completedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
}

// Authentication functions
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await createUserProfile(user);
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// User profile functions
export const createUserProfile = async (user: User) => {
  try {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      createdAt: Timestamp.now(),
      totalQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
    };

    await setDoc(doc(db, "users", user.uid), userProfile);
    return userProfile;
  } catch (error: any) {
    console.warn("Could not create user profile in Firestore. Check security rules.");
    // Return a basic profile even if Firestore write fails
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      createdAt: Timestamp.now(),
      totalQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
    };
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    console.warn("Firestore access denied. Ensure security rules allow authenticated users to read their profiles.");
    throw error;
  }
};

// Quiz management functions
export const saveQuiz = async (quiz: Omit<SavedQuiz, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), {
      ...quiz,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserQuizzes = async (userId: string): Promise<SavedQuiz[]> => {
  const q = query(
    collection(db, "quizzes"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const quizzes: SavedQuiz[] = [];
  
  querySnapshot.forEach((doc) => {
    quizzes.push({ id: doc.id, ...doc.data() } as SavedQuiz);
  });
  
  return quizzes;
};

export const getPublicQuizzes = async (): Promise<SavedQuiz[]> => {
  const q = query(
    collection(db, "quizzes"),
    where("isPublic", "==", true),
    orderBy("updatedAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const quizzes: SavedQuiz[] = [];
  
  querySnapshot.forEach((doc) => {
    quizzes.push({ id: doc.id, ...doc.data() } as SavedQuiz);
  });
  
  return quizzes;
};

export const getQuizById = async (quizId: string): Promise<SavedQuiz | null> => {
  const docRef = doc(db, "quizzes", quizId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as SavedQuiz;
  }
  return null;
};

export const updateQuiz = async (quizId: string, updates: Partial<SavedQuiz>) => {
  try {
    await updateDoc(doc(db, "quizzes", quizId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteQuiz = async (quizId: string) => {
  try {
    await deleteDoc(doc(db, "quizzes", quizId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Quiz attempt functions
export const saveQuizAttempt = async (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, "quizAttempts"), {
      ...attempt,
      completedAt: Timestamp.now(),
    });
    
    // Update user stats
    await updateUserStats(attempt.userId, attempt.score, attempt.totalQuestions);
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserAttempts = async (userId: string): Promise<QuizAttempt[]> => {
  const q = query(
    collection(db, "quizAttempts"),
    where("userId", "==", userId),
    orderBy("completedAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const attempts: QuizAttempt[] = [];
  
  querySnapshot.forEach((doc) => {
    attempts.push({ id: doc.id, ...doc.data() } as QuizAttempt);
  });
  
  return attempts;
};

const updateUserStats = async (userId: string, score: number, totalQuestions: number) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data() as UserProfile;
    const newTotalAttempts = userData.totalAttempts + 1;
    const newAverageScore = ((userData.averageScore * userData.totalAttempts) + (score / totalQuestions * 100)) / newTotalAttempts;
    
    await updateDoc(userRef, {
      totalAttempts: newTotalAttempts,
      averageScore: Math.round(newAverageScore * 100) / 100,
    });
  }
};
