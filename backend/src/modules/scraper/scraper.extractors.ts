// ─────────────────────────────────────────────────────────────────
// Field Extractors — Confidence-scored, multi-strategy extraction
// Each function returns Extraction<T>[] ordered by confidence
// ─────────────────────────────────────────────────────────────────

import * as cheerio from 'cheerio';
import type { Extraction, StructuredData, KVPairs, DeadlineResult } from './scraper.types';
import {
  KNOWN_UNIVERSITIES, GERMAN_CITIES, CITY_COORDINATES,
  KV_KEY_PATTERNS,
} from './scraper.constants';
import {
  ext, pickBest, pickBestStr, pickBestNum,
  findJsonLdByType, kvLookup,
  parseNumber, parseDateString, nextDeadline,
  cleanUniversityName, cleanCourseName, normalizeDegree, normalizeDuration,
  resolveUrl,
} from './scraper.utils';

// ═══════════════════════════════════════════════════════════════
// University Name
// ═══════════════════════════════════════════════════════════════

export function extractUniversityName(
  $: cheerio.CheerioAPI, text: string, hostname: string,
  sd: StructuredData, kv: KVPairs,
): string {
  const candidates: Extraction<string>[] = [];

  // 1. Known hostname mapping (highest confidence — verified database)
  for (const [domain, info] of Object.entries(KNOWN_UNIVERSITIES)) {
    if (hostname.endsWith(domain) && info.name) {
      candidates.push(ext(info.name, 1.0, 'known-mapping'));
      break;
    }
  }

  // 2. JSON-LD structured data
  const courseLD = findJsonLdByType(sd, 'Course', 'EducationalOccupationalProgram');
  if (courseLD?.provider?.name) {
    candidates.push(ext(cleanUniversityName(courseLD.provider.name), 0.95, 'jsonld-provider'));
  }
  const orgLD = findJsonLdByType(sd, 'CollegeOrUniversity', 'EducationalOrganization', 'Organization');
  if (orgLD?.name) {
    candidates.push(ext(cleanUniversityName(orgLD.name), 0.93, 'jsonld-org'));
  }

  // 3. microdata itemprop="name" on university-like containers
  if (sd.microdata['legalName']) {
    candidates.push(ext(cleanUniversityName(sd.microdata['legalName']), 0.90, 'microdata-legalName'));
  }

  // 4. OG site_name (frequently the university name)
  if (sd.og['site_name'] && sd.og['site_name'].length > 3 && sd.og['site_name'].length < 100) {
    candidates.push(ext(cleanUniversityName(sd.og['site_name']), 0.85, 'og-site_name'));
  }

  // 5. meta application-name
  if (sd.meta['application-name'] && sd.meta['application-name'].length > 3) {
    candidates.push(ext(cleanUniversityName(sd.meta['application-name']), 0.83, 'meta-app-name'));
  }

  // 6. Regex patterns on page text
  const uniPatterns = [
    /(?:Technische\s+Universit[äa]t|TU)\s+[^.,|]{3,40}/i,
    /(?:Ludwig[- ]Maximilians[- ]Universit[äa]t)\s*[^.,|]{1,30}/i,
    /(?:Universit[äa]t|University)\s+(?:of\s+)?[A-Za-zÄÖÜäöüß\s-]{3,40}/i,
    /[A-Za-zÄÖÜäöüß\s-]{3,40}\s+(?:Universit[äa]t|University|Hochschule|Institute\s+of\s+Technology)/i,
    /(?:Hochschule|Fachhochschule)\s+[^.,|]{3,40}/i,
    /RWTH\s+Aachen(?:\s+University)?/i,
    /Karlsruhe\s+Institute\s+of\s+Technology|KIT\b/i,
  ];
  for (const p of uniPatterns) {
    const m = text.match(p);
    if (m && m[0].trim().length > 5 && m[0].trim().length < 100) {
      candidates.push(ext(cleanUniversityName(m[0]), 0.60, 'text-regex'));
      break; // take first match only
    }
  }

  // 7. Hostname inference (lowest confidence)
  try {
    const parts = hostname.split('.');
    const main = parts.find((p) => p.startsWith('uni-') || p.startsWith('tu-') || p.startsWith('hs-'));
    if (main) {
      const slug = main.replace(/^(uni|tu|hs)-/, '');
      const prefix = main.startsWith('tu-') ? 'TU ' : main.startsWith('hs-') ? 'Hochschule ' : 'Universität ';
      candidates.push(ext(prefix + slug.charAt(0).toUpperCase() + slug.slice(1), 0.40, 'hostname'));
    } else {
      const domain = parts[parts.length - 2];
      if (domain && domain.length > 2) {
        candidates.push(ext(domain.charAt(0).toUpperCase() + domain.slice(1) + ' University', 0.25, 'hostname-fallback'));
      }
    }
  } catch { /* ignore */ }

  return pickBestStr(candidates, 'Unknown University');
}

