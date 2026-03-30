'use client';

import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/store/auth.store';
import { useSyncStore } from '@/store/sync.store';

let syncTimeout: NodeJS.Timeout | null = null;

function AuthListener({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      }
      // Don't clear on null — user might be in local mode
    });

    return () => unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
        mutationCache: new MutationCache({
          onSuccess: () => {
            const syncState = useSyncStore.getState();
            const authState = useAuthStore.getState();
            
            // Auto cloud sync whenever data is mutated, if user is logged in
            if (authState.user && !authState.isLocalMode) {
              if (syncTimeout) clearTimeout(syncTimeout);
              syncTimeout = setTimeout(() => {
                syncState.pushToCloud();
              }, 3000); // 3-second debounce
            }
          },
        }),
      }),
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthListener>
          {children}
        </AuthListener>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
