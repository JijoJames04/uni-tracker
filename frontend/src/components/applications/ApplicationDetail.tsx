'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { applicationApi, documentApi, timelineApi, promptApi, universityApi } from '@/lib/api';
import type { ApplicationStatus, Priority } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, Globe, Clock,
  FileText, Upload, Copy, Check, Loader2,
  Plus, Trash2, BookOpen, Sparkles, AlertCircle, CheckCircle2,
  Building2, MapPin, Calendar
} from 'lucide-react';
import {
  cn, STATUS_CONFIG, STATUS_PIPELINE, getStatusProgress,
  formatDeadline, formatFees, formatRelativeTime, formatDate,
  DOC_TYPE_LABELS, TIMELINE_TYPE_CONFIG, formatFileSize,
} from '@/lib/utils';
import { StatusBadge, ViaBadge } from '@/components/shared/StatusBadge';
import { UniversityLogo } from '@/components/shared/UniversityLogo';
import { Skeleton } from '@/components/shared/Skeleton';
import { DocumentUpload } from '@/components/documents/DocumentUpload';

const FADE = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

export function ApplicationDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline' | 'prompt'>('overview');
  const [promptCopied, setPromptCopied] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [emailType, setEmailType] = useState<string>('inquiry');
  const [emailPrompt, setEmailPrompt] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationApi.getOne(id),
  });

  const { data: promptData, isLoading: promptLoading, refetch: fetchPrompt } = useQuery({
    queryKey: ['prompt', id],
    queryFn: () => promptApi.generateSop(id),
    enabled: activeTab === 'prompt',
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<{ status: ApplicationStatus; notes: string; priority: Priority }>) =>
      applicationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Updated!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checklistMutation = useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      applicationApi.updateChecklist(id, itemId, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['application', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => applicationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application deleted');
      router.push('/applications');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deadlineMutation = useMutation({
    mutationFn: ({ deadline, label }: { deadline: string; label?: string }) =>
      universityApi.updateDeadline(course.id, deadline, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Deadline updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addNoteMutation = useMutation({
    mutationFn: () =>
      timelineApi.addEntry(id, { action: 'Note added', description: newNote, type: 'NOTE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      setNewNote('');
      toast.success('Note added');
    },
  });

  const addChecklistMutation = useMutation({
    mutationFn: (label: string) => applicationApi.addChecklist(id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      setNewChecklistItem('');
      toast.success('Checklist item added');
    },
  });

  const removeChecklistMutation = useMutation({
    mutationFn: (itemId: string) => applicationApi.removeChecklist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      toast.success('Item removed');
    },
  });

  const emailMutation = useMutation({
    mutationFn: (type: string) => promptApi.generateEmail(id, type),
    onSuccess: (data) => {
      setEmailPrompt(data.prompt);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function copyPrompt() {
    if (!promptData) return;
    await navigator.clipboard.writeText(promptData.prompt);
    setPromptCopied(true);
    toast.success('Prompt copied to clipboard!');
    setTimeout(() => setPromptCopied(false), 2000);
  }

  if (isLoading) return <DetailSkeleton />;
  if (!app) return <div className="text-center py-20 text-muted-foreground">Application not found</div>;

  const { course } = app;
  const { university } = course;
  const deadline = formatDeadline(course.deadline);
  const progress = getStatusProgress(app.status);
  const checklistProgress = app.checklist.length > 0
    ? Math.round(app.checklist.filter((c) => c.completed).length / app.checklist.length * 100)
    : 0;

  const TABS = [
    { key: 'overview',  label: 'Overview',  icon: BookOpen },
    { key: 'documents', label: 'Documents', icon: FileText, badge: app.documents.length },
    { key: 'timeline',  label: 'Timeline',  icon: Clock,    badge: app.timeline.length },
    { key: 'prompt',    label: 'SOP Prompt',icon: Sparkles },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/applications" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors group mb-2">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Applications
      </Link>

      {/* Hero card */}
      <motion.div initial="hidden" animate="visible" variants={FADE} className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
            <div className="shadow-md rounded-2xl overflow-hidden flex-shrink-0 bg-background self-start">
              <UniversityLogo url={university.logoUrl} name={university.name} size="lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight mb-2">{course.name}</h1>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-[14px] font-bold text-muted-foreground">{university.name}</span>
                    {university.city && (
                      <>
                        <span className="text-border mx-1">|</span>
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-[14px] font-bold text-muted-foreground">{university.city}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                  <ViaBadge via={course.applicationVia} />
                  <StatusBadge status={app.status} size="md" />
                  <button
                    onClick={() => {
                      if (confirm('Delete this application? This cannot be undone.')) {
                        deleteMutation.mutate();
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-all shadow-sm ml-auto sm:ml-0"
                    title="Delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              {/* Quick info pills */}
              <div className="flex flex-wrap gap-2.5 mt-5">
                {course.degree && <Pill>{course.degree}</Pill>}
                {course.language && <Pill>🌐 {course.language}</Pill>}
                {course.duration && <Pill>⏱ {course.duration}</Pill>}
                {course.ects && <Pill>{course.ects} ECTS</Pill>}
                {course.fees != null && (
                  <Pill className="text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                    💶 {formatFees(course.fees, course.currency)}
                  </Pill>
                )}
                {(course.deadline || course.deadlineInternational) && (
                  editingDeadline ? (
                    <div className="flex items-center gap-2 bg-background p-1 rounded-xl border border-border/50 shadow-sm">
                      <select
                        className="text-[12px] font-bold px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500/30"
                        value={course.deadline || ''}
                        onChange={(e) => {
                          deadlineMutation.mutate({ deadline: e.target.value, label: e.target.value === course.deadlineInternational ? 'International Students' : 'Default' });
                          setEditingDeadline(false);
                        }}
                      >
                        {course.deadline && <option value={course.deadline}>Default: {formatDate(course.deadline)}</option>}
                        {course.deadlineInternational && <option value={course.deadlineInternational}>International: {formatDate(course.deadlineInternational)}</option>}
                      </select>
                      <button onClick={() => setEditingDeadline(false)} className="px-2 py-1 text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors bg-muted hover:bg-muted/80 rounded-lg">✕</button>
                    </div>
                  ) : (
                    <Pill 
                      className={cn(
                        'cursor-pointer hover:scale-105 transition-transform shadow-sm',
                        deadline.urgency === 'urgent' && 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
                        deadline.urgency === 'soon'   && 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
                        deadline.urgency === 'ok'     && 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                      )}
                      onClick={() => setEditingDeadline(true)}
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" /> {deadline.text}
                      {course.deadlineLabel && <span className="ml-1 opacity-75 hidden sm:inline-block">({course.deadlineLabel})</span>}
                    </Pill>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Application progress */}
          <div className="mt-8 bg-background border border-border/50 rounded-2xl p-5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-bold text-muted-foreground tracking-wide uppercase">Application Progress</span>
              <span className="text-[13px] font-black text-foreground">{progress}%</span>
            </div>
            <div className="h-3 rounded-full bg-border/50 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                className={cn('h-full rounded-full', app.status === 'APPROVED' ? 'bg-emerald-500' : app.status === 'REJECTED' ? 'bg-rose-500' : 'bg-indigo-500 bg-gradient-to-r from-indigo-500 to-violet-500')}
              />
            </div>
            {/* Pipeline steps */}
            <div className="flex justify-between mt-3">
              {STATUS_PIPELINE.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const done = STATUS_PIPELINE.indexOf(app.status) >= STATUS_PIPELINE.indexOf(s);
                return (
                  <div key={s} className="flex flex-col items-center gap-1.5 relative w-8 sm:w-auto">
                    <div className={cn('w-3 h-3 rounded-full border-2 transition-all duration-500', done ? cn(cfg.border, cfg.bg) : 'border-border/50 bg-muted')} />
                    <span className={cn('text-[10px] sm:text-[11px] font-bold text-center absolute top-4 hidden sm:block w-max', done ? cfg.color : 'text-muted-foreground/50 opacity-50')}>{cfg.label.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status & Priority actions */}
          <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[13px] font-bold text-muted-foreground mr-1">Priority:</span>
              {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => app.priority !== p && updateMutation.mutate({ priority: p })}
                  disabled={updateMutation.isPending}
                  className={cn(
                    'text-[12px] px-3 py-1.5 rounded-xl border font-bold transition-all shadow-sm',
                    app.priority === p
                      ? p === 'HIGH'   ? 'bg-rose-50 text-rose-700 border-rose-300 ring-4 ring-rose-500/10 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30'
                      : p === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-300 ring-4 ring-amber-500/10 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                      :                  'bg-slate-50 text-slate-600 border-slate-300 ring-4 ring-slate-500/10 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30'
                      : 'bg-background text-muted-foreground border-border/50 hover:bg-muted/80',
                  )}
                >
                  {p === 'HIGH' ? '🔥 High' : p === 'MEDIUM' ? '⚡ Medium' : '↓ Low'}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <span className="text-[13px] font-bold text-muted-foreground mr-1 hidden sm:block">Status:</span>
              {(Object.keys(STATUS_CONFIG) as ApplicationStatus[])
                .filter((s) => s !== app.status)
                .map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => updateMutation.mutate({ status: s })}
                      disabled={updateMutation.isPending}
                      className={cn(
                        'text-[11px] px-3 py-1.5 rounded-xl border font-bold transition-all hover:scale-105 shadow-sm whitespace-nowrap',
                        cfg.bg, cfg.color, cfg.border,
                      )}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* uni-assist warning */}
        {course.applicationVia !== 'DIRECT' && course.uniAssistInfo && (
          <div className="px-5 pb-4 sm:px-6">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50 border border-purple-200">
              <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-purple-800">uni-assist Required</p>
                <p className="text-xs text-purple-700 mt-0.5">{course.uniAssistInfo}</p>
              </div>
              <a href="https://www.uni-assist.de" target="_blank" rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors whitespace-nowrap">
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* External link */}
        {course.applicationUrl && (
          <div className="px-5 pb-4 sm:px-6">
            <a href={course.applicationUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              <Globe className="w-3.5 h-3.5" />
              View Application Portal
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-card rounded-2xl p-1.5 border border-border/50 shadow-sm overflow-x-auto no-scrollbar">
        {TABS.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap',
              activeTab === key
                ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
            )}
          >
            <Icon className="w-4 h-4 hidden sm:block" />
            <span className="truncate">{label}</span>
            {badge != null && badge > 0 && (
              <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md min-w-[20px] text-center shadow-sm">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Checklist */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-foreground text-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    Checklist
                    <span className="text-[13px] text-muted-foreground font-semibold bg-muted/50 px-3 py-1 rounded-lg border border-border/50 mt-1 sm:mt-0">
                      {checklistProgress}% complete
                    </span>
                  </h3>
                  <div className="w-24 sm:w-32 h-2 rounded-full bg-border/50 overflow-hidden shadow-inner hidden sm:block">
                    <div className={cn('h-full rounded-full transition-all duration-1000', checklistProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500')}
                      style={{ width: `${checklistProgress}%` }} />
                  </div>
                </div>
                <div className="space-y-3">
                  {app.checklist.map((item) => (
                    <label key={item.id} className="flex items-center gap-4 p-3.5 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/30 hover:shadow-sm transition-all cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => checklistMutation.mutate({ itemId: item.id, completed: e.target.checked })}
                        className="w-5 h-5 rounded border-border/50 bg-background accent-indigo-600 focus:ring-indigo-500/30 cursor-pointer shadow-sm transition-all duration-300"
                      />
                      <span className={cn('text-[15px] font-semibold flex-1 transition-all duration-300', item.completed && 'line-through text-muted-foreground')}>
                        {item.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Remove this checklist item?')) removeChecklistMutation.mutate(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </label>
                  ))}
                  {/* Add new checklist item */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border/50">
                    <input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newChecklistItem.trim()) {
                          e.preventDefault();
                          addChecklistMutation.mutate(newChecklistItem.trim());
                        }
                      }}
                      placeholder="Add a checklist item (e.g. Schedule Visa Interview)..."
                      className="flex-1 w-full px-4 py-3 rounded-2xl border border-border/60 bg-background text-[14px] font-bold placeholder:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-inner"
                    />
                    <button
                      onClick={() => newChecklistItem.trim() && addChecklistMutation.mutate(newChecklistItem.trim())}
                      disabled={!newChecklistItem.trim() || addChecklistMutation.isPending}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <NotesEditor
                initialNotes={app.notes ?? ''}
                onSave={(notes) => updateMutation.mutate({ notes })}
                isSaving={updateMutation.isPending}
              />
            </div>

            {/* Course info card */}
            <div className="space-y-4">
              <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="font-black text-foreground text-[18px] mb-5">Course Details</h3>
                <div className="space-y-3.5">
                  {[
                    { label: 'University',  value: university.name },
                    { label: 'Degree',      value: course.degree },
                    { label: 'Language',    value: course.language },
                    { label: 'Duration',    value: course.duration },
                    { label: 'ECTS',        value: course.ects ? `${course.ects} credits` : null },
                    { label: 'Annual Fees', value: formatFees(course.fees, course.currency) },
                    { label: 'Deadline',    value: course.deadline ? formatDate(course.deadline) : null },
                    { label: 'Start Date',  value: course.startDate ? formatDate(course.startDate) : null },
                  ].filter((r) => r.value).map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 items-center bg-background border border-border/30 rounded-xl p-3 shadow-sm">
                      <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">{row.label}</span>
                      <span className="text-[14px] font-black text-foreground text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {course.description && (
                <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="font-black text-foreground text-[18px] mb-4">About This Program</h3>
                  <p className="text-[14px] font-medium text-muted-foreground leading-relaxed">{course.description}</p>
                </div>
              )}

              {course.requirements && (
                <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="font-black text-foreground text-[18px] mb-4">Requirements</h3>
                  <p className="text-[14px] font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.requirements}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-2xl p-4 sm:p-5 border border-border/50 shadow-sm">
              <h3 className="font-black text-foreground text-[18px]">
                {app.documents.length} Document{app.documents.length !== 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => setUploadOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold transition-all shadow-md w-full sm:w-auto"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>

            {app.documents.length === 0 ? (
              <div className="empty-state bg-card border border-border/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4 border border-border/50">
                  <FileText className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-[16px] font-black text-foreground mb-1 mt-2">No documents uploaded yet</p>
                <p className="text-[14px] font-medium text-muted-foreground">Upload your SOP, CV, transcripts and other documents here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {app.documents.map((doc) => (
                  <div key={doc.id} className="bg-background border border-border/50 rounded-2xl p-5 flex items-start sm:items-center gap-4 hover:shadow-md hover:border-indigo-500/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {DOC_TYPE_LABELS[doc.type] || doc.type}
                      </p>
                      <p className="text-[13px] font-medium text-muted-foreground truncate my-0.5">{doc.originalName}</p>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 inline-block px-2 py-0.5 rounded-md mt-1 border border-border/30">
                        v{doc.version} <span className="mx-1">·</span> {formatFileSize(doc.fileSize)} <span className="mx-1">·</span> {formatRelativeTime(doc.uploadedAt)}
                      </p>
                    </div>
                    <a href={documentApi.download(doc.id)} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-muted/50 hover:bg-indigo-500 hover:text-white text-muted-foreground transition-all shadow-sm flex-shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}

            <DocumentUpload
              applicationId={id}
              open={uploadOpen}
              onClose={() => setUploadOpen(false)}
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['application', id] })}
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Add note */}
            <div className="bg-card border border-border/50 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 shadow-sm">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a timeline note..."
                rows={2}
                className="flex-1 px-4 py-3 rounded-2xl border border-border/60 bg-background text-[14px] font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none shadow-inner"
              />
              <button
                onClick={() => newNote.trim() && addNoteMutation.mutate()}
                disabled={!newNote.trim() || addNoteMutation.isPending}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold transition-colors disabled:opacity-50 sm:self-end shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Note
              </button>
            </div>

            {/* Timeline entries */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm relative pt-10">
              <div className="absolute left-[38px] top-6 bottom-6 w-1 rounded-full bg-border/50" />
              <div className="space-y-6 relative">
                {app.timeline.map((entry) => {
                  const cfg = TIMELINE_TYPE_CONFIG[entry.type] || TIMELINE_TYPE_CONFIG.NOTE;
                  return (
                    <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="relative bg-background border border-border/50 rounded-2xl p-5 ml-12 hover:shadow-md transition-shadow">
                      <div className={cn('absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-background shadow-sm', cfg.bg)}>
                        {cfg.icon}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1.5">
                        <p className="text-[15px] font-bold text-foreground">{entry.action}</p>
                        <span className="text-[12px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-lg border border-border/30 inline-block w-fit">
                          {formatRelativeTime(entry.createdAt)}
                        </span>
                      </div>
                      {entry.description && <p className="text-[13px] font-medium text-muted-foreground mt-2 bg-muted/30 p-3 rounded-xl border border-border/30">{entry.description}</p>}
                    </motion.div>
                  );
                })}
                {app.timeline.length === 0 && (
                  <div className="text-center py-12 flex flex-col items-center">
                    <Clock className="w-8 h-8 text-muted-foreground/30 mb-3" />
                    <p className="text-[15px] font-bold text-muted-foreground">No timeline entries yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="space-y-5">
            {/* SOP Prompt */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-black text-foreground text-[18px] flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                    </div>
                    SOP Prompt Generator
                  </h3>
                  <p className="text-[13px] font-medium text-muted-foreground mt-2 pl-[42px]">
                    Copy this prompt into ChatGPT, Claude, or Gemini to generate your Statement of Purpose
                  </p>
                </div>
                <button
                  onClick={copyPrompt}
                  disabled={!promptData}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 bg-background text-[14px] font-bold transition-all hover:bg-muted disabled:opacity-50 shadow-sm w-full sm:w-auto hover:shadow-md"
                >
                  {promptCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {promptCopied ? 'Copied!' : 'Copy Prompt'}
                </button>
              </div>

              {promptLoading ? (
                <div className="space-y-3 mt-4">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 rounded-full w-full" />)}
                  <Skeleton className="h-4 rounded-full w-2/3" />
                </div>
              ) : promptData ? (
                <div className="bg-background border border-border/50 rounded-2xl p-5 sm:p-6 shadow-inner relative group">
                  <pre className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto max-h-[500px] overflow-y-auto no-scrollbar">
                    {promptData.prompt}
                  </pre>
                </div>
              ) : (
                <button onClick={() => fetchPrompt()} className="w-full py-10 rounded-2xl border-2 border-dashed border-border hover:border-indigo-400 bg-background/30 hover:bg-indigo-500/5 transition-all text-[15px] font-bold text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 flex flex-col items-center gap-3">
                  <Sparkles className="w-8 h-8 opacity-50" />
                  Click to generate customized SOP prompt
                </button>
              )}
            </div>

            {/* Email Template Generator */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-black text-foreground text-[18px] flex items-center gap-2.5 mb-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                  ✉️
                </div>
                Email Template Generator
              </h3>
              <p className="text-[14px] font-medium text-muted-foreground mb-6 pl-[42px]">
                Generate professional email templates for different stages of your application.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { key: 'inquiry', label: '📩 Inquiry', desc: 'Ask about program' },
                  { key: 'status', label: '📋 Follow-up', desc: 'Check status' },
                  { key: 'acceptance', label: '🎉 Acceptance', desc: 'Confirm acceptance' },
                ].map((tmpl) => (
                  <button
                    key={tmpl.key}
                    onClick={() => {
                      setEmailType(tmpl.key);
                      emailMutation.mutate(tmpl.key);
                    }}
                    disabled={emailMutation.isPending}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 rounded-2xl border border-border/50 bg-background text-[13px] font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5',
                      emailType === tmpl.key && emailPrompt
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-4 ring-indigo-500/10'
                        : 'hover:border-indigo-300 hover:bg-muted',
                    )}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span>{tmpl.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {emailMutation.isPending && (
                <div className="flex items-center gap-3 text-[14px] font-bold text-indigo-600 dark:text-indigo-400 py-8 justify-center bg-background rounded-2xl border border-indigo-500/20 shadow-inner">
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating Magic...
                </div>
              )}
              
              {emailPrompt && !emailMutation.isPending && (
                <div className="space-y-4">
                  <div className="bg-background border border-border/50 rounded-2xl p-5 sm:p-6 shadow-inner">
                    <pre className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto max-h-[300px] overflow-y-auto no-scrollbar">
                      {emailPrompt}
                    </pre>
                  </div>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(emailPrompt);
                      setEmailCopied(true);
                      toast.success('Email prompt copied!');
                      setTimeout(() => setEmailCopied(false), 2000);
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold shadow-sm transition-all hover:shadow-md w-full sm:w-auto ml-auto"
                  >
                    {emailCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    {emailCopied ? 'Copied!' : 'Copy Email'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Pill({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const Element = onClick ? 'button' : 'span';
  return (
    <Element 
      onClick={onClick}
      className={cn('inline-flex items-center text-[12px] px-3.5 py-1.5 rounded-xl border font-bold bg-muted/50 text-foreground border-border/50 shadow-sm transition-all', onClick && 'cursor-pointer hover:bg-muted', className)}
    >
      {children}
    </Element>
  );
}

function NotesEditor({ initialNotes, onSave, isSaving }: { initialNotes: string; onSave: (notes: string) => void; isSaving: boolean }) {
  const [value, setValue] = useState(initialNotes);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef(initialNotes);

  // Sync if server value changes externally
  useEffect(() => {
    if (initialNotes !== lastSavedRef.current) {
      setValue(initialNotes);
      lastSavedRef.current = initialNotes;
    }
  }, [initialNotes]);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (newValue !== lastSavedRef.current) {
        lastSavedRef.current = newValue;
        onSave(newValue);
      }
    }, 1000);
  }, [onSave]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-foreground text-xl">Private Notes</h3>
        {isSaving && <span className="text-[11px] font-bold text-muted-foreground animate-pulse bg-muted px-2 py-0.5 rounded-md">Saving...</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add thoughts, impressions, or specific requirements..."
        rows={5}
        className="w-full px-4 py-4 rounded-2xl border border-border/60 bg-background text-[14px] font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none shadow-inner leading-relaxed"
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-6 w-32 rounded-lg" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-10 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