// ═══════════════════════════════════════════════════════════════
// Course Name
// ═══════════════════════════════════════════════════════════════

export function extractCourseName(
  $: cheerio.CheerioAPI, text: string,
  sd: StructuredData, kv: KVPairs,
): string {
  const candidates: Extraction<string>[] = [];

  // 1. JSON-LD (most reliable — intentional structured data)
  const courseLD = findJsonLdByType(sd, 'Course', 'EducationalOccupationalProgram');
  if (courseLD?.name) {
    const name = cleanCourseName(courseLD.name);
    if (name.length > 3) candidates.push(ext(name, 0.95, 'jsonld-name'));
  }

  // 2. microdata itemprop="name" inside [itemtype*="Course"]
  if (sd.microdata['name']) {
    const name = cleanCourseName(sd.microdata['name']);
    if (name.length > 3 && name.length < 120) candidates.push(ext(name, 0.88, 'microdata-name'));
  }

  // 3. KV pairs from tables/definition lists
  const kvName = kvLookup(kv, KV_KEY_PATTERNS.courseName);
  if (kvName && kvName.length > 3) {
    candidates.push(ext(cleanCourseName(kvName), 0.90, 'kv-pairs'));
  }

  // 4. H1 heading (common pattern for course pages)
  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  if (h1 && h1.length > 3) {
    const name = cleanCourseName(h1);
    if (name.length > 3 && name.length < 160) {
      candidates.push(ext(name, 0.80, 'h1'));
    }
  }

  // 5. og:title (strip suffix after pipe/dash)
  if (sd.og['title'] && sd.og['title'].length > 3) {
    const cleaned = sd.og['title'].replace(/\s*[|\-–—]\s*.*$/, '').trim();
    if (cleaned.length > 3) candidates.push(ext(cleanCourseName(cleaned), 0.70, 'og-title'));
  }

  // 6. <title> tag
  const title = $('title').text().trim();
  if (title) {
    const cleaned = title.split(/[|\-–—]/)[0].trim();
    if (cleaned.length > 3) candidates.push(ext(cleanCourseName(cleaned), 0.60, 'title-tag'));
  }

  // 7. twitter:title
  if (sd.twitter['title'] && sd.twitter['title'].length > 3) {
    const cleaned = sd.twitter['title'].replace(/\s*[|\-–—]\s*.*$/, '').trim();
    if (cleaned.length > 3) candidates.push(ext(cleanCourseName(cleaned), 0.55, 'twitter-title'));
  }

  return pickBestStr(candidates, 'Unknown Course');
}

// ═══════════════════════════════════════════════════════════════
// Description
// ═══════════════════════════════════════════════════════════════

export function extractDescription(
  $: cheerio.CheerioAPI, sd: StructuredData,
): string {
  const candidates: Extraction<string>[] = [];
  const cap = (s: string) => s.substring(0, 1000);

  // JSON-LD
  const courseLD = findJsonLdByType(sd, 'Course', 'EducationalOccupationalProgram');
  if (courseLD?.description) candidates.push(ext(cap(courseLD.description), 0.95, 'jsonld'));

  // og:description
  if (sd.og['description'] && sd.og['description'].length > 20) {
    candidates.push(ext(cap(sd.og['description']), 0.85, 'og-desc'));
  }

  // meta description
  if (sd.meta['description'] && sd.meta['description'].length > 20) {
    candidates.push(ext(cap(sd.meta['description']), 0.80, 'meta-desc'));
  }

  // twitter:description
  if (sd.twitter['description'] && sd.twitter['description'].length > 20) {
    candidates.push(ext(cap(sd.twitter['description']), 0.75, 'twitter-desc'));
  }

  // First meaningful paragraph
  const firstP = $('main p, article p, .content p, #content p, [role="main"] p').first().text().replace(/\s+/g, ' ').trim();
  if (firstP && firstP.length > 50) {
    candidates.push(ext(cap(firstP), 0.50, 'first-paragraph'));
  }

  return pickBestStr(candidates, '');
}

