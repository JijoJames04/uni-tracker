// ─────────────────────────────────────────────────────────────────
// Scraper Utilities — Parsing, normalization, confidence helpers
// ─────────────────────────────────────────────────────────────────

import type { Extraction, StructuredData, KVPairs } from './scraper.types';
import { MONTH_MAP, DEGREE_CANONICAL } from './scraper.constants';
import * as cheerio from 'cheerio';

// ═══════════════════════════════════════════════════════════════
// Confidence-based selection
// ═══════════════════════════════════════════════════════════════

/** Pick the highest-confidence non-empty extraction */
export function pickBest<T>(extractions: Extraction<T>[]): T | undefined {
  const valid = extractions
    .filter((e) => e.value !== null && e.value !== undefined && e.value !== '' && e.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);
  return valid.length > 0 ? valid[0].value : undefined;
}

/** Pick the highest-confidence non-empty string extraction, with fallback */
export function pickBestStr(extractions: Extraction<string>[], fallback = ''): string {
  return pickBest(extractions) ?? fallback;
}

/** Pick the highest-confidence non-null number extraction */
export function pickBestNum(extractions: Extraction<number | null>[]): number | null {
  return pickBest(extractions) ?? null;
}

/** Create a typed extraction result */
export function ext<T>(value: T, confidence: number, source: string): Extraction<T> {
  return { value, confidence, source };
}

// ═══════════════════════════════════════════════════════════════
// Structured Data Extraction (JSON-LD, OpenGraph, Microdata)
// ═══════════════════════════════════════════════════════════════

export function extractStructuredData($: cheerio.CheerioAPI): StructuredData {
  const result: StructuredData = {
    jsonLd: [],
    og: {},
    twitter: {},
    microdata: {},
    meta: {},
  };

  // ── JSON-LD ──
  try {
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const text = $(el).html();
        if (!text) return;
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : [data];
        // Also handle @graph arrays
        for (const item of items) {
          if (item['@graph'] && Array.isArray(item['@graph'])) {
            result.jsonLd.push(...item['@graph']);
          } else {
            result.jsonLd.push(item);
          }
        }
      } catch { /* skip malformed JSON-LD blocks */ }
    });
  } catch { /* skip */ }

  // ── OpenGraph meta ──
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr('property')?.replace('og:', '') || '';
    const content = $(el).attr('content')?.trim() || '';
    if (prop && content) result.og[prop] = content;
  });

  // ── Twitter Card meta ──
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr('name')?.replace('twitter:', '') || '';
    const content = $(el).attr('content')?.trim() || '';
    if (name && content) result.twitter[name] = content;
  });

  // ── Standard meta ──
  $('meta[name]').each((_, el) => {
    const name = $(el).attr('name')?.trim().toLowerCase() || '';
    const content = $(el).attr('content')?.trim() || '';
    if (name && content && !name.startsWith('twitter:')) {
      result.meta[name] = content;
    }
  });

  // ── Microdata (Schema.org itemprop) ──
  $('[itemprop]').each((_, el) => {
    const prop = $(el).attr('itemprop')?.trim() || '';
    const content = $(el).attr('content')?.trim() || $(el).text().replace(/\s+/g, ' ').trim();
    if (prop && content && content.length < 500) {
      result.microdata[prop] = content;
    }
  });

  return result;
}

