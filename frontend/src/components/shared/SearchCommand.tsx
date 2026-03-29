'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, BookOpen, GraduationCap,
  FolderOpen, Calendar, User, FileText, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Pages' },
  { label: 'Applications', href: '/applications', icon: BookOpen, group: 'Pages' },
  { label: 'Universities', href: '/universities', icon: GraduationCap, group: 'Pages' },
  { label: 'Documents', href: '/documents', icon: FolderOpen, group: 'Pages' },
  { label: 'Calendar', href: '/calendar', icon: Calendar, group: 'Pages' },
  { label: 'My Profile', href: '/profile', icon: User, group: 'Pages' },
];

const QUICK_ACTIONS = [
  { label: 'Add Application', href: '/applications?action=add', icon: BookOpen, group: 'Actions' },
  { label: 'Upload Document', href: '/documents?action=upload', icon: FileText, group: 'Actions' },
  { label: 'Create Event', href: '/calendar?action=create', icon: Calendar, group: 'Actions' },
];

export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // ⌘K / Ctrl+K to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted
          text-muted-foreground text-sm w-56 cursor-pointer
          hover:bg-muted/80 transition-colors"
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-sm">Search...</span>
        <kbd className="ml-auto text-[10px] bg-background border border-border rounded px-1.5 py-0.5">⌘K</kbd>
      </button>

      {/* Command palette overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Command box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-700
                rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              <Command className="[&_[cmdk-input]]:bg-transparent [&_[cmdk-group-heading]]:text-zinc-500
                [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold
                [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider
                [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">

                {/* Input */}
                <div className="flex items-center border-b border-zinc-800 px-4">
                  <Search className="w-4 h-4 text-zinc-500 mr-3 flex-shrink-0" />
                  <Command.Input
                    placeholder="Search pages, actions…"
                    className="flex-1 h-14 bg-transparent text-sm text-white
                      placeholder:text-zinc-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <Command.List className="max-h-[300px] overflow-y-auto p-2">
                  <Command.Empty className="py-8 text-center text-sm text-zinc-500">
                    No results found.
                  </Command.Empty>

                  <Command.Group heading="Pages">
                    {NAV_ITEMS.map((item) => (
                      <Command.Item
                        key={item.href}
                        value={item.label}
                        onSelect={() => navigate(item.href)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300
                          cursor-pointer data-[selected=true]:bg-indigo-600/20 data-[selected=true]:text-white
                          transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-zinc-500" />
                        {item.label}
                      </Command.Item>
                    ))}
                  </Command.Group>

                  <Command.Group heading="Quick Actions">
                    {QUICK_ACTIONS.map((item) => (
                      <Command.Item
                        key={item.href}
                        value={item.label}
                        onSelect={() => navigate(item.href)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300
                          cursor-pointer data-[selected=true]:bg-indigo-600/20 data-[selected=true]:text-white
                          transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-zinc-500" />
                        {item.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>

                {/* Footer */}
                <div className="border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-[10px] text-zinc-600">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>ESC Close</span>
                </div>
              </Command>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
