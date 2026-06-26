import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, signOut } from "../lib/firebase.ts";

interface AppUser {
  id: number;
  uid: string;
  email: string;
  name: string;
  grade: string;
  interests: string;
  goals: string;
  country: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  portfolioUrl?: string;
  skills?: string;
  verificationBadges?: string;
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      // Sync user
      await fetch("/api/users/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      // Get user details
      const response = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAppUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch app user", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchAppUser(currentUser);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const logOut = async () => {
    await signOut();
  };

  const refreshAppUser = async () => {
    if (user) {
      await fetchAppUser(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, signIn, logOut, refreshAppUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