// ═══════════════════════════════════════════════════════════════
// Degree
// ═══════════════════════════════════════════════════════════════

export function extractDegree(
  text: string, sd: StructuredData, kv: KVPairs,
): string {
  const candidates: Extraction<string>[] = [];

  // 1. KV pairs
  const kvDegree = kvLookup(kv, KV_KEY_PATTERNS.degree);
  if (kvDegree && kvDegree.length < 60) {
    candidates.push(ext(normalizeDegree(kvDegree), 0.95, 'kv-pairs'));
  }

  // 2. JSON-LD credential
  const courseLD = findJsonLdByType(sd, 'Course', 'EducationalOccupationalProgram');
  if (courseLD?.educationalCredentialAwarded) {
    candidates.push(ext(normalizeDegree(courseLD.educationalCredentialAwarded), 0.90, 'jsonld-credential'));
  }

  // 3. Microdata
  if (sd.microdata['educationalCredentialAwarded']) {
    candidates.push(ext(normalizeDegree(sd.microdata['educationalCredentialAwarded']), 0.88, 'microdata'));
  }

  // 4. Text regex — ordered by specificity
  const patterns: [RegExp, number][] = [
    [/\b(Master\s+of\s+(?:Science|Arts|Engineering|Business\s+Administration|Laws|Education))\b/i, 0.75],
    [/\b(Bachelor\s+of\s+(?:Science|Arts|Engineering|Education))\b/i, 0.75],
    [/\b(M\.?\s*Sc\.?)\b/, 0.70],
    [/\b(M\.?\s*A\.?)\b/, 0.70],
    [/\b(M\.?\s*Eng\.?)\b/, 0.70],
    [/\b(M\.?\s*B\.?\s*A\.?)\b/, 0.70],
    [/\b(B\.?\s*Sc\.?)\b/, 0.70],
    [/\b(B\.?\s*A\.?)\b/, 0.65],
    [/\b(B\.?\s*Eng\.?)\b/, 0.70],
    [/\b(Master|Bachelor|PhD|Doctorate|Diplom|Staatsexamen|Magister)\b/i, 0.50],
  ];
  for (const [p, conf] of patterns) {
    const m = text.match(p);
    if (m) {
      candidates.push(ext(normalizeDegree(m[1].trim()), conf, 'text-regex'));
      break; // take first match
    }
  }

  return pickBestStr(candidates, '');
}

// ═══════════════════════════════════════════════════════════════
// Language of Instruction
// ═══════════════════════════════════════════════════════════════

export function extractLanguage(
  text: string, kv: KVPairs,
): string {
  const candidates: Extraction<string>[] = [];

  // 1. KV pairs
  const kvLang = kvLookup(kv, KV_KEY_PATTERNS.language);
  if (kvLang) {
    const result = classifyLanguage(kvLang);
    if (result) candidates.push(ext(result, 0.95, 'kv-pairs'));
  }

  // 2. Explicit text patterns (ordered by specificity)
  const langPatterns: [RegExp, string | null, number][] = [
    [/taught\s+(?:entirely\s+)?in\s+english\s+(?:and|&|\/)?\s*german/i, 'German & English', 0.85],
    [/taught\s+(?:entirely\s+)?in\s+german\s+(?:and|&|\/)?\s*english/i, 'German & English', 0.85],
    [/(?:language|taught)[:\s]*english\s+(?:and|&|\/)\s*german/i, 'German & English', 0.82],
    [/(?:language|taught)[:\s]*german\s+(?:and|&|\/)\s*english/i, 'German & English', 0.82],
    [/bilingual|zweisprachig/i, 'German & English', 0.75],
    [/taught\s+(?:entirely\s+)?in\s+english/i, 'English', 0.85],
    [/english[- ]taught\s+(?:programme|program|course)/i, 'English', 0.83],
    [/(?:all|fully)\s+in\s+english/i, 'English', 0.80],
    [/english\s+only|only\s+(?:in\s+)?english/i, 'English', 0.85],
    [/taught\s+(?:entirely\s+)?in\s+german/i, 'German', 0.85],
    [/german\s+only|only\s+(?:in\s+)?german|deutschsprachig|ausschließlich.*deutsch/i, 'German', 0.85],
    [/(?:language\s+of\s+instruction|teaching\s+language|unterrichtssprache)[:\s]+(?:is\s+)?english/i, 'English', 0.88],
    [/(?:language\s+of\s+instruction|teaching\s+language|unterrichtssprache)[:\s]+(?:is\s+)?(?:german|deutsch)/i, 'German', 0.88],
  ];

  for (const [p, val, conf] of langPatterns) {
    if (p.test(text)) {
      if (val) {
        candidates.push(ext(val, conf, 'text-pattern'));
        break;
      }
    }
  }

  return pickBestStr(candidates, '');
}

