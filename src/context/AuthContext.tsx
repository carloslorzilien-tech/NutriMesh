import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  onSnapshot,
} from 'firebase/firestore';
import type { AppUser } from '../lib/types';
import { IS_FIREBASE, firebaseAuth, db } from '../lib/firebase';
import { DEMO_USERS } from '../lib/demo';

interface AuthCtx {
  user: AppUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(!IS_FIREBASE);

  // ── Firebase mode ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!IS_FIREBASE || !firebaseAuth || !db) return;
    let unsubUser: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(firebaseAuth, (fbUser) => {
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }
      if (!fbUser) {
        setUser(null);
        setReady(true);
        return;
      }
      // Read users/{uid} from Firestore to get role + hotelId
      const ref = doc(db!, 'users', fbUser.uid);
      unsubUser = onSnapshot(ref, (snap) => {
        if (!snap.exists()) {
          setUser(null);
        } else {
          const d = snap.data() as Record<string, unknown>;
          setUser({
            uid:         fbUser.uid,
            email:       fbUser.email ?? '',
            role:        (d.role as AppUser['role']) ?? 'hotel',
            hotelId:     d.hotelId != null ? String(d.hotelId) : undefined,
            displayName: d.displayName != null ? String(d.displayName) : fbUser.displayName ?? '',
          });
        }
        setReady(true);
      });
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (IS_FIREBASE && firebaseAuth) {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } else {
      const found = DEMO_USERS.find(u => u.email === email);
      if (!found || password !== 'demo1234') {
        throw new Error('Credenciales incorrectas.');
      }
      setUser(found);
    }
  }, []);

  const logout = useCallback(async () => {
    if (IS_FIREBASE && firebaseAuth) {
      await signOut(firebaseAuth);
    } else {
      setUser(null);
    }
  }, []);

  return (
    <Ctx.Provider value={{ user, ready, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
