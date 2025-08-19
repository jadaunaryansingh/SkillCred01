import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, UserProfile } from "@/lib/firebaseUtils";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user ? user.uid : "null");
      setUser(user);
      
      if (user) {
        try {
          console.log("Fetching user profile for:", user.uid);
          const profile = await getUserProfile(user.uid);
          console.log("User profile fetched successfully:", profile);
          setUserProfile(profile);
        } catch (error: any) {
          console.warn("Could not fetch user profile from Firestore:", error?.message);
          console.error("Full error:", error);
          // Create a basic profile from user data if Firestore is not accessible
          const basicProfile = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || undefined,
            createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
            totalQuizzes: 0,
            totalAttempts: 0,
            averageScore: 0,
          };
          console.log("Setting basic profile:", basicProfile);
          setUserProfile(basicProfile);
        }
      } else {
        console.log("No user, clearing profile");
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const { signIn: firebaseSignIn } = await import("@/lib/firebaseUtils");
    return firebaseSignIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    const { signUp: firebaseSignUp } = await import("@/lib/firebaseUtils");
    return firebaseSignUp(email, password);
  };

  const signOut = async () => {
    const { signOut: firebaseSignOut } = await import("@/lib/firebaseUtils");
    const result = await firebaseSignOut();
    if (result.success) {
      setUser(null);
      setUserProfile(null);
    }
    return result;
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
