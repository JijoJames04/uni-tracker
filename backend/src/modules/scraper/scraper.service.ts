// ─────────────────────────────────────────────────────────────────
// Scraper Service — Production-grade university course scraper
//
// Architecture:
//   1. Fetch with retry, user-agent rotation, exponential backoff
//   2. Extract structured data (JSON-LD, OpenGraph, microdata)
//   3. Extract key-value pairs (tables, definition lists, labels)
//   4. Run confidence-scored field extractors (highest confidence wins)
//   5. Cross-validate and normalize the final result
//   6. Return ScrapedCourseData
// ─────────────────────────────────────────────────────────────────

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as cheerio from 'cheerio';

import type { ScrapedCourseData } from './scraper.types';
import { USER_AGENTS } from './scraper.constants';
import {
  extractStructuredData,
  extractKeyValuePairs,
} from './scraper.utils';
import {
  extractUniversityName,
  extractCourseName,
  extractDescription,
  extractDegree,
  extractLanguage,
  extractDuration,
  extractFees,
  extractFeesPerSemester,
  extractDeadline,
  extractStartDate,
  extractECTS,
  extractCity,
  extractApplicationUrl,
  extractLogo,
  extractSocialLinks,
  detectApplicationVia,
  extractUniAssistInfo,
  extractAddress,
  extractRequirements,
  getCityCoordinates,
} from './scraper.extractors';

