'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { applicationApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Application, ApplicationStatus } from '@/lib/api';
import {
  LayoutGrid, List, Search, Calendar,
  ArrowRight, Euro, Trash2,
} from 'lucide-react';
import { cn, STATUS_CONFIG, formatDeadline, formatFees, isActionNeeded } from '@/lib/utils';
import { StatusBadge, ViaBadge } from '@/components/shared/StatusBadge';
import { UniversityLogo } from '@/components/shared/UniversityLogo';
import { Skeleton } from '@/components/shared/Skeleton';

const STATUS_GROUPS = [
  { key: 'all',           label: 'All', color: '' },
  { key: 'action',        label: 'Action Needed', color: 'text-rose-600' },
  { key: 'in_progress',   label: 'In Progress',   color: 'text-blue-600' },
  { key: 'completed',     label: 'Completed',     color: 'text-emerald-600' },
];

const FADE = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

export function ApplicationsList() {
  const [view, setView]       = useState<'list' | 'kanban'>('list');
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState<'updated' | 'deadline' | 'name' | 'priority'>('updated');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationApi.getAll,
  });

  const queryClient = useQueryClient();
  const deleteAllMutation = useMutation({
    mutationFn: applicationApi.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('All applications deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let apps = [...applications];

    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter((a) =>
        a.course.name.toLowerCase().includes(q) ||
        a.course.university.name.toLowerCase().includes(q),
      );
    }

    if (filter === 'action') {
      apps = apps.filter((a) => isActionNeeded(a.status));
    } else if (filter === 'in_progress') {
      apps = apps.filter((a) => ['DOCUMENTS_READY', 'SUBMITTED', 'UNDER_REVIEW'].includes(a.status));
    } else if (filter === 'completed') {
      apps = apps.filter((a) => ['APPROVED', 'REJECTED', 'WAITLISTED'].includes(a.status));
    }

    apps.sort((a, b) => {
      if (sortBy === 'deadline') {
        const da = a.course.deadline ? new Date(a.course.deadline).getTime() : Infinity;
        const db = b.course.deadline ? new Date(b.course.deadline).getTime() : Infinity;
        return da - db;
      }
      if (sortBy === 'name') return a.course.name.localeCompare(b.course.name);
      if (sortBy === 'priority') {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return apps;
  }, [applications, filter, search, sortBy]);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card/60 backdrop-blur-md p-3 rounded-2xl border border-border/50 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-background/50 text-[14px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          {/* Filter tabs */}
          <div className="flex items-center bg-muted/50 border border-border/50 rounded-xl p-1 gap-1 flex-1 sm:flex-none overflow-x-auto no-scrollbar">
            {STATUS_GROUPS.map((g) => (
              <button
                key={g.key}
                onClick={() => setFilter(g.key)}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap',
                  filter === g.key
                    ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                )}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3.5 py-2.5 rounded-xl border border-border/50 bg-background/50 text-[13px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer hover:bg-muted/50 transition-colors hidden sm:block shadow-sm"
          >
            <option value="updated">Recent</option>
            <option value="deadline">Deadline</option>
            <option value="name">Name</option>
            <option value="priority">Priority</option>
          </select>

          {/* View toggle */}
          <div className="hidden sm:flex items-center bg-muted/50 border border-border/50 rounded-xl p-1 shadow-sm">
            {[
              { key: 'list',   icon: List },
              { key: 'kanban', icon: LayoutGrid },
            ].map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key as 'list' | 'kanban')}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  view === key ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 justify-between sm:justify-end">
          <span className="text-[12px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/30">
            {filtered.length} Application{filtered.length !== 1 ? 's' : ''}
          </span>
          {applications.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Delete ALL applications? This will remove all universities, courses, and data. This cannot be undone.')) {
                  deleteAllMutation.mutate();
                }
              }}
              disabled={deleteAllMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} />
        ) : view === 'list' ? (
          <ListView apps={filtered} />
        ) : (
          <KanbanView apps={applications} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ListView({ apps }: { apps: Application[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
      {apps.map((app, i) => (
        <AppCard key={app.id} app={app} index={i} />
      ))}
    </motion.div>
  );
}

function AppCard({ app, index }: { app: Application; index: number }) {
  const deadline = formatDeadline(app.course.deadline);
  const progress = app.checklist.length > 0
    ? Math.round((app.checklist.filter((c) => c.completed).length / app.checklist.length) * 100)
    : 0;

  return (
    <motion.div variants={FADE} initial="hidden" animate="visible" custom={index} whileHover={{ y: -2 }}>
      <Link href={`/applications/${app.id}`}>
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sm:p-5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group mb-3">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="hidden sm:block shadow-sm rounded-xl overflow-hidden flex-shrink-0">
              <UniversityLogo url={app.course.university.logoUrl} name={app.course.university.name} size="md" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="sm:hidden w-8 h-8 flex-shrink-0 shadow-sm rounded-lg overflow-hidden">
                      <UniversityLogo url={app.course.university.logoUrl} name={app.course.university.name} size="xs" />
                    </div>
                    <p className="font-bold text-[16px] text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug truncate">
                      {app.course.name}
                    </p>
                  </div>
                  <p className="text-[13px] font-medium text-muted-foreground truncate mt-1">
                    {app.course.university.name}
                    {app.course.university.city && ` · ${app.course.university.city}`}
                    {app.course.degree && ` · ${app.course.degree}`}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {app.priority !== 'MEDIUM' && (
                    <span className={cn(
                      'inline-flex items-center text-[11px] px-2.5 py-1 rounded-lg border font-bold shadow-sm',
                      app.priority === 'HIGH' && 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
                      app.priority === 'LOW' && 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
                    )}>
                      {app.priority === 'HIGH' ? '🔥 High' : '↓ Low'}
                    </span>
                  )}
                  <ViaBadge via={app.course.applicationVia} />
                  <StatusBadge status={app.status} size="md" />
                </div>
              </div>

              <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap bg-muted/30 p-2.5 sm:bg-transparent sm:p-0 rounded-xl">
                {app.course.deadline && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className={cn(
                      'text-[12px] font-bold px-2 py-0.5 rounded-lg border shadow-sm',
                      deadline.urgency === 'urgent' && 'text-rose-700 bg-rose-500/10 border-rose-500/20 dark:text-rose-400',
                      deadline.urgency === 'soon'   && 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
                      deadline.urgency === 'ok'     && 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
                      deadline.urgency === 'passed' && 'text-slate-500 bg-slate-500/10 border-slate-500/20 dark:text-slate-400',
                    )}>
                      {deadline.text}
                    </span>
                  </div>
                )}
                {app.course.fees != null && (
                  <div className="flex items-center gap-1.5">
                    <Euro className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-[12px] font-semibold text-muted-foreground bg-muted hover:bg-muted/80 px-2 py-0.5 rounded-lg border border-border/50 transition-colors shadow-sm">{formatFees(app.course.fees)}</span>
                  </div>
                )}
                {app.checklist.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto">
                    <div className="w-full sm:w-24 h-1.5 rounded-full bg-border/50 shadow-inner overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-1000', progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500')}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground">{progress}%</span>
                  </div>
                )}
              </div>
            </div>
            <ArrowRight className="hidden sm:block w-4 h-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function KanbanView({ apps }: { apps: Application[] }) {
  const columns: { status: ApplicationStatus; apps: Application[] }[] = [
    'DRAFT', 'SOP_WRITING', 'DOCUMENTS_PREPARING', 'DOCUMENTS_READY',
    'SUBMITTED', 'UNDER_REVIEW',
  ].map((s) => ({
    status: s as ApplicationStatus,
    apps: apps.filter((a) => a.status === s),
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar">
      {columns.map(({ status, apps: colApps }) => {
        const cfg = STATUS_CONFIG[status];
        return (
          <div key={status} className="flex-shrink-0 w-72 sm:w-80 snap-start bg-muted/20 border border-border/50 rounded-3xl p-3 flex flex-col max-h-[70vh]">
            <div className="flex items-center gap-2 mb-4 px-2 pt-1 sticky top-0 bg-background/50 backdrop-blur-sm z-10 py-2 rounded-xl border border-border/30">
              <div className={cn('w-2.5 h-2.5 rounded-full shadow-sm', cfg.dot)} />
              <span className="text-[13px] font-bold text-foreground uppercase tracking-widest">{cfg.label}</span>
              <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted border border-border/50 rounded-lg px-2 py-0.5 shadow-sm">
                {colApps.length}
              </span>
            </div>
            <div className="space-y-3 overflow-y-auto no-scrollbar flex-1 pb-2 px-1">
              {colApps.map((app) => (
                <Link key={app.id} href={`/applications/${app.id}`}>
                  <div className="bg-background border border-border/50 rounded-2xl p-4 hover:border-indigo-500/40 hover:shadow-md transition-all cursor-pointer group shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="shadow-sm rounded-lg overflow-hidden flex-shrink-0">
                        <UniversityLogo url={app.course.university.logoUrl} name={app.course.university.name} size="xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {app.course.name}
                        </p>
                        <p className="text-[11px] font-medium text-muted-foreground truncate">{app.course.university.name}</p>
                      </div>
                    </div>
                    {app.course.deadline && (
                      <div className={cn('text-[11px] font-bold px-2 py-1 rounded-lg border shadow-sm inline-flex items-center gap-1.5', formatDeadline(app.course.deadline).urgency === 'urgent' ? 'text-rose-700 bg-rose-500/10 border-rose-500/20 dark:text-rose-400' : 'text-muted-foreground bg-muted/50 border-border/50')}>
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDeadline(app.course.deadline).text}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              {colApps.length === 0 && (
                <div className="h-28 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-2">
                  <LayoutGrid className="w-6 h-6 text-muted-foreground/30" />
                  <p className="text-[12px] font-semibold text-muted-foreground/50">Empty column</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="empty-state">
      <div className="empty-state-icon">
        <Search className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {search ? `No results for "${search}"` : 'No applications yet'}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {search ? 'Try a different search term.' : 'Click "Add Application" to track your first one.'}
      </p>
    </motion.div>
  );
}
