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

  return (
    <>
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 gap-4">
        {/* Mobile menu */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
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
        {isAuthenticated && user && (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
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
        )}

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAddOpen(true)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
            'bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm',
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Application</span>
        </motion.button>
      </header>

      <AddApplicationModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
