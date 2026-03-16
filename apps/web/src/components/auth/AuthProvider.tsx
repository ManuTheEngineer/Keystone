"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { onAuthChange, type UserProfile } from "@/lib/services/auth-service";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);

      // Clean up previous profile subscription
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (firebaseUser) {
        const profileRef = ref(db, `users/${firebaseUser.uid}/profile`);
        unsubProfile = onValue(profileRef, (snapshot) => {
          setProfile(snapshot.exists() ? snapshot.val() : null);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) {
        unsubProfile();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
