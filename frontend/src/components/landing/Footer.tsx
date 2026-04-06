'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Heart, Code2 as Github } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Applications', href: '/applications' },
    { label: 'Documents', href: '/documents' },
    { label: 'Resources', href: '/resources' },
    { label: 'Calendar', href: '/calendar' },
  ],
  Resources: [
    { label: 'APS Guide', href: '/resources' },
    { label: 'Visa Steps', href: '/resources' },
    { label: 'Blocked Account Calc', href: '/resources' },
    { label: 'DHL Finder', href: '/resources' },
    { label: 'Find Universities', href: '/resources' },
  ],
  About: [
    { label: 'Why UniTracker?', href: '#why-unitracker' },
    { label: 'Features', href: '#features' },
    { label: 'Free Forever', href: '#why-unitracker' },
    { label: 'Privacy', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#060D1A]" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-black text-xl tracking-tight">UniTracker</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              The free, all-in-one platform for international students applying to German universities. Built with love for the global student community.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/JijoJames04/uni-tracker"
                target="_blank"
                rel="noopener noreferrer"
                title="View source on GitHub"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all text-sm font-medium"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-white font-bold text-sm mb-4 tracking-wide">{heading}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} UniTracker. All rights reserved. Built for international students, by international students.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-600 text-xs flex items-center gap-1.5"
          >
            Made with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for students going to Germany
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
