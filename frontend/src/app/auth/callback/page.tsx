'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/lib/supabase';
import { useSyncStore } from '@/store/sync.store';
import { Loader2, CloudDownload } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [syncPhase, setSyncPhase] = useState<'auth' | 'sync'>('auth');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError(sessionError?.message || 'Authentication failed');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        const profile = session.user.user_metadata;
        setUser({
          uid: session.user.id,
          email: session.user.email ?? null,
          displayName: profile.full_name || profile.name || null,
          photoURL: profile.avatar_url || profile.picture || null,
          providerAccessToken: session.access_token,
        });
        
        // Successfully logged in and saved token
        setSyncPhase('sync');
        
        // Auto pull from cloud for a smooth experience
        try {
          await useSyncStore.getState().pullFromCloud();
        } catch (syncErr) {
          console.warn('Initial sync failed, continuing to dashboard', syncErr);
        }

        // Add a slight delay for smooth visual transition
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      } catch (err: unknown) {
        console.error('Authentication parsing error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
        setError(errorMessage);
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleAuth();
  }, [router, setUser]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-rose-500 font-bold mb-2">Error during authentication</p>
        <p className="text-slate-500">{error}</p>
        <p className="text-slate-400 text-sm mt-4">Redirecting you to home...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {syncPhase === 'auth' ? (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
          <h1 className="text-xl font-bold text-slate-700">Connecting Google...</h1>
          <p className="text-slate-500 mt-2">Setting up your personal save destination.</p>
        </>
      ) : (
        <>
          <CloudDownload className="w-8 h-8 animate-bounce text-emerald-500 mb-4" />
          <h1 className="text-xl font-bold text-slate-700">Syncing your data...</h1>
          <p className="text-slate-500 mt-2">Retrieving your latest backup from Google Drive.</p>
        </>
      )}
    </div>
  );
}
