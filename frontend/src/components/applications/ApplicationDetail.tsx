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
  Building2, MapPin,
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
      <Link href="/applications" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Applications
      </Link>

      {/* Hero card */}
      <motion.div initial="hidden" animate="visible" variants={FADE} className="bg-card border rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <UniversityLogo url={university.logoUrl} name={university.name} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-foreground leading-tight">{course.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{university.name}</span>
                    {university.city && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{university.city}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <ViaBadge via={course.applicationVia} />
                  <StatusBadge status={app.status} size="md" />
                  <button
                    onClick={() => {
                      if (confirm('Delete this application? This cannot be undone.')) {
                        deleteMutation.mutate();
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-colors"
                    title="Delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Quick info pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {course.degree && <Pill>{course.degree}</Pill>}
                {course.language && <Pill>🌐 {course.language}</Pill>}
                {course.duration && <Pill>⏱ {course.duration}</Pill>}
                {course.ects && <Pill>{course.ects} ECTS</Pill>}
                {course.fees != null && (
                  <Pill className="text-amber-700 bg-amber-50 border-amber-200">
                    💶 {formatFees(course.fees, course.currency)}
                  </Pill>
                )}
                {(course.deadline || course.deadlineInternational) && (
                  editingDeadline ? (
                    <div className="flex items-center gap-2">
                      <select
                        className="text-xs px-2 py-1 rounded border bg-background"
                        value={course.deadline || ''}
                        onChange={(e) => {
                          deadlineMutation.mutate({ deadline: e.target.value, label: e.target.value === course.deadlineInternational ? 'International Students' : 'Default' });
                          setEditingDeadline(false);
                        }}
                      >
                        {course.deadline && <option value={course.deadline}>Default: {formatDate(course.deadline)}</option>}
                        {course.deadlineInternational && <option value={course.deadlineInternational}>International: {formatDate(course.deadlineInternational)}</option>}
                      </select>
                      <button onClick={() => setEditingDeadline(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                    </div>
                  ) : (
                    <Pill 
                      className={cn(
                        'cursor-pointer hover:opacity-80',
                        deadline.urgency === 'urgent' && 'text-rose-700 bg-rose-50 border-rose-200',
                        deadline.urgency === 'soon'   && 'text-amber-700 bg-amber-50 border-amber-200',
                        deadline.urgency === 'ok'     && 'text-emerald-700 bg-emerald-50 border-emerald-200',
                      )}
                      onClick={() => setEditingDeadline(true)}
                    >
                      📅 {deadline.text}
                      {course.deadlineLabel && <span className="ml-1 opacity-75">({course.deadlineLabel})</span>}
                    </Pill>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Application progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Application Progress</span>
              <span className="text-xs font-semibold text-foreground">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                className={cn('h-full rounded-full', app.status === 'APPROVED' ? 'bg-emerald-500' : app.status === 'REJECTED' ? 'bg-rose-500' : 'bg-indigo-500')}
              />
            </div>
            {/* Pipeline steps */}
            <div className="flex justify-between mt-2">
              {STATUS_PIPELINE.slice(0, -1).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const done = STATUS_PIPELINE.indexOf(app.status) >= STATUS_PIPELINE.indexOf(s);
                return (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div className={cn('w-2 h-2 rounded-full', done ? cfg.dot : 'bg-muted')} />
                    <span className={cn('text-[9px] hidden sm:block', done ? cfg.color : 'text-muted-foreground')}>{cfg.label.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status & Priority actions */}
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Priority:</span>
            {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
              <button
                key={p}
                onClick={() => app.priority !== p && updateMutation.mutate({ priority: p })}
                disabled={updateMutation.isPending}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full border font-medium transition-all',
                  app.priority === p
                    ? p === 'HIGH'   ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200'
                    : p === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200'
                    :                  'bg-slate-50 text-slate-600 border-slate-300 ring-1 ring-slate-200'
                    : 'bg-muted text-muted-foreground border-border hover:opacity-80',
                )}
              >
                {p === 'HIGH' ? '🔥 High' : p === 'MEDIUM' ? '⚡ Medium' : '↓ Low'}
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-4">Status:</span>
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
                      'text-xs px-2.5 py-1 rounded-full border font-medium transition-all hover:opacity-80',
                      cfg.bg, cfg.color, cfg.border,
                    )}
                  >
                    {cfg.label}
                  </button>
                );
              })}
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
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {TABS.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="w-3.5 h-3.5 hidden sm:block" />
            <span className="truncate">{label}</span>
            {badge != null && badge > 0 && (
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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
            <div className="xl:col-span-2 space-y-3">
              <div className="bg-card border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Checklist
                    <span className="text-xs text-muted-foreground font-normal">({checklistProgress}% complete)</span>
                  </h3>
                  <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', checklistProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500')}
                      style={{ width: `${checklistProgress}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  {app.checklist.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => checklistMutation.mutate({ itemId: item.id, completed: e.target.checked })}
                        className="w-4 h-4 rounded border-border accent-indigo-600 cursor-pointer"
                      />
                      <span className={cn('text-sm flex-1', item.completed && 'line-through text-muted-foreground')}>
                        {item.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Remove this checklist item?')) removeChecklistMutation.mutate(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-500 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </label>
                  ))}
                  {/* Add new checklist item */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newChecklistItem.trim()) {
                          e.preventDefault();
                          addChecklistMutation.mutate(newChecklistItem.trim());
                        }
                      }}
                      placeholder="Add a checklist item..."
                      className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    />
                    <button
                      onClick={() => newChecklistItem.trim() && addChecklistMutation.mutate(newChecklistItem.trim())}
                      disabled={!newChecklistItem.trim() || addChecklistMutation.isPending}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
            <div className="space-y-3">
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Course Details</h3>
                <div className="space-y-3">
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
                    <div key={row.label} className="flex justify-between gap-3">
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      <span className="text-xs font-medium text-foreground text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {course.description && (
                <div className="bg-card border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-2">About This Program</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{course.description}</p>
                </div>
              )}

              {course.requirements && (
                <div className="bg-card border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-2">Requirements</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{course.requirements}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{app.documents.length} Document{app.documents.length !== 1 ? 's' : ''}</h3>
              <button
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Document
              </button>
            </div>

            {app.documents.length === 0 ? (
              <div className="empty-state bg-card border rounded-xl">
                <div className="empty-state-icon"><FileText className="w-6 h-6 text-muted-foreground" /></div>
                <p className="text-sm font-medium">No documents uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Upload your SOP, CV, transcripts and other documents here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {app.documents.map((doc) => (
                  <div key={doc.id} className="bg-card border rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{DOC_TYPE_LABELS[doc.type] || doc.type}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{doc.originalName}</p>
                      <p className="text-[10px] text-muted-foreground">v{doc.version} · {formatFileSize(doc.fileSize)} · {formatRelativeTime(doc.uploadedAt)}</p>
                    </div>
                    <a href={documentApi.download(doc.id)} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-3.5 h-3.5" />
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
          <div className="space-y-4">
            {/* Add note */}
            <div className="bg-card border rounded-xl p-4 flex gap-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a timeline note..."
                rows={2}
                className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
              />
              <button
                onClick={() => newNote.trim() && addNoteMutation.mutate()}
                disabled={!newNote.trim() || addNoteMutation.isPending}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 self-end"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline entries */}
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-3 pl-12">
                {app.timeline.map((entry) => {
                  const cfg = TIMELINE_TYPE_CONFIG[entry.type] || TIMELINE_TYPE_CONFIG.NOTE;
                  return (
                    <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="relative bg-card border rounded-xl p-3.5">
                      <div className={cn('absolute -left-9 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-background', cfg.bg)}>
                        {cfg.icon}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{entry.action}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatRelativeTime(entry.createdAt)}</span>
                      </div>
                      {entry.description && <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>}
                    </motion.div>
                  );
                })}
                {app.timeline.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">No timeline entries yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="space-y-4">
            {/* SOP Prompt */}
            <div className="bg-card border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    SOP Prompt Generator
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Copy this prompt into ChatGPT, Claude, or Gemini to generate your Statement of Purpose
                  </p>
                </div>
                <button
                  onClick={copyPrompt}
                  disabled={!promptData}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-muted disabled:opacity-50"
                >
                  {promptCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {promptCopied ? 'Copied!' : 'Copy prompt'}
                </button>
              </div>

              {promptLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 rounded" />)}
                </div>
              ) : promptData ? (
                <div className="bg-muted/50 rounded-xl p-4 border">
                  <pre className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto max-h-[500px] overflow-y-auto">
                    {promptData.prompt}
                  </pre>
                </div>
              ) : (
                <button onClick={() => fetchPrompt()} className="w-full py-8 rounded-xl border-2 border-dashed text-sm text-muted-foreground hover:border-indigo-300 hover:text-indigo-600 transition-all">
                  Click to generate SOP prompt
                </button>
              )}
            </div>

            {/* Email Template Generator */}
            <div className="bg-card border rounded-xl p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                ✉️ Email Template Generator
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Generate professional email templates for different stages of your application.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'inquiry', label: '📩 Inquiry', desc: 'Ask about the program' },
                  { key: 'status', label: '📋 Follow-up', desc: 'Check application status' },
                  { key: 'acceptance', label: '🎉 Acceptance', desc: 'Confirm your acceptance' },
                ].map((tmpl) => (
                  <button
                    key={tmpl.key}
                    onClick={() => {
                      setEmailType(tmpl.key);
                      emailMutation.mutate(tmpl.key);
                    }}
                    disabled={emailMutation.isPending}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                      emailType === tmpl.key && emailPrompt
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-border hover:border-indigo-300 hover:bg-muted',
                    )}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
              {emailMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </div>
              )}
              {emailPrompt && !emailMutation.isPending && (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-xl p-4 border">
                    <pre className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto max-h-[300px] overflow-y-auto">
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-muted transition-all"
                  >
                    {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {emailCopied ? 'Copied!' : 'Copy email prompt'}
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
      className={cn('inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium bg-muted text-muted-foreground border-border', onClick && 'cursor-pointer hover:opacity-80', className)}
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
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Notes</h3>
        {isSaving && <span className="text-[10px] text-muted-foreground animate-pulse">Saving...</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes about this application..."
        rows={4}
        className="w-full px-3 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
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
