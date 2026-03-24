'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface AiPlatformLinksProps {
  prompt?: string;
  className?: string;
}

const AI_PLATFORMS = [
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    color: '#10A37F',
    bgClass: 'bg-[#10A37F]/10 hover:bg-[#10A37F]/20 border-[#10A37F]/30',
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" style={{ color: '#10A37F' }}>
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    color: '#D97757',
    bgClass: 'bg-[#D97757]/10 hover:bg-[#D97757]/20 border-[#D97757]/30',
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" style={{ color: '#D97757' }}>
        <path d="M4.709 15.955l4.397-2.508L6.652 8.25 4.71 15.955zm7.753-10.063l-2.453 5.348 5.444.241-2.991-5.589zm-1.335 6.849L6.862 18.29h7.063l-2.798-5.55zm5.106-1.207l-1.85-3.928-2.37 5.283 4.22.018v-1.373zm-8.533 5.57L5.92 18.87c-.19.196-.07.53.2.53h3.86l-2.28-1.296z" />
      </svg>
    ),
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: '#4285F4',
    bgClass: 'bg-[#4285F4]/10 hover:bg-[#4285F4]/20 border-[#4285F4]/30',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 24C12 20.2 11.1 17.55 9.3 15.75C7.5 13.95 4.8 12.9 1 12.75C4.8 12.6 7.5 11.55 9.3 9.75C11.1 7.95 12 5.25 12 1.5C12 5.25 12.9 7.95 14.7 9.75C16.5 11.55 19.2 12.6 23 12.75C19.2 12.9 16.5 13.95 14.7 15.75C12.9 17.55 12 20.2 12 24Z" fill="url(#gemini-gradient)"/>
        <defs>
          <linearGradient id="gemini-gradient" x1="1" y1="12" x2="23" y2="12">
            <stop stopColor="#4285F4"/>
            <stop offset="0.5" stopColor="#9B72CB"/>
            <stop offset="1" stopColor="#D96570"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

export default function AiPlatformLinks({ prompt, className = '' }: AiPlatformLinksProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyAndOpen = async (url: string, index: number) => {
    if (prompt) {
      try {
        await navigator.clipboard.writeText(prompt);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`space-y-2 ${className}`} id="ai-platform-links">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
        Copy prompt & open in
      </p>
      <div className="grid grid-cols-3 gap-2">
        {AI_PLATFORMS.map((platform, index) => (
          <motion.button
            key={platform.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCopyAndOpen(platform.url, index)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${platform.bgClass}`}
            id={`ai-link-${platform.name.toLowerCase()}`}
            title={`Copy prompt & open ${platform.name}`}
          >
            {platform.logo}
            <span className="text-xs font-medium text-zinc-300">{platform.name}</span>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              {copiedIndex === index ? (
                <>
                  <Check className="w-3 h-3 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy & Open
                </>
              )}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
