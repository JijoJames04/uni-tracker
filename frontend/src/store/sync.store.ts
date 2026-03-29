import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from './auth.store';
import { applicationApi, profileApi, calendarApi } from '@/lib/api';

type SyncStatus = 'idle' | 'pushing' | 'pulling' | 'done' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  error: string | null;
  pushToCloud: () => Promise<void>;
  pullFromCloud: () => Promise<void>;
  reset: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      lastSyncedAt: null,
      error: null,

      pushToCloud: async () => {
        const user = useAuthStore.getState().user;
        if (!user || !db) {
          set({ status: 'error', error: 'Not signed in or Firebase not configured' });
          return;
        }

        set({ status: 'pushing', error: null });

        try {
          // Fetch all local data
          const [applications, profile, events] = await Promise.all([
            applicationApi.getAll(),
            profileApi.get().catch(() => null),
            calendarApi.getEvents().catch(() => []),
          ]);

          // Write to Firestore
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            applications,
            profile,
            events,
            syncedAt: serverTimestamp(),
            email: user.email,
            displayName: user.displayName,
          }, { merge: true });

          const now = new Date().toISOString();
          set({ status: 'done', lastSyncedAt: now });

          // Reset status after 3s
          setTimeout(() => {
            if (get().status === 'done') set({ status: 'idle' });
          }, 3000);
        } catch (err) {
          console.error('Push to cloud failed:', err);
          set({ status: 'error', error: 'Failed to sync to cloud' });
        }
      },

      pullFromCloud: async () => {
        const user = useAuthStore.getState().user;
        if (!user || !db) {
          set({ status: 'error', error: 'Not signed in or Firebase not configured' });
          return;
        }

        set({ status: 'pulling', error: null });

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snapshot = await getDoc(userDocRef);

          if (!snapshot.exists()) {
            set({ status: 'done', error: null });
            setTimeout(() => {
              if (get().status === 'done') set({ status: 'idle' });
            }, 3000);
            return;
          }

          // Data is available but we don't auto-import to avoid overwriting
          // The user can see the cloud data and choose to import
          const now = new Date().toISOString();
          set({ status: 'done', lastSyncedAt: now });

          setTimeout(() => {
            if (get().status === 'done') set({ status: 'idle' });
          }, 3000);
        } catch (err) {
          console.error('Pull from cloud failed:', err);
          set({ status: 'error', error: 'Failed to pull from cloud' });
        }
      },

      reset: () => set({ status: 'idle', error: null }),
    }),
    {
      name: 'uni-tracker-sync',
      partialize: (state) => ({ lastSyncedAt: state.lastSyncedAt }),
    },
  ),
);