function classifyLanguage(text: string): string | null {
  const lower = text.toLowerCase();
  const hasEng = /\benglis[ch]?\b/i.test(text);
  const hasDe = /\bdeutsch\b|\bgerma[n]?\b/i.test(text);
  if (hasEng && hasDe) return 'German & English';
  if (hasEng) return 'English';
  if (hasDe) return 'German';
  if (text.length < 40) return text.trim();
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Duration
// ═══════════════════════════════════════════════════════════════

export function extractDuration(
  text: string, kv: KVPairs, sd: StructuredData,
): string {
  const candidates: Extraction<string>[] = [];

  // 1. KV pairs
  const kvDur = kvLookup(kv, KV_KEY_PATTERNS.duration);
  if (kvDur) {
    candidates.push(ext(normalizeDuration(kvDur), 0.95, 'kv-pairs'));
  }

  // 2. JSON-LD timeToComplete
  const courseLD = findJsonLdByType(sd, 'Course', 'EducationalOccupationalProgram');
  if (courseLD?.timeToComplete) {
    // ISO 8601 duration: PT2Y, P4S, etc.
    const isoDur = courseLD.timeToComplete;
    const m = typeof isoDur === 'string' && isoDur.match(/P(\d+)([YM])/);
    if (m) {
      const num = parseInt(m[1]);
      if (m[2] === 'Y') candidates.push(ext(`${num * 2} semesters`, 0.92, 'jsonld-duration'));
      else candidates.push(ext(`${num} months`, 0.92, 'jsonld-duration'));
    } else if (typeof isoDur === 'string') {
      candidates.push(ext(normalizeDuration(isoDur), 0.90, 'jsonld-duration'));
    }
  }

  // 3. Text patterns
  const patterns: [RegExp, number][] = [
    [/(?:duration|dauer|regelstudienzeit|standard\s+period\s+of\s+study|study\s+duration)[:\s]+(\d+\s*(?:semesters?|years?|Semester|Jahre?))/i, 0.80],
    [/(\d+)\s*(?:-|\s+to\s+)\s*(\d+)\s*semesters?/i, 0.70],
    [/(\d+)\s*semesters?\s*\((\d+)\s*years?\)/i, 0.75],
    [/(\d+)\s*semesters?/i, 0.60],
    [/(\d+)\s*years?/i, 0.55],
  ];
  for (const [p, conf] of patterns) {
    const m = text.match(p);
    if (m) {
      const raw = m[0].replace(/.*?(\d)/, '$1').trim();
      candidates.push(ext(normalizeDuration(raw), conf, 'text-regex'));
      break;
    }
  }

  return pickBestStr(candidates, '');
}

// ═══════════════════════════════════════════════════════════════
// Fees (tuition + semester contribution)
// ═══════════════════════════════════════════════════════════════

export function extractFees(
  text: string, kv: KVPairs, sd: StructuredData,
): number | null {
  const candidates: Extraction<number | null>[] = [];

  // 1. JSON-LD offers / cost
  const courseLD = findJsonLdByType(sd, 'Course', 'EducationalOccupationalProgram');
  if (courseLD?.offers?.price) {
    const n = parseNumber(String(courseLD.offers.price));
    if (n !== null && n >= 0 && n < 100000) candidates.push(ext(n, 0.95, 'jsonld-price'));
  }

  // 2. KV pairs
  const kvFees = kvLookup(kv, KV_KEY_PATTERNS.fees);
  if (kvFees) {
    // Check for "no tuition" / "none" / "keine"
    if (/(?:no|none|keine|tuition[\s-]*free|gebührenfrei)\b/i.test(kvFees)) {
      candidates.push(ext(0, 0.95, 'kv-no-fee'));
    } else {
      const n = parseNumber(kvFees);
      if (n !== null && n >= 0 && n < 100000) candidates.push(ext(n, 0.92, 'kv-pairs'));
    }
  }

  // 3. Text patterns
  const feePatterns: [RegExp, number][] = [
    [/(?:no|none|keine)\s*tuition\s*fees?/i, 0.80],
    [/tuition[\s-]*free|gebührenfrei/i, 0.80],
    [/tuition\s*fees?\s*[:=]?\s*(?:€|EUR)?\s*([\d.,]+)\s*(?:€|EUR)?/i, 0.75],
    [/(?:€|EUR)\s*([\d.,]+)\s*(?:per\s+(?:year|annum|semester))/i, 0.70],
    [/([\d.,]+)\s*(?:€|EUR)\s*(?:per\s+(?:year|annum))?/i, 0.60],
    [/fees?\s*[:=]?\s*(?:approx\.?\s*)?(?:€|EUR)?\s*([\d.,]+)/i, 0.55],
  ];

  for (const [p, conf] of feePatterns) {
    const m = text.match(p);
    if (m) {
      if (/(?:no|none|keine|free|frei)/i.test(m[0])) {
        candidates.push(ext(0, conf, 'text-no-fee'));
      } else if (m[1]) {
        const n = parseNumber(m[1]);
        if (n !== null && n >= 0 && n < 100000) candidates.push(ext(n, conf, 'text-regex'));
      }
      break;
    }
  }

  return pickBestNum(candidates);
}

export function extractFeesPerSemester(
  text: string, kv: KVPairs,
): number | null {
  const candidates: Extraction<number | null>[] = [];

  // KV
  const kvSem = kvLookup(kv, KV_KEY_PATTERNS.semesterFees);
  if (kvSem) {
    const n = parseNumber(kvSem);
    if (n !== null && n > 0 && n < 2000) candidates.push(ext(n, 0.95, 'kv-semester-fee'));
  }

  // Text
  const patterns: [RegExp, number][] = [
    [/([\d.,]+)\s*(?:€|EUR)\s*(?:per|\/|each)\s*semester/i, 0.80],
    [/semester\s*(?:fee|beitrag|contribution)\s*[:=]?\s*(?:€|EUR)?\s*([\d.,]+)/i, 0.80],
    [/semesterbeitrag\s*[:=]?\s*(?:€|EUR)?\s*([\d.,]+)/i, 0.85],
  ];
  for (const [p, conf] of patterns) {
    const m = text.match(p);
    if (m) {
      const n = parseNumber(m[1] || m[2]);
      if (n !== null && n > 0 && n < 2000) candidates.push(ext(n, conf, 'text-regex'));
      break;
    }
  }

  return pickBestNum(candidates);
}

// ═══════════════════════════════════════════════════════════════
// Deadline
// ═══════════════════════════════════════════════════════════════

export function extractDeadline(
  text: string, kv: KVPairs, sd: StructuredData,
): DeadlineResult {
  const result: DeadlineResult = { date: null, internationalDate: null, label: null };

  // 1. JSON-LD applicationDeadline
  const courseLD = findJsonLdByType(sd, 'Course', 'EducationalOccupationalProgram');
  if (courseLD?.applicationDeadline) {
    const d = parseDateString(courseLD.applicationDeadline);
    if (d) { result.date = d; }
  }

  // 2. KV pairs
  if (!result.date) {
    for (const [k, v] of kv) {
      if (KV_KEY_PATTERNS.deadline.test(k)) {
        const parsed = parseDateString(v);
        if (parsed) {
          if (/international|non[-\s]?eu|ausländ/i.test(k)) {
            result.internationalDate = result.internationalDate || parsed;
            result.label = 'International Students';
          } else {
            result.date = result.date || parsed;
          }
        }
      }
    }
  }

  // 3. Text patterns
  if (!result.date) {
    const datePatterns = [
      /(?:application\s+deadline|bewerbungsfrist|apply\s+(?:by|before|until)|deadline\s+(?:for\s+)?(?:application|admission))[:\s]+(.{5,40}?)(?:\.|$|\n|<)/gim,
      /(?:deadline|frist)[:\s]+(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})/gi,
      /(?:deadline|frist)[:\s]+(\d{1,2}\s+\w+\s+\d{4})/gi,
    ];
    for (const p of datePatterns) {
      const matches = [...text.matchAll(p)];
      for (const m of matches) {
        const parsed = parseDateString(m[1]);
        if (parsed && !result.date) {
          result.date = parsed;
          break;
        }
      }
      if (result.date) break;
    }
  }

  // 4. International-specific
  if (!result.internationalDate) {
    const intlPatterns = [
      /(?:international|non[-\s]?eu|foreign|ausländ)\s*(?:students?|applicants?|bewerber)?\s*(?:deadline|frist)?[:\s]+(.{5,40}?)(?:\.|$|\n)/gim,
    ];
    for (const p of intlPatterns) {
      const matches = [...text.matchAll(p)];
      for (const m of matches) {
        const parsed = parseDateString(m[1]);
        if (parsed) {
          result.internationalDate = parsed;
          result.label = 'International Students';
          break;
        }
      }
    }
  }

  // 5. Common German semester deadlines (fallback)
  if (!result.date) {
    if (/winter\s*semester.*?15\s*(?:\.?\s*)?(?:juli?y?|07)/i.test(text)) result.date = nextDeadline(7, 15);
    else if (/summer\s*semester.*?15\s*(?:\.?\s*)?(?:januar?y?|01)/i.test(text)) result.date = nextDeadline(1, 15);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// Start Date
// ═══════════════════════════════════════════════════════════════

export function extractStartDate(
  text: string, kv: KVPairs, sd: StructuredData,
): string | null {
  // JSON-LD
  const courseLD = findJsonLdByType(sd, 'Course', 'EducationalOccupationalProgram');
  if (courseLD?.startDate) {
    const d = parseDateString(courseLD.startDate);
    if (d) return d;
  }

  // KV pairs
  const kvStart = kvLookup(kv, KV_KEY_PATTERNS.startDate);
  if (kvStart) {
    if (/winter/i.test(kvStart)) return 'Winter';
    if (/summer|sommer/i.test(kvStart)) return 'Summer';
    if (kvStart.length < 30) return kvStart;
  }

  // Text fallback
  if (/winter\s*semester|wintersemester/i.test(text)) return 'Winter';
  if (/summer\s*semester|sommersemester/i.test(text)) return 'Summer';
  return null;
}

// ═══════════════════════════════════════════════════════════════
// ECTS Credits
// ═══════════════════════════════════════════════════════════════

export function extractECTS(
  text: string, kv: KVPairs, sd: StructuredData,
): number | null {
  const candidates: Extraction<number | null>[] = [];

  // JSON-LD
  const courseLD = findJsonLdByType(sd, 'Course', 'EducationalOccupationalProgram');
  if (courseLD?.numberOfCredits) {
    const n = typeof courseLD.numberOfCredits === 'number' ? courseLD.numberOfCredits : parseInt(courseLD.numberOfCredits);
    if (!isNaN(n) && n > 0) candidates.push(ext(n, 0.95, 'jsonld-credits'));
  }

  // Microdata
  if (sd.microdata['numberOfCredits']) {
    const n = parseInt(sd.microdata['numberOfCredits']);
    if (!isNaN(n) && n > 0) candidates.push(ext(n, 0.90, 'microdata-credits'));
  }

  // KV pairs
  const kvEcts = kvLookup(kv, KV_KEY_PATTERNS.ects);
  if (kvEcts) {
    const m = kvEcts.match(/(\d{2,3})/);
    if (m) candidates.push(ext(parseInt(m[1], 10), 0.92, 'kv-pairs'));
  }

  // Text
  const m = text.match(/(\d{2,3})\s*(?:ECTS|credit\s*points?|CP|LP|Leistungspunkte)/i);
  if (m) candidates.push(ext(parseInt(m[1], 10), 0.70, 'text-regex'));

  return pickBestNum(candidates);
}

// ═══════════════════════════════════════════════════════════════
// City
// ═══════════════════════════════════════════════════════════════

export function extractCity(
  text: string, hostname: string, kv: KVPairs, sd: StructuredData,
): string {
  const candidates: Extraction<string>[] = [];

  // 1. Known universities
  for (const [domain, info] of Object.entries(KNOWN_UNIVERSITIES)) {
    if (hostname.endsWith(domain) && info.city) {
      candidates.push(ext(info.city, 1.0, 'known-mapping'));
      break;
    }
  }

  // 2. JSON-LD location
  const orgLD = findJsonLdByType(sd, 'CollegeOrUniversity', 'EducationalOrganization', 'Organization');
  if (orgLD?.address?.addressLocality) {
    candidates.push(ext(orgLD.address.addressLocality, 0.92, 'jsonld-address'));
  }

  // 3. KV pairs
  const kvCity = kvLookup(kv, KV_KEY_PATTERNS.location);
  if (kvCity && kvCity.length < 40) {
    const found = GERMAN_CITIES.find((c) => kvCity.includes(c));
    candidates.push(ext(found || kvCity, 0.85, 'kv-pairs'));
  }

  // 4. Text matching — find known German city
  for (const city of GERMAN_CITIES) {
    if (text.includes(city)) {
      candidates.push(ext(city, 0.50, 'text-match'));
      break;
    }
  }

  // 5. Hostname inference
  try {
    const m = hostname.match(/(?:^|\.)([\\w-]+)\.(?:de|uni|edu)/);
    if (m) {
      const slug = m[1].replace(/^(uni|tu|hs|fh)-/, '');
      const found = GERMAN_CITIES.find((c) => c.toLowerCase() === slug);
      if (found) candidates.push(ext(found, 0.40, 'hostname'));
      else candidates.push(ext(slug.charAt(0).toUpperCase() + slug.slice(1), 0.25, 'hostname-fallback'));
    }
  } catch { /* ignore */ }

  return pickBestStr(candidates, '');
}

// ═══════════════════════════════════════════════════════════════
// Application URL
// ═══════════════════════════════════════════════════════════════

export function extractApplicationUrl(
  $: cheerio.CheerioAPI, baseUrl: string, sourceUrl: string,
): string {
  // Priority selectors for application links
  const selectors = [
    'a[href*="apply"]', 'a[href*="bewerbung"]', 'a[href*="application"]',
    'a[href*="admission"]', 'a[href*="zulassung"]', 'a[href*="enrol"]',
    'a[href*="bewerben"]', 'a[href*="online-bewerbung"]',
  ];
  for (const sel of selectors) {
    const href = $(sel).first().attr('href');
    if (href) return resolveUrl(href, baseUrl);
  }

  // Buttons with apply text
  const applyBtn = $('a, button').filter((_, el) => /apply|bewerben|application/i.test($(el).text())).first();
  const href = applyBtn.attr('href');
  if (href) return resolveUrl(href, baseUrl);

  return sourceUrl;
}

// ═══════════════════════════════════════════════════════════════
// Logo
// ═══════════════════════════════════════════════════════════════

export function extractLogo(
  $: cheerio.CheerioAPI, baseUrl: string,
): string | null {
  // 1. Actual logo images (priority selectors)
  const logoSelectors = [
    'img[class*="logo"]', 'img[id*="logo"]',
    'img[alt*="logo" i]', 'img[alt*="Logo"]', 'img[alt*="Universit"]',
    '.logo img', '#logo img', '.site-logo img',
    '[class*="brand"] img', '.navbar-brand img', 'a[class*="logo"] img',
    'header img', '.header img', '#header img',
    'img[class*="header"]', 'img[id*="header"]',
  ];
  for (const sel of logoSelectors) {
    const el = $(sel).first();
    const src = el.attr('src') || el.attr('data-src');
    if (src && !src.includes('pixel') && !src.includes('spacer') && !src.includes('1x1') && !src.includes('tracking')) {
      const resolved = resolveUrl(src, baseUrl);
      if (!resolved.startsWith('data:')) {
        const width = parseInt(el.attr('width') || '0');
        if (width === 0 || width > 20) return resolved;
      }
    }
  }

  // 2. JSON-LD logo
  const jsonLdScripts: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html();
    if (text) jsonLdScripts.push(text);
  });
  for (const text of jsonLdScripts) {
    try {
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item.logo?.url) return resolveUrl(item.logo.url, baseUrl);
        if (typeof item.logo === 'string') return resolveUrl(item.logo, baseUrl);
      }
    } catch { /* skip */ }
  }

  // 3. og:image
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage && !ogImage.includes('placeholder') && !ogImage.includes('default')) {
    const resolved = resolveUrl(ogImage, baseUrl);
    if (resolved.startsWith('http')) return resolved;
  }

  // 4. Favicon — prefer PNG/SVG over ICO
  const faviconSelectors = [
    'link[rel="icon"][type="image/png"]',
    'link[rel="icon"][type="image/svg+xml"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel="icon"]',
  ];
  for (const sel of faviconSelectors) {
    const icon = $(sel).first().attr('href');
    if (icon && !icon.endsWith('.ico') && icon.length > 1) {
      return resolveUrl(icon, baseUrl);
    }
  }
  for (const sel of faviconSelectors) {
    const icon = $(sel).first().attr('href');
    if (icon && icon.length > 1) return resolveUrl(icon, baseUrl);
  }

  return baseUrl + '/favicon.ico';
}

