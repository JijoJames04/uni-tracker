'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { applicationApi, documentApi } from '@/lib/api';
import type { Application } from '@/lib/api';
import { FileText, Upload, ExternalLink, FolderOpen, Filter } from 'lucide-react';
import { cn, DOC_TYPE_LABELS, formatFileSize, formatRelativeTime } from '@/lib/utils';
import { UniversityLogo } from '@/components/shared/UniversityLogo';
import { DocumentUpload } from './DocumentUpload';
import { Skeleton } from '@/components/shared/Skeleton';

export function DocumentsVault() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen]   = useState(false);
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
            className="bg-card border rounded-xl p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', s.bg)}>
              <s.icon className={cn('w-4 h-4', s.color)} />
            </div>
            <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
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
              'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
              !selectedApp ? 'bg-indigo-600 text-white shadow-sm' : 'bg-card border hover:bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate">All Documents</span>
            <span className={cn('text-[11px] rounded-full px-1.5 py-0.5', !selectedApp ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground')}>
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
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  selectedApp === app.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-card border hover:bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                <UniversityLogo url={app.course.university.logoUrl} name={app.course.university.name} size="xs" className="flex-shrink-0" />
                <span className="flex-1 truncate text-xs">{app.course.university.name}</span>
                <span className={cn('text-[11px] rounded-full px-1.5 py-0.5 flex-shrink-0', selectedApp === app.id ? 'bg-white/20 text-white' : 'bg-muted')}>
                  {app.documents.length}
                </span>
              </button>
            ))
          }
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
            {selectedApp && (
              <button
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
            )}
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
                  className="bg-card border rounded-xl p-4 hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
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
