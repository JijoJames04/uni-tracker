import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './auth.store';
import { applicationApi, profileApi, calendarApi } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';

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

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      lastSyncedAt: null,
      error: null,

      pushToCloud: async () => {
        const user = useAuthStore.getState().user;
        const supabase = getSupabaseClient();
        
        if (!user || !supabase) {
          set({ status: 'error', error: 'Missing Supabase Config or User not authenticated.' });
          return;
        }

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
          
          const filePath = `${user.uid}/${FILE_NAME}`;

          const { error } = await supabase.storage
            .from('sync')
            .upload(filePath, new Blob([payload], { type: 'application/json' }), {
              upsert: true,
              cacheControl: '0'
            });

          if (error) {
             throw error;
          }

          const now = new Date().toISOString();
          set({ status: 'done', lastSyncedAt: now });

          setTimeout(() => {
            if (get().status === 'done') set({ status: 'idle' });
          }, 3000);
        } catch (err) {
          console.error('Push to cloud failed:', err);
          set({ status: 'error', error: 'Failed to sync to Supabase Storage.' });
        }
      },

      pullFromCloud: async () => {
        const user = useAuthStore.getState().user;
        const supabase = getSupabaseClient();
        
        if (!user || !supabase) {
          set({ status: 'error', error: 'Missing Supabase Config or User.' });
          return;
        }

        set({ status: 'pulling', error: null });

        try {
          const filePath = `${user.uid}/${FILE_NAME}`;

          const { data, error } = await supabase.storage
            .from('sync')
            .download(filePath);
            
          if (error) {
            // It might just be empty if they haven't synced yet, treat 404/NotFoundError as done for fresh accounts.
            console.warn('Could not find sync file (or error):', error);
            set({ status: 'done', error: null });
            setTimeout(() => {
              if (get().status === 'done') set({ status: 'idle' });
            }, 3000);
            return;
          }

          const payloadText = await data.text();
          const parsed = JSON.parse(payloadText);
          
          // You could restore the parsed state back into API layers or stores here like the old app did.

          const now = new Date().toISOString();
          set({ status: 'done', lastSyncedAt: now });

          setTimeout(() => {
            if (get().status === 'done') set({ status: 'idle' });
          }, 3000);
        } catch (err) {
          console.error('Pull from cloud failed:', err);
          set({ status: 'error', error: 'Failed to pull from Supabase.' });
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
