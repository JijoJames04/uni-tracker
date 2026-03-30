'use client';

import { usePathname } from 'next/navigation';
import { Menu, Plus, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import { signOutUser } from '@/lib/firebase';
import { AddApplicationModal } from '@/components/applications/AddApplicationModal';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import SearchCommand from '@/components/shared/SearchCommand';
import SyncButton from '@/components/shared/SyncButton';
import { BREADCRUMBS } from '@/lib/navigation';
import { signInWithGoogle } from '@/lib/firebase';



export function Navbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAppStore();
  const { user, isAuthenticated, signOut: clearAuth } = useAuthStore();
  const [addOpen, setAddOpen] = useState(false);

  const pageTitle = BREADCRUMBS[pathname] ?? BREADCRUMBS[`/${pathname.split('/')[1]}`] ?? 'UniTracker';

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      // Firebase might not be configured
    }
    clearAuth();
  };

  const handleSignIn = async () => {
    try {
      const { user: firebaseUser, token } = await signInWithGoogle();
      useAuthStore.getState().setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        googleAccessToken: token || undefined,
      });
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-border/40 bg-background sticky top-0 z-30 flex items-center px-4 md:px-6 gap-4 shadow-sm shadow-black/5">
        {/* Mobile menu */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <motion.h1
          key={pageTitle}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-semibold text-foreground"
        >
          {pageTitle}
        </motion.h1>

        <div className="flex-1" />

        {/* Search command palette - desktop */}
        <div className="hidden md:block">
          <SearchCommand />
        </div>

        {/* Sync button */}
        <SyncButton />

        {/* User avatar / sign out */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full border-2 border-indigo-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            Sign In & Sync
          </button>
        )}

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setAddOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold relative group overflow-hidden',
            'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all border border-indigo-400/30',
          )}
        >
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -ml-4 w-1/2" />
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Application</span>
        </motion.button>
      </header>

      <AddApplicationModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
