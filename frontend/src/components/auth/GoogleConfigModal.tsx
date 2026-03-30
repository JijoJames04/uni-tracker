'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, X, ExternalLink, ShieldAlert, ArrowRight } from 'lucide-react';

interface GoogleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string) => void;
}

export function GoogleConfigModal({ isOpen, onClose, onSave }: GoogleConfigModalProps) {
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const saved = localStorage.getItem('CUSTOM_GOOGLE_CLIENT_ID');
      if (saved) setClientId(saved);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-800">
                Setup Google Drive Sync
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                To sync data directly to your personal Google Drive for free, you need to provide your own <strong>Google OAuth Client ID</strong>. This ensures your data remains completely private and independent.
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">How to get your free Client ID:</p>
              <ol className="list-decimal list-outside ml-4 space-y-2">
                <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
                <li>Create a new project (e.g., &quot;UniTracker Sync&quot;)</li>
                <li>Go to <strong>OAuth consent screen</strong> and configure it as &quot;External&quot;</li>
                <li>Go to <strong>Credentials</strong> &gt; Create Credentials &gt; <strong>OAuth client ID</strong></li>
                <li>Choose <strong>Web application</strong></li>
                <li>Add <code className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-500 font-mono text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}</code> to <strong>Authorized JavaScript origins</strong></li>
                <li>Add <code className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-500 font-mono text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback</code> to <strong>Authorized redirect URIs</strong></li>
              </ol>
            </div>

            <div className="space-y-2">
              <label htmlFor="clientId" className="block text-sm font-semibold text-slate-700">
                Your Google Client ID
              </label>
              <input
                id="clientId"
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm"
                placeholder="1234567890-abcdefg...apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Stored securely in your local browser storage.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(clientId.trim())}
              disabled={!clientId.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm shadow-indigo-600/20"
            >
              Save & Authenticate
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
