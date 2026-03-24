'use client';

import { motion } from 'framer-motion';
import { Home, ExternalLink, Phone, MapPin, Building2 } from 'lucide-react';

interface DormAccommodationProps {
  universityName: string;
  city?: string;
  className?: string;
}

// Common Studentenwerk links for major German cities
const STUDENTENWERK_MAP: Record<string, { name: string; url: string; phone?: string }> = {
  'Munich': { name: 'Studierendenwerk München', url: 'https://www.studierendenwerk-muenchen-oberbayern.de/en/', phone: '+49 89 38196-0' },
  'München': { name: 'Studierendenwerk München', url: 'https://www.studierendenwerk-muenchen-oberbayern.de/en/', phone: '+49 89 38196-0' },
  'Berlin': { name: 'Studierendenwerk Berlin', url: 'https://www.stw.berlin/en/', phone: '+49 30 93939-0' },
  'Hamburg': { name: 'Studierendenwerk Hamburg', url: 'https://www.studierendenwerk-hamburg.de/en', phone: '+49 40 41902-0' },
  'Stuttgart': { name: 'Studierendenwerk Stuttgart', url: 'https://www.sw-stuttgart.de/en/', phone: '+49 711 4470-0' },
  'Karlsruhe': { name: 'Studierendenwerk Karlsruhe', url: 'https://www.sw-ka.de/en/', phone: '+49 721 6909-0' },
  'Heidelberg': { name: 'Studierendenwerk Heidelberg', url: 'https://www.stw.uni-heidelberg.de', phone: '+49 6221 54-0' },
  'Aachen': { name: 'Studierendenwerk Aachen', url: 'https://www.studierendenwerk-aachen.de', phone: '+49 241 80-93200' },
  'Frankfurt': { name: 'Studierendenwerk Frankfurt', url: 'https://www.studentenwerkfrankfurt.de', phone: '+49 69 798-0' },
  'Dresden': { name: 'Studierendenwerk Dresden', url: 'https://www.studentenwerk-dresden.de', phone: '+49 351 4697-50' },
  'Darmstadt': { name: 'Studierendenwerk Darmstadt', url: 'https://www.studierendenwerk-darmstadt.de', phone: '+49 6151 16-29900' },
  'Bonn': { name: 'Studierendenwerk Bonn', url: 'https://www.studierendenwerk-bonn.de', phone: '+49 228 73-5000' },
  'Freiburg': { name: 'Studierendenwerk Freiburg', url: 'https://www.swfr.de', phone: '+49 761 2101-200' },
  'Hannover': { name: 'Studierendenwerk Hannover', url: 'https://www.studentenwerk-hannover.de', phone: '+49 511 76-88922' },
  'Cologne': { name: 'Kölner Studierendenwerk', url: 'https://www.kstw.de/en/', phone: '+49 221 94265-0' },
  'Köln': { name: 'Kölner Studierendenwerk', url: 'https://www.kstw.de/en/', phone: '+49 221 94265-0' },
  'Leipzig': { name: 'Studierendenwerk Leipzig', url: 'https://www.studentenwerk-leipzig.de', phone: '+49 341 9659-5' },
  'Göttingen': { name: 'Studierendenwerk Göttingen', url: 'https://www.studentenwerk-goettingen.de', phone: '+49 551 39-5111' },
  'Erlangen': { name: 'Studierendenwerk Erlangen-Nürnberg', url: 'https://www.werkswelt.de', phone: '+49 9131 8002-0' },
  'Braunschweig': { name: 'Studierendenwerk OstNiedersachsen', url: 'https://www.stw-on.de', phone: '+49 531 391-4807' },
  'Münster': { name: 'Studierendenwerk Münster', url: 'https://www.stw-muenster.de', phone: '+49 251 83-77000' },
  'Augsburg': { name: 'Studierendenwerk Augsburg', url: 'https://www.studentenwerk-augsburg.de', phone: '+49 821 598-4900' },
};

const ACCOMMODATION_LINKS = [
  { name: 'WG-Gesucht', url: 'https://www.wg-gesucht.de', description: 'Most popular shared flat search in Germany' },
  { name: 'Studenten-WG', url: 'https://www.studenten-wg.de', description: 'Student-specific shared accommodations' },
  { name: 'Immobilienscout24', url: 'https://www.immobilienscout24.de', description: 'Germany\'s largest real estate portal' },
  { name: 'HousingAnywhere', url: 'https://housinganywhere.com', description: 'International student housing platform' },
];

export default function DormAccommodation({ universityName, city, className = '' }: DormAccommodationProps) {
  const studentenwerk = city ? STUDENTENWERK_MAP[city] : null;

  return (
    <div className={`space-y-4 ${className}`} id="dorm-accommodation">
      {/* Studentenwerk (University Housing) */}
      {studentenwerk && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-xl border border-zinc-700/50 p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Building2 className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-200">University Dorm (Studentenwerk)</h4>
              <p className="text-xs text-zinc-400">{studentenwerk.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={studentenwerk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20"
            >
              <Home className="w-3 h-3" /> Apply for Dorm
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            {studentenwerk.phone && (
              <a
                href={`tel:${studentenwerk.phone}`}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50"
              >
                <Phone className="w-3 h-3" /> {studentenwerk.phone}
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Private Accommodation Search */}
      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          🏠 Find Accommodation{city ? ` in ${city}` : ''}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACCOMMODATION_LINKS.map((link) => (
            <a
              key={link.name}
              href={city ? `${link.url}/?city=${encodeURIComponent(city)}` : link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 transition-all group text-xs"
            >
              <div className="flex-1">
                <span className="text-zinc-200 group-hover:text-teal-300 font-medium">{link.name}</span>
                <p className="text-[10px] text-zinc-500 mt-0.5">{link.description}</p>
              </div>
              <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-teal-400 flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
