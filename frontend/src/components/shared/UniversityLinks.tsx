'use client';

import { motion } from 'framer-motion';
import { Globe, Linkedin, Instagram, ExternalLink, BookOpen, GraduationCap } from 'lucide-react';

interface UniversityLinksProps {
  website?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  universityName: string;
  className?: string;
  showFinderLinks?: boolean;
}

const UNIVERSITY_FINDER_LINKS = [
  {
    name: 'DAAD',
    url: 'https://www.daad.de/en/',
    description: 'German Academic Exchange Service — Comprehensive database of all study programmes in Germany. Search by subject, degree type, and language.',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:border-blue-500/20',
  },
  {
    name: 'My German University',
    url: 'https://www.mygermanuniversity.com',
    description: 'Personalized university matching tool. Get recommendations based on your profile, grades, and preferences.',
    icon: <GraduationCap className="w-4 h-4" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border-emerald-500/20',
  },
];

export default function UniversityLinks({
  website,
  linkedinUrl,
  instagramUrl,
  universityName,
  className = '',
  showFinderLinks = false,
}: UniversityLinksProps) {
  const socialLinks = [
    { url: website, label: 'Official Website', icon: <Globe className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400' },
    { url: linkedinUrl, label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, color: 'text-sky-600 dark:text-sky-400' },
    { url: instagramUrl, label: 'Instagram', icon: <Instagram className="w-4 h-4" />, color: 'text-pink-600 dark:text-pink-400' },
  ].filter(l => l.url);

  return (
    <div className={`space-y-4 ${className}`} id="university-links">
      {/* Official Links */}
      {socialLinks.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {universityName} — Official Links
          </p>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border transition-all text-sm ${link.color}`}
                id={`uni-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.icon}
                <span className="text-foreground">{link.label}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
              </motion.a>
            ))}
          </div>
        </div>
      )}

      {/* University Finder Links (F07) */}
      {showFinderLinks && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            🔍 Find Universities & Courses
          </p>
          <div className="space-y-2">
            {UNIVERSITY_FINDER_LINKS.map((finder) => (
              <motion.a
                key={finder.name}
                href={finder.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 4 }}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all shadow-sm hover:shadow-md ${finder.bgClass}`}
                id={`finder-link-${finder.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`mt-0.5 ${finder.color}`}>{finder.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${finder.color}`}>{finder.name}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{finder.description}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
