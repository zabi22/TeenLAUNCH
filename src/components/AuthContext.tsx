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
  username?: string;
  age?: number;
  totalXp?: number;
  onboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  isOfflineMode: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const fetchAppUser = async (firebaseUser: User, retries = 5, delay = 1000): Promise<void> => {
    try {
      const token = await firebaseUser.getIdToken();
      // Sync user
      const syncRes = await fetch("/api/users/sync", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({})
      });

      if (!syncRes.ok) {
        throw new Error(`Sync user endpoint returned status: ${syncRes.status}`);
      }

      // Get user details
      const response = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAppUser(data);
        setIsOfflineMode(false);
        // Cache user data for offline resilience
        localStorage.setItem("cached_app_user", JSON.stringify(data));
      } else {
        throw new Error(`Fetch user details returned status: ${response.status}`);
      }
    } catch (err: any) {
      console.warn(`Failed to fetch app user, retries remaining: ${retries}. Error: ${err?.message || err}`);
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchAppUser(firebaseUser, retries - 1, delay * 1.5);
      }
      console.error("All retries exhausted. Switching to degraded Read-Only mode.", err);
      
      // Load from cache if available
      const cached = localStorage.getItem("cached_app_user");
      if (cached) {
        try {
          setAppUser(JSON.parse(cached));
          setIsOfflineMode(true);
        } catch (e) {
          // parse error
        }
      } else {
        // Fallback local mock to prevent UI crash in extreme conditions
        setAppUser({
          id: 123,
          uid: firebaseUser.uid,
          email: firebaseUser.email || "user@teenlaunch.com",
          name: firebaseUser.displayName || "Alex Johnson",
          grade: "11th Grade",
          interests: "STEM, Entrepreneurship",
          goals: "Founding a non-profit, Ivy League",
          country: "United States",
          avatarUrl: firebaseUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
        });
        setIsOfflineMode(true);
      }
    }
  };

  useEffect(() => {
    const isDemoMode = localStorage.getItem("demo_mode") === "true";
    if (isDemoMode) {
      const demoUser = {
        uid: "demo-user-123",
        email: "demo@teenlaunch.com",
        displayName: "Alex Johnson",
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
        getIdToken: async () => "demo-token",
      };
      setUser(demoUser as any);
      fetchAppUser(demoUser as any).finally(() => {
        setLoading(false);
      });
    } else {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (localStorage.getItem("demo_mode") === "true") return;
        setUser(currentUser);
        if (currentUser) {
          await fetchAppUser(currentUser);
        } else {
          setAppUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  const signInAsDemo = async () => {
    localStorage.setItem("demo_mode", "true");
    const demoUser = {
      uid: "demo-user-123",
      email: "demo@teenlaunch.com",
      displayName: "Alex Johnson",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
      getIdToken: async () => "demo-token",
    };
    setUser(demoUser as any);
    await fetchAppUser(demoUser as any);
  };

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn("Google Sign-In failed or was blocked, logging in as Demo User:", err?.message || err);
      await signInAsDemo();
    }
  };

  const logOut = async () => {
    if (localStorage.getItem("demo_mode") === "true") {
      localStorage.removeItem("demo_mode");
      setUser(null);
      setAppUser(null);
    } else {
      await signOut();
    }
  };

  const refreshAppUser = async () => {
    if (user) {
      await fetchAppUser(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, isOfflineMode, signIn, logOut, refreshAppUser }}>
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
