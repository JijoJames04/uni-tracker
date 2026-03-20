'use client';

import { usePathname } from 'next/navigation';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app.store';
import { AddApplicationModal } from '@/components/applications/AddApplicationModal';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/applications': 'Applications',
  '/universities': 'Universities',
  '/documents':    'Documents',
  '/calendar':     'Calendar',
  '/profile':      'Profile',
};

export function Navbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);

  const pageTitle = BREADCRUMBS[pathname] ?? BREADCRUMBS[`/${pathname.split('/')[1]}`] ?? 'UniTracker';

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

        {/* Search - desktop */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm w-56 cursor-pointer hover:bg-muted/80 transition-colors">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-sm">Search...</span>
          <kbd className="ml-auto text-[10px] bg-background border border-border rounded px-1.5 py-0.5">⌘K</kbd>
        </div>

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