/** Find a JSON-LD object by @type */
export function findJsonLdByType(sd: StructuredData, ...types: string[]): any {
  for (const type of types) {
    const found = sd.jsonLd.find((item) => {
      const itemType = item['@type'];
      if (Array.isArray(itemType)) return itemType.includes(type);
      return itemType === type;
    });
    if (found) return found;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Key-Value Pair Extraction
// ═══════════════════════════════════════════════════════════════

export function extractKeyValuePairs($: cheerio.CheerioAPI): KVPairs {
  const kv: KVPairs = new Map();

  // From definition lists (<dl><dt>...<dd>...)
  $('dl').each((_, dl) => {
    $(dl).find('dt').each((_, dt) => {
      const key = $(dt).text().replace(/\s+/g, ' ').trim().toLowerCase().replace(/:$/, '');
      const dd = $(dt).nextAll('dd').first();
      const val = dd.text().replace(/\s+/g, ' ').trim();
      if (key && val && key.length < 80 && val.length < 500) kv.set(key, val);
    });
  });

  // From 2-column tables (label | value)
  $('table').each((_, table) => {
    $(table).find('tr').each((_, tr) => {
      const cells = $(tr).find('td, th');
      if (cells.length === 2) {
        const key = $(cells[0]).text().replace(/\s+/g, ' ').trim().toLowerCase().replace(/:$/, '');
        const val = $(cells[1]).text().replace(/\s+/g, ' ').trim();
        if (key && val && key.length < 80 && val.length < 500) kv.set(key, val);
      }
    });
  });

  // From labeled paragraphs/divs: "Label: Value"
  $('li, p, div, span').each((_, el) => {
    const text = $(el).clone().children().remove().end().text().trim();
    const m = text.match(/^([A-Za-zÄÖÜäöüß\s/&-]{3,40}):\s*(.{2,200})$/);
    if (m) {
      const key = m[1].trim().toLowerCase();
      const val = m[2].trim();
      if (!kv.has(key)) kv.set(key, val);
    }
  });

  // From aria-label or data-label attributes
  $('[data-label], [aria-label]').each((_, el) => {
    const key = ($(el).attr('data-label') || $(el).attr('aria-label') || '').trim().toLowerCase();
    const val = $(el).text().replace(/\s+/g, ' ').trim();
    if (key && val && key.length < 80 && val.length < 500 && !kv.has(key)) {
      kv.set(key, val);
    }
  });

  return kv;
}

/** Search KV map for a value by regex key pattern */
export function kvLookup(kv: KVPairs, keyPattern: RegExp): string | undefined {
  for (const [k, v] of kv) {
    if (keyPattern.test(k)) return v;
  }
  return undefined;
}

// ═══════════════════════════════════════════════════════════════
// Number Parsing (handles German 1.500,00 and US 1,500.00)
// ═══════════════════════════════════════════════════════════════

export function parseNumber(str: string | undefined | null): number | null {
  if (!str) return null;
  let cleaned = str.replace(/\s/g, '').replace(/[€$£]/g, '');

  // German: "1.500,00"
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // US: "1,500.00"
  else if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, '');
  }
  // Simple comma decimal: "300,50"
  else if (/^\d+,\d{1,2}$/.test(cleaned)) {
    cleaned = cleaned.replace(',', '.');
  }
  // Remove any remaining non-numeric except dot
  cleaned = cleaned.replace(/[^0-9.]/g, '');

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/** Extract a number from text using a regex */
export function extractNumber(text: string, pattern: RegExp): number | null {
  const m = text.match(pattern);
  if (!m) return null;
  const raw = m[1] || m[0];
  return parseNumber(raw);
}

// ═══════════════════════════════════════════════════════════════
// Date Parsing (ISO, European, German, English natural language)
// ═══════════════════════════════════════════════════════════════

export function parseDateString(str: string | undefined | null): string | null {
  if (!str) return null;
  const s = str.trim().replace(/,/g, '');

  // ISO: 2026-07-15
  let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

  // DD.MM.YYYY / DD/MM/YYYY / DD-MM-YYYY
  m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;

  // DD.MM.YY
  m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2})(?!\d)/);
  if (m) {
    const year = parseInt(m[3]) < 50 ? 2000 + parseInt(m[3]) : 1900 + parseInt(m[3]);
    return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }

  // "15 July 2026" / "15. Juli 2026"
  m = s.match(/(\d{1,2})\.?\s+(\w+)\s+(\d{4})/);
  if (m) {
    const month = MONTH_MAP[m[2].toLowerCase()];
    if (month !== undefined) return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }

  // "July 15, 2026" / "July 15 2026"
  m = s.match(/(\w+)\s+(\d{1,2})\s+(\d{4})/);
  if (m) {
    const month = MONTH_MAP[m[1].toLowerCase()];
    if (month !== undefined) return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  }

  // "15th July 2026" / "1st March 2026"
  m = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)\s+(\d{4})/);
  if (m) {
    const month = MONTH_MAP[m[2].toLowerCase()];
    if (month !== undefined) return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }

  return null;
}

