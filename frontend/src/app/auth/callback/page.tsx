'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { fetchGoogleProfile } from '@/lib/googleAuth';
import { useSyncStore } from '@/store/sync.store';
import { Loader2, CloudDownload } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [syncPhase, setSyncPhase] = useState<'auth' | 'sync'>('auth');

  useEffect(() => {
    const handleAuth = async () => {
      // The implicit grant flow puts token in the hash URL
      const hash = window.location.hash;
      if (!hash) {
        // also check search params in case of errors
        const params = new URLSearchParams(window.location.search);
        if (params.get('error')) {
          setError(params.get('error') || 'Authentication failed');
        } else {
          router.push('/');
        }
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');

      if (!accessToken) {
        setError('No access token found');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      try {
        const profile = await fetchGoogleProfile(accessToken);
        setUser({
          uid: profile.sub,
          email: profile.email,
          displayName: profile.name,
          photoURL: profile.picture,
          googleAccessToken: accessToken,
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