// ═══════════════════════════════════════════════════════════════
// Social Media Links
// ═══════════════════════════════════════════════════════════════

export function extractSocialLinks(
  $: cheerio.CheerioAPI,
): { linkedin: string | null; instagram: string | null } {
  let linkedin: string | null = null;
  let instagram: string | null = null;

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (!linkedin && /linkedin\.com\/(?:school|company|in)\//i.test(href)) {
      linkedin = href.startsWith('http') ? href : 'https://' + href.replace(/^\/\//, '');
    }
    if (!instagram && /instagram\.com\/[\w.]+/i.test(href)) {
      instagram = href.startsWith('http') ? href : 'https://' + href.replace(/^\/\//, '');
    }
  });

  return { linkedin, instagram };
}

// ═══════════════════════════════════════════════════════════════
// Application Via (direct / uni-assist / both)
// ═══════════════════════════════════════════════════════════════

export function detectApplicationVia(text: string): 'DIRECT' | 'UNI_ASSIST' | 'BOTH' {
  const uniAssist = /uni[- ]?assist/i.test(text);
  const direct = /apply\s+directly|online[- ]?bewerbung|bewerbungsportal|apply\s+online\s+portal|direct\s+application/i.test(text);
  if (uniAssist && direct) return 'BOTH';
  if (uniAssist) return 'UNI_ASSIST';
  return 'DIRECT';
}