/** Get the next occurrence of a specific month/day deadline */
export function nextDeadline(month: number, day: number): string {
  const now = new Date();
  let year = now.getFullYear();
  const dl = new Date(year, month - 1, day);
  if (dl < now) year++;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════════════
// Text Normalization Utilities
// ═══════════════════════════════════════════════════════════════

/** Clean a university name: strip junk, breadcrumbs, page suffixes */
export function cleanUniversityName(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  // Remove trailing breadcrumbs
  let clean = raw.split(/[|\n\/]| - | – | — | \| /)[0].trim();
  // Remove page suffix junk
  clean = clean.replace(
    /\s*[-–—]?\s*(study\s*programs?|studiengang|studienangebot|faculty\s*of|department\s*of|courses?|programs?|page|home|website|official|portal|degrees?|master|bachelor|startseite|willkommen|welcome).*$/i,
    '',
  ).trim();
  // Remove trailing punctuation
  clean = clean.replace(/[,;:.]+$/, '').trim();
  // Collapse whitespace
  clean = clean.replace(/\s+/g, ' ');
  // Hard cap
  if (clean.length > 80) {
    const shorter = clean.split(/[,.]\s/)[0].trim();
    if (shorter.length > 5 && shorter.length <= 80) return shorter;
    return clean.substring(0, 80).trim();
  }
  return clean;
}

/** Clean a course name: strip marketing prose, normalize whitespace */
export function cleanCourseName(raw: string): string {
  if (!raw) return '';
  let name = raw.replace(/\s+/g, ' ').trim();
  // Cut at separator
  name = name.split(/\s+[|–—]\s+/)[0].trim();
  // Cut before common prose intro words
  name = name.replace(
    /\s+(?:if|with|for|to|in|is|are|we|you|our|this|that|it|by|from|about|on|at|learn|discover|find|join|become|get|start|study|build|make|create|develop|explore|apply|lead|shape|design|be|do|let|have|take|use|the\s+programme)\b.*/i,
    '',
  ).trim();
  // Remove trailing punctuation
  name = name.replace(/[,;:.!?]+$/, '').trim();
  // Hard cap
  if (name.length > 120) name = name.substring(0, 120).trim();
  return name;
}

/** Normalize a degree string to a canonical form */
export function normalizeDegree(raw: string): string {
  if (!raw) return '';
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\./g, '').replace(/\s/g, ' ');
  // Try exact match first
  if (DEGREE_CANONICAL[key]) return DEGREE_CANONICAL[key];
  // Try with dots
  const withDots = raw.trim().toLowerCase();
  if (DEGREE_CANONICAL[withDots]) return DEGREE_CANONICAL[withDots];
  // Return cleaned original
  return raw.trim();
}

/** Normalize duration string to consistent format */
export function normalizeDuration(raw: string): string {
  if (!raw) return '';
  const m = raw.match(/(\d+)\s*(semester|year|jahr|term)/i);
  if (!m) return raw.trim();
  const num = parseInt(m[1]);
  const unit = m[2].toLowerCase();
  if (unit === 'year' || unit === 'jahr') return `${num * 2} semesters`;
  if (unit === 'semester') return `${num} semester${num > 1 ? 's' : ''}`;
  return raw.trim();
}

/** Resolve a relative URL against a base */
export function resolveUrl(href: string, baseUrl: string): string {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  if (href.startsWith('//')) return 'https:' + href;
  if (href.startsWith('/')) return baseUrl + href;
  return baseUrl + '/' + href;
}