// Re-export for consumers
export type { ScrapedCourseData } from './scraper.types';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  // ═══════════════════════════════════════════════════════════════
  // Public API
  // ═══════════════════════════════════════════════════════════════

  async scrapeUniversityCourse(url: string): Promise<ScrapedCourseData> {
    this.logger.log(`Scraping URL: ${url}`);
    try {
      const html = await this.fetchWithRetry(url);
      const result = this.parseHTML(html, url);
      this.logResult(result);
      return this.validate(result);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Scraping failed: ${error.message}`);
      throw new HttpException(
        `Failed to scrape URL: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HTTP Fetch — Retry with exponential backoff & UA rotation
  // ═══════════════════════════════════════════════════════════════

  private async fetchWithRetry(
    url: string,
    maxRetries = 3,
    baseTimeoutMs = 20000,
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const ua = USER_AGENTS[attempt % USER_AGENTS.length];
      const timeoutMs = baseTimeoutMs + attempt * 5000; // Increase timeout each retry

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': ua,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
              'Accept-Encoding': 'gzip, deflate',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
            redirect: 'follow',
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const html = await response.text();

          // Validate we got actual HTML, not an error page or CAPTCHA
          if (html.length < 500) {
            throw new Error('Response too short — likely blocked or error page');
          }
          if (/captcha|cloudflare|challenge|bot.detection/i.test(html.substring(0, 2000))) {
            throw new Error('Bot detection / CAPTCHA detected');
          }

          this.logger.debug(`Fetch success on attempt ${attempt + 1} (${html.length} bytes)`);
          return html;
        } finally {
          clearTimeout(timeout);
        }
      } catch (error) {
        lastError = error;
        this.logger.warn(`Fetch attempt ${attempt + 1}/${maxRetries} failed: ${error.message}`);

        if (attempt < maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new HttpException(
      `Failed after ${maxRetries} attempts: ${lastError?.message || 'unknown error'}`,
      HttpStatus.BAD_GATEWAY,
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // HTML Parser — Orchestrates all extractors
  // ═══════════════════════════════════════════════════════════════

  private parseHTML(html: string, url: string): ScrapedCourseData {
    const $full = cheerio.load(html);
    const $ = cheerio.load(html);
    const baseUrl = new URL(url).origin;
    const hostname = new URL(url).hostname.replace(/^www\./, '');

    // ── Phase 1: Pre-extraction (before cleaning DOM) ──

    // Extract social links from full HTML (they're in nav/footer)
    const socialLinks = extractSocialLinks($full);

    // Extract logo from full HTML
    const logoUrl = extractLogo($full, baseUrl);

    // Extract structured data from full HTML
    const sd = extractStructuredData($full);
    this.logger.debug(`Structured data: ${sd.jsonLd.length} JSON-LD, ${Object.keys(sd.og).length} OG, ${Object.keys(sd.microdata).length} microdata items`);

    // ── Phase 2: Clean DOM for content extraction ──

    $('nav, footer, header, script, style, noscript, [role="navigation"], [role="banner"], .nav, .footer, .header, .sidebar, #nav, #footer, #header, #sidebar, .cookie, .breadcrumb, .banner, .modal, .popup, .advertisement, .ad, [class*="cookie"], [class*="consent"]').remove();

    const cleanText = $('body').text().replace(/\s+/g, ' ').trim();

    // ── Phase 3: Extract KV pairs from tables, definition lists ──

    const kv = extractKeyValuePairs($);
    this.logger.debug(`Found ${kv.size} KV pairs`);

    // ── Phase 4: Run all field extractors ──

    const city = this.safeExtract('city', () => extractCity(cleanText, hostname, kv, sd));
    const deadlineResult = this.safeExtract('deadline', () => extractDeadline(cleanText, kv, sd), { date: null, internationalDate: null, label: null });

    return {
      universityName: this.safeExtract('universityName', () => extractUniversityName($, cleanText, hostname, sd, kv), 'Unknown University'),
      courseName: this.safeExtract('courseName', () => extractCourseName($, cleanText, sd, kv), 'Unknown Course'),
      description: this.safeExtract('description', () => extractDescription($, sd)),
      degree: this.safeExtract('degree', () => extractDegree(cleanText, sd, kv)),
      language: this.safeExtract('language', () => extractLanguage(cleanText, kv)),
      duration: this.safeExtract('duration', () => extractDuration(cleanText, kv, sd)),
      fees: this.safeExtractNull('fees', () => extractFees(cleanText, kv, sd)),
      feesPerSemester: this.safeExtractNull('feesPerSemester', () => extractFeesPerSemester(cleanText, kv)),
      currency: 'EUR',
      deadline: deadlineResult.date,
      deadlineInternational: deadlineResult.internationalDate,
      deadlineLabel: deadlineResult.label,
      startDate: this.safeExtractNull('startDate', () => extractStartDate(cleanText, kv, sd)),
      applicationUrl: this.safeExtract('applicationUrl', () => extractApplicationUrl($, baseUrl, url), url),
      sourceUrl: url,
      logoUrl,
      address: this.safeExtract('address', () => extractAddress(cleanText, sd)),
      city,
      ects: this.safeExtractNull('ects', () => extractECTS(cleanText, kv, sd)),
      applicationVia: this.safeExtract('applicationVia', () => detectApplicationVia(cleanText), 'DIRECT') as 'DIRECT' | 'UNI_ASSIST' | 'BOTH',
      uniAssistInfo: this.safeExtract('uniAssistInfo', () => extractUniAssistInfo(cleanText)),
      requirements: this.safeExtract('requirements', () => extractRequirements($, cleanText, kv)),
      linkedinUrl: socialLinks.linkedin,
      instagramUrl: socialLinks.instagram,
      websiteUrl: baseUrl,
      ...getCityCoordinates(city),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Error Isolation — Each field extraction is sandboxed
  // ═══════════════════════════════════════════════════════════════

  private safeExtract<T>(fieldName: string, fn: () => T, fallback?: T): T {
    try {
      return fn();
    } catch (error) {
      this.logger.warn(`Extraction failed for "${fieldName}": ${error.message}`);
      return fallback !== undefined ? fallback : ('' as unknown as T);
    }
  }

  private safeExtractNull<T>(fieldName: string, fn: () => T | null): T | null {
    try {
      return fn();
    } catch (error) {
      this.logger.warn(`Extraction failed for "${fieldName}": ${error.message}`);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Cross-Validation & Normalization
  // ═══════════════════════════════════════════════════════════════

  private validate(data: ScrapedCourseData): ScrapedCourseData {
    const warnings: string[] = [];

    // 1. Validate deadline is not in the distant past
    if (data.deadline) {
      const dl = new Date(data.deadline);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (dl < sixMonthsAgo) {
        warnings.push(`Deadline ${data.deadline} is in the past — may be outdated`);
        // Try to push to next year
        const nextYear = new Date(dl);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        data.deadline = nextYear.toISOString().split('T')[0];
      }
    }

    // 2. Validate fees are reasonable for German universities
    if (data.fees !== null && data.fees > 30000) {
      warnings.push(`Fees ${data.fees}€ seem unusually high for German university`);
    }

    // 3. Cross-validate degree vs course name
    if (data.degree && data.courseName) {
      const degreeIsMaster = /master|m\.?\s*sc|m\.?\s*a\./i.test(data.degree);
      const nameIsBachelor = /bachelor|b\.?\s*sc|b\.?\s*a\./i.test(data.courseName);
      if (degreeIsMaster && nameIsBachelor) {
        warnings.push('Degree says Master but course name mentions Bachelor — possible mismatch');
      }
    }

    // 4. Validate ECTS is in reasonable range
    if (data.ects !== null && (data.ects < 30 || data.ects > 300)) {
      warnings.push(`ECTS value ${data.ects} seems unusual`);
      if (data.ects < 10 || data.ects > 500) data.ects = null; // discard clearly wrong values
    }

    // 5. Clean up course name — ensure it's not the university name
    if (data.courseName === data.universityName) {
      warnings.push('Course name matches university name — likely extraction error');
    }

    // 6. Ensure application URL is valid
    if (data.applicationUrl && !data.applicationUrl.startsWith('http')) {
      data.applicationUrl = data.sourceUrl;
    }

    if (warnings.length > 0) {
      this.logger.warn(`Validation warnings:\n  - ${warnings.join('\n  - ')}`);
    }

    return data;
  }

  // ═══════════════════════════════════════════════════════════════
  // Logging
  // ═══════════════════════════════════════════════════════════════

  private logResult(result: ScrapedCourseData): void {
    this.logger.log(
      `Scraped: uni="${result.universityName}" course="${result.courseName}" ` +
      `degree="${result.degree}" lang="${result.language}" dur="${result.duration}" ` +
      `fees=${result.fees} ects=${result.ects} city="${result.city}" ` +
      `deadline="${result.deadline}" via="${result.applicationVia}"`,
    );
  }
}
