import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

const FILE_NAME = 'unitracker_sync.json';

async function getDriveFileId(token: string): Promise<string | null> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to find sync file in Drive');
  const data = await res.json();
  return data.files?.length > 0 ? data.files[0].id : null;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      lastSyncedAt: null,
      error: null,

      pushToCloud: async () => {
        const user = useAuthStore.getState().user;
        useAuthStore.getState();
        if (!user || user.googleAccessToken == null) {
          // Fallback to error if no token
          set({ status: 'error', error: 'Missing Google Drive permissions. Please sign out and sign back in.' });
          return;
        }

        const token = user.googleAccessToken;
        set({ status: 'pushing', error: null });

        try {
          const [applications, profile, events] = await Promise.all([
            applicationApi.getAll(),
            profileApi.get().catch(() => null),
            calendarApi.getEvents().catch(() => []),
          ]);

          const payload = JSON.stringify({
            applications,
            profile,
            events,
            syncedAt: new Date().toISOString(),
          });

          const fileId = await getDriveFileId(token);

          if (fileId) {
            // Update existing file
            const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: payload
            });
            if (!res.ok) throw new Error('Failed to update sync file');
          } else {
            // Create new file
            const metadata = { name: FILE_NAME, parents: ['appDataFolder'] };
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', new Blob([payload], { type: 'application/json' }));

            const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: form
            });
            if (!res.ok) throw new Error('Failed to create sync file');
          }

          const now = new Date().toISOString();
          set({ status: 'done', lastSyncedAt: now });

          setTimeout(() => {
            if (get().status === 'done') set({ status: 'idle' });
          }, 3000);
        } catch (err) {
          console.error('Push to cloud failed:', err);
          set({ status: 'error', error: 'Failed to sync to Google Drive. Token might be expired.' });
        }
      },

      pullFromCloud: async () => {
        const user = useAuthStore.getState().user;
        if (!user || !user.googleAccessToken) {
          set({ status: 'error', error: 'Missing Google Drive permissions.' });
          return;
        }

        const token = user.googleAccessToken;
        set({ status: 'pulling', error: null });

        try {
          const fileId = await getDriveFileId(token);
          if (!fileId) {
            set({ status: 'done', error: null });
            setTimeout(() => {
              if (get().status === 'done') set({ status: 'idle' });
            }, 3000);
            return;
          }

          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!res.ok) throw new Error('Failed to download sync file');
          
          const now = new Date().toISOString();
          set({ status: 'done', lastSyncedAt: now });

          setTimeout(() => {
            if (get().status === 'done') set({ status: 'idle' });
          }, 3000);
        } catch (err) {
          console.error('Pull from cloud failed:', err);
          set({ status: 'error', error: 'Failed to pull from Google Drive' });
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
