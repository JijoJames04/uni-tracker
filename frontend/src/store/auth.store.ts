import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLocalMode: boolean;
  setUser: (user: AuthUser | null) => void;
  setLocalMode: (local: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLocalMode: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLocalMode: (isLocalMode) => set({ isLocalMode }),
      signOut: () => set({ user: null, isAuthenticated: false, isLocalMode: false }),
    }),
    { name: 'uni-tracker-auth' },
  ),
);