export function extractUniAssistInfo(text: string): string {
  if (!/uni[- ]?assist/i.test(text)) return '';
  const m = text.match(/(?:uni[- ]?assist)[^.!?\n]{0,200}[.!?]/i);
  return m ? m[0].trim().substring(0, 300) : 'Application via uni-assist required';
}

// ═══════════════════════════════════════════════════════════════
// Address
// ═══════════════════════════════════════════════════════════════

export function extractAddress(
  text: string, sd: StructuredData,
): string {
  // JSON-LD address
  const orgLD = findJsonLdByType(sd, 'CollegeOrUniversity', 'EducationalOrganization', 'Organization');
  if (orgLD?.address) {
    const a = orgLD.address;
    if (typeof a === 'string') return a.substring(0, 200);
    const parts = [a.streetAddress, a.postalCode, a.addressLocality, a.addressCountry].filter(Boolean);
    if (parts.length > 0) return parts.join(', ').substring(0, 200);
  }

  // Text regex
  const patterns = [
    /(?:address|anschrift|standort)[:\s]+([^\n]{10,150})/i,
    /\d{4,5}\s+[A-Za-zÄÖÜäöüß\s-]+,?\s+(?:Germany|Deutschland)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return (m[1] || m[0]).trim().substring(0, 200);
  }
  return '';
}

