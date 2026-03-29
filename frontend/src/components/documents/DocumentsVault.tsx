'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { applicationApi, documentApi } from '@/lib/api';
import { FileText, Upload, ExternalLink, FolderOpen, Filter } from 'lucide-react';
import { cn, DOC_TYPE_LABELS, formatFileSize, formatRelativeTime } from '@/lib/utils';
import { UniversityLogo } from '@/components/shared/UniversityLogo';
import { DocumentUpload } from './DocumentUpload';
import { Skeleton } from '@/components/shared/Skeleton';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CheckCircle2, Circle, Download, RefreshCw } from 'lucide-react';

const STANDARD_REQUIRED_DOCS = [
  { type: 'PASSPORT', label: 'Valid Passport (Copy only)' },
  { type: 'CV', label: 'CV / Resume (Copy only)' },
  { type: 'TRANSCRIPT', label: 'Academic Transcripts (Copy only)' },
  { type: 'BACHELOR_CERTIFICATE', label: 'Bachelor Certificate (Copy only)' },
  { type: 'SOP', label: 'SOP / Motivation Letter' },
  { type: 'LANGUAGE_CERT_IELTS', label: 'Language Certificate (Copy only)' },
  { type: 'RECOMMENDATION_LETTER', label: 'Recommendation Letter' },
];

