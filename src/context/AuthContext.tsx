import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../lib/types';

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string;
}

const DEMO_USERS: User[] = [
  { uid: 'u1', email: 'hotel.europa@nutrimesh.dev', role: 'hotel', hotelId: 'h1', displayName: 'Gran Hotel Europa' },
  { uid: 'u2', email: 'barcelo@nutrimesh.dev',       role: 'hotel', hotelId: 'h2', displayName: 'Barceló Santo Domingo' },
  { uid: 'u3', email: 'coordinador@bard.org.do',     role: 'bank',  displayName: 'BARD' },
];

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  const login = useCallback(async (email: string, password: string) => {
    setError('');
    const found = DEMO_USERS.find(u => u.email === email);
    if (!found || password !== 'demo1234') {
      throw new Error('Invalid credentials');
    }
    setUser(found);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return <Ctx.Provider value={{ user, login, logout, error }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