// ═══════════════════════════════════════════════════════════════
// Requirements
// ═══════════════════════════════════════════════════════════════

export function extractRequirements(
  $: cheerio.CheerioAPI, text: string, kv: KVPairs,
): string {
  // 1. KV pairs
  const kvReq = kvLookup(kv, KV_KEY_PATTERNS.requirements);
  if (kvReq && kvReq.length > 20) return kvReq.substring(0, 500);

  // 2. Section headings containing "requirement"
  const headings = $('h1, h2, h3, h4, h5');
  for (let i = 0; i < headings.length; i++) {
    const heading = $(headings[i]).text().trim();
    if (/requirement|prerequisite|eligibility|admission|zugangsvoraussetzung|voraussetzung/i.test(heading)) {
      const next = $(headings[i]).nextAll('p, ul, ol, div').slice(0, 3);
      const content = next.map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().join(' ');
      if (content.length > 30) return content.substring(0, 500);
    }
  }

  // 3. Regex fallback
  const patterns = [
    /(?:entry\s*requirements?|admission\s*requirements?|prerequisites?|eligibility)[:\s]+(.{40,500})/i,
    /(?:toefl|ielts|dsh|testdaf|language\s*(?:certificate|requirement|proficiency))[:\s]+(.{20,300})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const cleaned = m[1].replace(/\s+/g, ' ').trim().substring(0, 500);
      if (cleaned.length > 30) return cleaned;
    }
  }
  return '';
}

// ═══════════════════════════════════════════════════════════════
// City Coordinates
// ═══════════════════════════════════════════════════════════════

export function getCityCoordinates(city: string): { latitude: number | null; longitude: number | null } {
  const coords = CITY_COORDINATES[city];
  return coords
    ? { latitude: coords.lat, longitude: coords.lng }
    : { latitude: null, longitude: null };
}
