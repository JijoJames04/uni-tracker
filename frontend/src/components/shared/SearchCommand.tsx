'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Building2 } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';
import { useQuery } from '@tanstack/react-query';
import { applicationApi, universityApi } from '@/lib/api';
import { cn, formatUniversityName } from '@/lib/utils';
import { UniversityLogo } from '@/components/shared/UniversityLogo';


export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationApi.getAll,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: universityApi.getAll,
  });

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
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/50
          text-muted-foreground hover:text-foreground text-sm w-64 cursor-pointer transition-all shadow-sm shadow-black/5"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">Search universities...</span>
        <kbd className="ml-auto text-[10px] font-bold bg-background shadow-sm border border-border/50 rounded-md px-1.5 py-0.5">⌘K</kbd>
      </button>

      {/* Command palette overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] pb-[5vh] lg:pt-[20vh]"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-background"
              onClick={() => setOpen(false)}
            />

            {/* Command box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-xl mx-4 bg-card border border-border/50
                rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5"
            >
              <Command className="[&_[cmdk-input]]:bg-transparent [&_[cmdk-group-heading]]:text-muted-foreground
                [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold
                [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider
                [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">

                {/* Input */}
                <div className="flex items-center border-b border-border/40 px-4 mt-2">
                  <Search className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                  <Command.Input
                    placeholder="Search universities, applications, actions..."
                    className="flex-1 h-12 bg-transparent text-[15px] font-medium text-foreground
                      placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-muted">
                  <Command.Empty className="py-12 text-center flex flex-col items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-foreground">No matches found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try searching for something else.</p>
                  </Command.Empty>

                  {applications.length > 0 && (
                    <Command.Group heading="Your Applications">
                      {applications.map((app) => (
                        <Command.Item
                          key={app.id}
                          value={`${app.course.university.shortName || ''} ${app.course.university.name} ${app.course.name}`}
                          onSelect={() => navigate(`/applications/${app.id}`)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 mb-1.5 rounded-xl text-sm transition-all cursor-pointer border border-transparent",
                            "data-[selected=true]:bg-indigo-50 data-[selected=true]:border-indigo-100 data-[selected=true]:text-indigo-900 data-[selected=true]:shadow-sm",
                            "dark:data-[selected=true]:bg-indigo-500/10 dark:data-[selected=true]:border-indigo-500/20 dark:data-[selected=true]:text-indigo-100"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-background border border-border/50 flex flex-shrink-0 items-center justify-center shadow-sm">
                            {app.course.university.logoUrl ? (
                              <UniversityLogo url={app.course.university.logoUrl} name={app.course.university.name} size="xs" />
                            ) : (
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground truncate">{formatUniversityName(app.course.university.name, app.course.university.shortName)}</span>
                            <span className="text-[12px] font-medium text-muted-foreground truncate">{app.course.name}</span>
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {universities.length > 0 && (
                    <Command.Group heading="Universities Directory">
                      {universities.map((uni) => (
                        <Command.Item
                          key={uni.id}
                          value={`Uni ${uni.shortName || ''} ${uni.name} ${uni.city || ''}`}
                          onSelect={() => navigate(`/universities/${uni.id}`)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 mb-1.5 rounded-xl text-sm transition-all cursor-pointer border border-transparent",
                            "data-[selected=true]:bg-emerald-50 data-[selected=true]:border-emerald-100 data-[selected=true]:text-emerald-900 data-[selected=true]:shadow-sm",
                            "dark:data-[selected=true]:bg-emerald-500/10 dark:data-[selected=true]:border-emerald-500/20 dark:data-[selected=true]:text-emerald-100"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-background border border-border/50 flex flex-shrink-0 items-center justify-center shadow-sm">
                            {uni.logoUrl ? (
                              <UniversityLogo url={uni.logoUrl} name={uni.name} size="xs" />
                            ) : (
                              <Building2 className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground truncate">{formatUniversityName(uni.name, uni.shortName)}</span>
                            {uni.city && <span className="text-[12px] font-medium text-muted-foreground truncate">{uni.city}</span>}
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  <Command.Group heading="Pages & Navigation">
                    {NAV_ITEMS.map((item) => (
                      <Command.Item
                        key={item.href}
                        value={`${item.label} page navigation`}
                        onSelect={() => navigate(item.href)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl text-sm transition-all cursor-pointer",
                          "data-[selected=true]:bg-muted data-[selected=true]:text-foreground text-muted-foreground"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium text-foreground">{item.label}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>

                {/* Footer */}
                <div className="border-t border-border/40 px-4 py-3 bg-muted/30 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1"><kbd className="bg-background border px-1 rounded shadow-sm">↑↓</kbd> Navigate</span>
                    <span className="flex items-center gap-1"><kbd className="bg-background border px-1 rounded shadow-sm">↵</kbd> Select</span>
                  </div>
                  <span className="flex items-center gap-1"><kbd className="bg-background border px-1 rounded shadow-sm">ESC</kbd> Close</span>
                </div>
              </Command>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
