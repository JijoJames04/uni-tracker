'use client';

import { GraduationCap, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-zinc-300 text-sm">UniTracker</span>
        </div>

        <p className="text-xs text-zinc-600 flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-rose-500" /> for students going to Germany
        </p>

        <a
          href="https://github.com/JijoJames04/uni-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
    </footer>
  );
}
