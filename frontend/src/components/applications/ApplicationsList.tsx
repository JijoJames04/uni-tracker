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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter tabs */}
          <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
            {STATUS_GROUPS.map((g) => (
              <button
                key={g.key}
                onClick={() => setFilter(g.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  filter === g.key
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
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
            className="px-3 py-2 rounded-lg border bg-background text-xs font-medium text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
          >
            <option value="updated">Sort: Recent</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="name">Sort: Name</option>
            <option value="priority">Sort: Priority</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            {[
              { key: 'list',   icon: List },
              { key: 'kanban', icon: LayoutGrid },
            ].map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key as 'list' | 'kanban')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  view === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {applications.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Delete ALL applications? This will remove all universities, courses, and data. This cannot be undone.')) {
                  deleteAllMutation.mutate();
                }
              }}
              disabled={deleteAllMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            {filtered.length} application{filtered.length !== 1 ? 's' : ''}
          </span>
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
    <motion.div variants={FADE} initial="hidden" animate="visible" custom={index} whileHover={{ y: -1 }}>
      <Link href={`/applications/${app.id}`}>
        <div className="bg-card border rounded-xl p-4 hover:shadow-card-hover transition-all cursor-pointer group">
          <div className="flex items-start gap-3">
            <UniversityLogo url={app.course.university.logoUrl} name={app.course.university.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-indigo-600 transition-colors text-sm leading-snug truncate">
                    {app.course.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {app.course.university.name}
                    {app.course.university.city && ` · ${app.course.university.city}`}
                    {app.course.degree && ` · ${app.course.degree}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {app.priority !== 'MEDIUM' && (
                    <span className={cn(
                      'inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-semibold',
                      app.priority === 'HIGH' && 'bg-rose-50 text-rose-700 border-rose-200',
                      app.priority === 'LOW' && 'bg-slate-50 text-slate-500 border-slate-200',
                    )}>
                      {app.priority === 'HIGH' ? '🔥 High' : '↓ Low'}
                    </span>
                  )}
                  <ViaBadge via={app.course.applicationVia} />
                  <StatusBadge status={app.status} />
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-4 flex-wrap">
                {app.course.deadline && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className={cn(
                      'text-xs',
                      deadline.urgency === 'urgent' && 'text-rose-600 font-semibold',
                      deadline.urgency === 'soon'   && 'text-amber-600 font-medium',
                      deadline.urgency === 'ok'     && 'text-emerald-600',
                      deadline.urgency === 'passed' && 'text-slate-400',
                    )}>
                      {deadline.text}
                    </span>
                  </div>
                )}
                {app.course.fees != null && (
                  <div className="flex items-center gap-1.5">
                    <Euro className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{formatFees(app.course.fees)}</span>
                  </div>
                )}
                {app.checklist.length > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500')}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{progress}%</span>
                  </div>
                )}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
      {columns.map(({ status, apps: colApps }) => {
        const cfg = STATUS_CONFIG[status];
        return (
          <div key={status} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
              <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
              <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center">
                {colApps.length}
              </span>
            </div>
            <div className="space-y-2">
              {colApps.map((app) => (
                <Link key={app.id} href={`/applications/${app.id}`}>
                  <div className="bg-card border rounded-xl p-3 hover:shadow-card-hover transition-all cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <UniversityLogo url={app.course.university.logoUrl} name={app.course.university.name} size="xs" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-indigo-600 transition-colors">
                          {app.course.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{app.course.university.name}</p>
                      </div>
                    </div>
                    {app.course.deadline && (
                      <div className={cn('text-[10px] font-medium', formatDeadline(app.course.deadline).urgency === 'urgent' ? 'text-rose-600' : 'text-muted-foreground')}>
                        📅 {formatDeadline(app.course.deadline).text}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              {colApps.length === 0 && (
                <div className="h-20 rounded-xl border border-dashed flex items-center justify-center">
                  <p className="text-[11px] text-muted-foreground">Empty</p>
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
