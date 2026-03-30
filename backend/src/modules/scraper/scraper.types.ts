// ─────────────────────────────────────────────────────────────────
// Scraper Type Definitions
// Confidence-based extraction with source tracking
// ─────────────────────────────────────────────────────────────────

/** A single extraction attempt with confidence scoring */
export interface Extraction<T = string> {
  value: T;
  /** 0..1 — higher means more reliable */
  confidence: number;
  /** Human-readable source label for debugging */
  source: string;
}

/** Final output returned by the scraper */
export interface ScrapedCourseData {
  universityName: string;
  courseName: string;
  description: string;
  degree: string;
  language: string;
  duration: string;
  fees: number | null;
  feesPerSemester: number | null;
  currency: string;
  deadline: string | null;
  deadlineInternational: string | null;
  deadlineLabel: string | null;
  startDate: string | null;
  applicationUrl: string;
  sourceUrl: string;
  logoUrl: string | null;
  address: string;
  city: string;
  ects: number | null;
  applicationVia: 'DIRECT' | 'UNI_ASSIST' | 'BOTH';
  uniAssistInfo: string;
  requirements: string;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string;
  latitude: number | null;
  longitude: number | null;
}

/** Parsed structured data extracted from HTML (JSON-LD, microdata, etc.) */
export interface StructuredData {
  /** JSON-LD objects found on the page */
  jsonLd: any[];
  /** OpenGraph meta values */
  og: Record<string, string>;
  /** Twitter Card meta values */
  twitter: Record<string, string>;
  /** Schema.org microdata (itemprop → text) */
  microdata: Record<string, string>;
  /** Standard meta tags */
  meta: Record<string, string>;
}

/** Key-value pairs extracted from tables, definition lists, etc. */
export type KVPairs = Map<string, string>;

/** Deadline extraction result */
export interface DeadlineResult {
  date: string | null;
  internationalDate: string | null;
  label: string | null;
}
