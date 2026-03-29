'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { documentApi } from '@/lib/api';
import { DOC_TYPE_LABELS } from '@/lib/utils';
import type { DocumentType } from '@/lib/api';
import { toast } from 'sonner';
import { Upload, X, Loader2, Check } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';

const DOC_TYPES = Object.entries(DOC_TYPE_LABELS) as [DocumentType, string][];

interface Props {
  applicationId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUpload({ applicationId, open, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>('SOP');
  const [notes, setNotes] = useState('');

  const uploadMutation = useMutation({
    mutationFn: () => documentApi.upload(applicationId, docType, file!, notes || undefined),
    onSuccess: () => {
      toast.success('Document uploaded!');
      onSuccess();
      handleClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  function handleClose() {
    setFile(null);
    setNotes('');
    setDocType('SOP');
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-50 bg-card border rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-sm font-bold text-foreground">Upload Document</h2>
              <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Document type */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  {DOC_TYPES.map(([type, label]) => (
                    <option key={type} value={type}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                  isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-border hover:border-indigo-300 hover:bg-muted/50',
                  file && 'border-emerald-500 bg-emerald-50',
                )}
              >
                <input {...getInputProps()} />
                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 justify-center">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="ml-2 p-1 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Upload className={cn('w-8 h-8 mx-auto mb-2', isDragActive ? 'text-indigo-500' : 'text-muted-foreground')} />
                      <p className="text-sm font-medium text-foreground">
                        {isDragActive ? 'Drop file here' : 'Drop file or click to browse'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, images — max 10MB</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Final version, Proofread by..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={handleClose} className="flex-1 py-2.5 rounded-lg border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => uploadMutation.mutate()}
                  disabled={!file || uploadMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadMutation.isPending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-3.5 h-3.5" /> Upload</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
