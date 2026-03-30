'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useSyncStore } from '@/store/sync.store';
import { useAuthStore } from '@/store/auth.store';
import { formatDistanceToNow } from 'date-fns';

export default function SyncButton() {
  const { user, isLocalMode } = useAuthStore();
  const { status, lastSyncedAt, error, pushToCloud } = useSyncStore();

  // Don't show in local mode or when not authenticated
  if (isLocalMode || !user) return null;

  const isLoading = status === 'pushing' || status === 'pulling';

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => !isLoading && pushToCloud()}
        disabled={isLoading}
        className="relative flex items-center gap-2 px-3 py-2 rounded-lg
          text-sm font-medium transition-all duration-200
          hover:bg-muted text-muted-foreground hover:text-foreground
          disabled:opacity-60"
        title={lastSyncedAt ? `Last synced ${formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}` : 'Sync to cloud'}
      >
        <AnimatePresence mode="wait">
          {status === 'done' ? (
            <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="w-4 h-4 text-emerald-500" />
            </motion.div>
          ) : status === 'error' ? (
            <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Cloud className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>

        <span className="hidden sm:inline text-xs truncate max-w-[120px]">
          {isLoading 
            ? 'Syncing…' 
            : status === 'error' 
              ? 'Retry' 
              : lastSyncedAt 
                ? formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })
                : 'Sync to cloud'}
        </span>
      </motion.button>

      {/* Error tooltip */}
      <AnimatePresence>
        {status === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full right-0 mt-2 px-3 py-2 rounded-lg
              bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs
              whitespace-nowrap z-50"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