export function DocumentsVault() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [isZipping, setIsZipping]     = useState(false);
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationApi.getAll,
  });

  const allDocs = applications.flatMap((app) =>
    app.documents.map((doc) => ({ ...doc, application: app })),
  );

  const filtered = selectedApp
    ? allDocs.filter((d) => d.applicationId === selectedApp)
    : allDocs;

  const totalDocs  = allDocs.length;
  const totalSize  = allDocs.reduce((s, d) => s + d.fileSize, 0);

  const FADE = {
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
  };

  const handleZipDownload = async () => {
    if (!filtered.length) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const promises = filtered.map(async (doc) => {
        try {
          const res = await fetch(documentApi.download(doc.id));
          const blob = await res.blob();
          let name = doc.originalName;
          if (zip.file(name)) name = `${doc.id.slice(0, 6)}-${name}`;
          zip.file(name, blob);
        } catch (e) {
          console.error(`Failed to fetch ${doc.originalName}`, e);
        }
      });
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, selectedApp ? 'application-documents.zip' : 'all-documents.zip');
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Documents', value: totalDocs,                    icon: FileText,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Storage Used',    value: formatFileSize(totalSize),    icon: FolderOpen,color: 'text-amber-600',  bg: 'bg-amber-50'  },
          { label: 'Applications',    value: applications.length,          icon: Filter,    color: 'text-emerald-600',bg: 'bg-emerald-50'},
        ].map((s, i) => (
          <motion.div key={s.label} variants={FADE} initial="hidden" animate="visible" custom={i}
            className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-inner bg-gradient-to-br', 
              i === 0 ? 'from-indigo-50 to-indigo-100/50 dark:from-indigo-500/20 dark:to-indigo-500/10' : 
              i === 1 ? 'from-amber-50 to-amber-100/50 dark:from-amber-500/20 dark:to-amber-500/10' : 
              'from-emerald-50 to-emerald-100/50 dark:from-emerald-500/20 dark:to-emerald-500/10'
            )}>
              <s.icon className={cn('w-5 h-5', s.color)} />
            </div>
            <p className="text-2xl font-black text-foreground tracking-tight">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Application filter sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Filter by Application
          </p>
          <button
            onClick={() => setSelectedApp(null)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left group',
              !selectedApp 
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 border-transparent' 
                : 'bg-card border border-border/50 hover:bg-card hover:shadow-sm hover:border-border text-muted-foreground hover:text-foreground',
            )}
          >
            <FolderOpen className={cn("w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110", !selectedApp ? "text-indigo-100" : "")} />
            <span className="flex-1 truncate tracking-wide">All Documents</span>
            <span className={cn('text-xs font-bold rounded-full px-2 py-0.5 shadow-sm', !selectedApp ? 'bg-white/20 text-white' : 'bg-background border border-border/50 text-foreground')}>
              {totalDocs}
            </span>
          </button>

          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)
            : applications.filter((a) => a.documents.length > 0).map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app.id === selectedApp ? null : app.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left group',
                  selectedApp === app.id
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 border-transparent'
                    : 'bg-card border border-border/50 hover:bg-card hover:shadow-sm hover:border-border text-muted-foreground hover:text-foreground',
                )}
              >
                <div className={cn("p-1 rounded-lg bg-background shadow-sm", selectedApp === app.id ? "bg-white border-none" : "border border-border/50")}>
                  <UniversityLogo url={app.course.university.logoUrl} name={app.course.university.name} size="xs" className="flex-shrink-0" />
                </div>
                <span className="flex-1 truncate text-sm tracking-tight">{app.course.university.name}</span>
                <span className={cn('text-xs font-bold rounded-full px-2 py-0.5 shadow-sm flex-shrink-0', selectedApp === app.id ? 'bg-white/20 text-white' : 'bg-background border border-border/50 text-foreground')}>
                  {app.documents.length}
                </span>
              </button>
            ))
          }

          {/* Checklist Panel (Always Visible) */}
          <div className="pt-4 mt-4 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
              {selectedApp ? 'Application Readiness Checklist' : 'Central Documents Checklist'}
            </p>
            <div className="space-y-1.5 bg-card border border-border/50 p-4 rounded-2xl shadow-sm">
              {STANDARD_REQUIRED_DOCS.map((req) => {
                // We map 'SOP' to also accept 'MOTIVATION_LETTER', and 'LANGUAGE_CERT_IELTS' for any language tests
                const isSOP = req.type === 'SOP';
                const isLang = req.type === 'LANGUAGE_CERT_IELTS';
                const hasDoc = filtered.some((d) => 
                  d.type === req.type || 
                  (isSOP && d.type === 'MOTIVATION_LETTER') ||
                  (isLang && d.type.startsWith('LANGUAGE_CERT_'))
                );
                return (
                  <div key={req.type} className="flex items-center gap-3 text-sm font-medium">
                    {hasDoc 
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      : <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                    }
                    <span className={cn('truncate transition-all', hasDoc ? 'text-foreground' : 'text-muted-foreground')}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Documents grid */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length} document{filtered.length !== 1 ? 's' : ''}
              {selectedApp && applications.find((a) => a.id === selectedApp) && (
                <span className="ml-1.5 text-foreground font-medium">
              — {applications.find((a) => a.id === selectedApp)?.course.name}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZipDownload}
                disabled={filtered.length === 0 || isZipping}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm",
                  filtered.length === 0 || isZipping 
                    ? "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-70"
                    : "bg-background border-border/50 hover:bg-muted text-foreground"
                )}
              >
                {isZipping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {isZipping ? 'Zipping...' : 'Zip All'}
              </button>
              
              {selectedApp && (
                <button
                  onClick={() => setUploadOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state bg-card border rounded-2xl min-h-[300px]">
              <div className="empty-state-icon"><FileText className="w-6 h-6 text-muted-foreground" /></div>
              <p className="text-sm font-medium text-foreground">No documents yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Select an application to upload documents.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  variants={FADE} initial="hidden" animate="visible" custom={i}
                  className="bg-card border border-border/50 rounded-2xl p-4 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-500/20 dark:to-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        {DOC_TYPE_LABELS[doc.type] || doc.type}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{doc.originalName}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                          v{doc.version}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                        <span className="text-[10px] text-muted-foreground">{formatRelativeTime(doc.uploadedAt)}</span>
                      </div>
                      {!selectedApp && (
                        <p className="text-[10px] text-indigo-600 mt-1 truncate">
                          {doc.application.course.university.name}
                        </p>
                      )}
                    </div>
                    <a
                      href={documentApi.download(doc.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <DocumentUpload
          applicationId={selectedApp}
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
}
