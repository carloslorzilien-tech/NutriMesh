// src/context/AuthContext.tsx — Autenticación y perfil de usuario

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import type { AppUser } from '../lib/types';
import { DEMO_USERS } from '../lib/seedData';

interface AuthContextValue {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isDemo: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Credenciales demo — cuentas reales del piloto RD
const DEMO_CREDENTIALS: Record<string, string> = {
  'hotel.europa@nutrimesh.dev': 'demo1234',
  'barcelo@nutrimesh.dev':      'demo1234',
  'coordinador@bard.org.do':    'demo1234',
  'admin@nutrimesh.dev':        'demo1234',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const isDemo = !isFirebaseConfigured;

  useEffect(() => {
    if (isDemo) { setLoading(false); return; }
    if (!auth)  { setLoading(false); return; }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && db) {
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          if (snap.exists()) {
            setUser({ uid: fbUser.uid, email: fbUser.email ?? '', ...snap.data() } as AppUser);
          }
        } catch { /* sin datos en Firestore */ }
        setFirebaseUser(fbUser);
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return unsub;
  }, [isDemo]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      if (isDemo) {
        const expected = DEMO_CREDENTIALS[email.toLowerCase().trim()];
        if (!expected || expected !== password) throw new Error('Credenciales incorrectas');
        const demoUser = DEMO_USERS.find(u => u.email === email.toLowerCase().trim());
        if (!demoUser) throw new Error('Usuario no encontrado');
        setUser(demoUser);
      } else {
        if (!auth) throw new Error('Firebase no inicializado');
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (db) {
          const snap = await getDoc(doc(db, 'users', cred.user.uid));
          if (snap.exists()) {
            setUser({ uid: cred.user.uid, email: cred.user.email ?? '', ...snap.data() } as AppUser);
          }
        }
        setFirebaseUser(cred.user);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      const friendly = (msg.includes('wrong-password') || msg.includes('user-not-found') || msg.includes('invalid-credential'))
        ? 'Credenciales incorrectas'
        : msg;
      setError(friendly);
      throw new Error(friendly);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  const logout = useCallback(async () => {
    if (!isDemo && auth) await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  }, [isDemo]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isDemo, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
