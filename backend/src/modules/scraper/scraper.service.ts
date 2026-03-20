import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as cheerio from 'cheerio';

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
}

const UNI_ASSIST_PATTERNS = [
  /uni-assist/i,
  /uni assist/i,
  /apply.*via.*uni.?assist/i,
  /international.*applicants.*uni.?assist/i,
];

const DIRECT_PATTERNS = [
  /apply.*directly/i,
  /online.bewerbung/i,
  /bewerbungsportal/i,
  /apply.*online.*portal/i,
];

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeUniversityCourse(url: string): Promise<ScrapedCourseData> {
    this.logger.log(`Scraping URL: ${url}`);

    try {
      const html = await this.fetchWithTimeout(url);
      return this.parseHTML(html, url);
    } catch (error) {
      this.logger.error(`Scraping failed: ${error.message}`);
      throw new HttpException(
        `Failed to scrape URL: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async fetchWithTimeout(url: string, timeoutMs = 15000): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseHTML(html: string, url: string): ScrapedCourseData {
    const $ = cheerio.load(html);
    const baseUrl = new URL(url).origin;
    const fullText = $('body').text();

    return {
      universityName: this.extractUniversityName($, fullText, url),
      courseName: this.extractCourseName($, fullText),
      description: this.extractDescription($),
      degree: this.extractDegree(fullText),
      language: this.extractLanguage(fullText),
      duration: this.extractDuration(fullText),
      fees: this.extractFees(fullText),
      feesPerSemester: this.extractFeesPerSemester(fullText),
      currency: 'EUR',
      deadline: this.extractDeadline(fullText).date,
      deadlineInternational: this.extractDeadline(fullText).internationalDate,
      deadlineLabel: this.extractDeadline(fullText).label,
      startDate: this.extractStartDate(fullText),
      applicationUrl: this.extractApplicationUrl($, baseUrl, url),
      sourceUrl: url,
      logoUrl: this.extractFavicon($, baseUrl),
      address: this.extractAddress(fullText),
      city: this.extractCity(fullText, url),
      ects: this.extractECTS(fullText),
      applicationVia: this.detectApplicationVia(fullText),
      uniAssistInfo: this.extractUniAssistInfo(fullText),
      requirements: this.extractRequirements($),
    };
  }

  private extractUniversityName($: cheerio.CheerioAPI, fullText: string, url: string): string {
    const ogSiteName = $('meta[property="og:site_name"]').attr('content');
    if (ogSiteName) return ogSiteName.trim();

    const patterns = [
      /(?:University|Universität|Hochschule|Institut|TU|LMU|FU|HU)\s+(?:of\s+)?[\w\s]+/i,
      /[\w\s]+\s+(?:University|Universität|Hochschule)/i,
    ];

    for (const pattern of patterns) {
      const match = fullText.match(pattern);
      if (match) return match[0].trim();
    }

    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts[parts.length - 2].charAt(0).toUpperCase() +
               parts[parts.length - 2].slice(1) + ' University';
      }
    } catch {}

    return 'Unknown University';
  }

  private extractCourseName($: cheerio.CheerioAPI, fullText: string): string {
    const ogTitle = $('meta[property="og:title"]').attr('content');
    if (ogTitle) return ogTitle.trim();

    const h1 = $('h1').first().text().trim();
    if (h1) return h1;

    const title = $('title').text().trim();
    if (title) return title.split('|')[0].trim();

    return 'Unknown Course';
  }

  private extractDescription($: cheerio.CheerioAPI): string {
    const ogDesc = $('meta[property="og:description"]').attr('content');
    if (ogDesc) return ogDesc.trim().substring(0, 1000);

    const metaDesc = $('meta[name="description"]').attr('content');
    if (metaDesc) return metaDesc.trim().substring(0, 1000);

    return '';
  }

  private extractDegree(text: string): string {
    const patterns = [
      /\b(Master|MSc|MA|MEng|MBA|Bachelor|BSc|BA|PhD|Doctorate)\b/i,
      /(\d+(?:st|nd|rd|th)\s+cycle)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1] || match[0];
    }
    return '';
  }

  private extractLanguage(text: string): string {
    if (/german\s+only|only\s+german|deutschsprachig/i.test(text)) return 'German';
    if (/english\s+only|only\s+english|taught\s+in\s+english/i.test(text)) return 'English';
    if (/german\s+and\s+english|bilingual/i.test(text)) return 'German & English';
    return '';
  }

  private extractDuration(text: string): string {
    const patterns = [
      /(\d+\s*(?:semesters?|years?))/i,
      /standard\s+period\s+of\s+study[:\s]+(\d+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return '';
  }

  private extractFees(text: string): number | null {
    const patterns = [
      / tuition\s*fee[s]?[:\s]*[\d,.]+/i,
      / fees[:\s]*[\d,.]+/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = match[0].replace(/[^\d.]/g, '');
        const fees = parseFloat(num);
        if (!isNaN(fees)) return fees;
      }
    }
    return null;
  }

  private extractFeesPerSemester(text: string): number | null {
    const patterns = [
      /(\d+[\d,.]*)\s*(?:€|EUR)\s*\/\s*semester/i,
      /semesterfee[:\s]*(\d+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(num)) return num;
      }
    }
    return null;
  }

  private extractDeadline(text: string): { date: string | null; internationalDate: string | null; label: string | null } {
    const result = { date: null as string | null, internationalDate: null as string | null, label: null as string | null };
    
    const patterns = [
      /(?:application\s+deadline|deadline|apply\s+by)[:\s]*(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{2,4})/i,
      /(?:deadline|apply\s+until)[:\s]*(?:by\s+)?(\d{1,2}\s+\w+\s+\d{4})/i,
    ];

    const intlPatterns = [
      /(?:international|non-?eu|non-?german|foreign)\s*(?:students?)?\s*(?:deadline|apply\s+by)[:\s]*(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{2,4})/gi,
      /(?:deadline|apply\s+until).*?(?:international|non-?eu|non-?german)[:\s]*(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{2,4})/gi,
      /(?:for\s+)?(?:international|non-?eu|non-?german)\s+students?[:\s]*(\d{1,2}\s+\w+\s+\d{4})/gi,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && !result.date) result.date = match[1];
    }

    for (const pattern of intlPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 1 && !result.internationalDate) {
        result.internationalDate = matches[1][1];
        result.label = 'International Students';
      } else if (matches.length === 1 && !result.date) {
        result.date = matches[0][1];
        result.label = 'International Students';
      }
    }

    if (!result.date && !result.internationalDate) {
      const allDeadlines = text.match(/(?:deadline|apply\s+by|apply\s+until)[:\s]*(?:\w+\s+)?(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})/gi);
      if (allDeadlines && allDeadlines.length >= 2) {
        const dates = allDeadlines.map(d => d.replace(/.*?[:\s]+/, ''));
        result.date = dates[0];
        result.internationalDate = dates[1];
        result.label = 'Multiple Deadlines';
      }
    }

    return result;
  }

  private extractStartDate(text: string): string | null {
    if (/winter\s+semester/i.test(text)) return 'Winter';
    if (/summer\s+semester/i.test(text)) return 'Summer';
    return null;
  }

  private extractApplicationUrl($: cheerio.CheerioAPI, baseUrl: string, sourceUrl: string): string {
    const applyBtn = $('a[href*="apply"], a[href*="bewerbung"], a[href*="application"]').first().attr('href');
    if (applyBtn) {
      if (applyBtn.startsWith('http')) return applyBtn;
      if (applyBtn.startsWith('/')) return baseUrl + applyBtn;
      return baseUrl + '/' + applyBtn;
    }
    return sourceUrl;
  }

  private extractFavicon($: cheerio.CheerioAPI, baseUrl: string): string | null {
    const selectors = [
      'link[rel="icon"][type="image/png"]',
      'link[rel="icon"][type="image/svg+xml"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]',
      'link[rel="icon"]',
    ];

    for (const selector of selectors) {
      const icon = $(selector).first().attr('href');
      if (icon && !icon.endsWith('.ico')) {
        return this.resolveFaviconUrl(icon, baseUrl);
      }
    }

    for (const selector of selectors) {
      const icon = $(selector).first().attr('href');
      if (icon) {
        return this.resolveFaviconUrl(icon, baseUrl);
      }
    }

    const commonPaths = ['/favicon.png', '/favicon.svg', '/assets/favicon.png', '/images/logo.png'];
    for (const path of commonPaths) {
      return baseUrl + path;
    }

    return baseUrl + '/favicon.ico';
  }

  private resolveFaviconUrl(favicon: string, baseUrl: string): string {
    if (favicon.startsWith('http')) return favicon;
    if (favicon.startsWith('//')) return 'https:' + favicon;
    if (favicon.startsWith('/')) return baseUrl + favicon;
    return baseUrl + '/' + favicon;
  }

  private extractAddress(text: string): string {
    const patterns = [
      /(?:address|anschrift)[:\s]+([^\n]+(?:\n[^\n]+)?)/i,
      /\d{4,5}\s+[A-Za-z\s]+,?\s+Germany/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0].trim().substring(0, 200);
    }
    return '';
  }

  private extractCity(text: string, url: string): string {
    const germanCities = [
      'Berlin', 'Munich', 'München', 'Hamburg', 'Frankfurt', 'Cologne', 'Köln',
      'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dresden', 'Heidelberg', 'Freiburg',
      'Münster', 'Hannover', 'Nuremberg', 'Nürnberg', 'Bremen', 'Bochum',
      'Dortmund', 'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Bielefeld',
      'Bonn', 'Aachen', 'Constance', 'Konstanz', 'Jena', 'Erfurt',
    ];

    for (const city of germanCities) {
      if (text.includes(city)) return city;
    }

    try {
      const hostname = new URL(url).hostname;
      const match = hostname.match(/(?:^|\.)([a-zA-Z]+)\.(?:de|uni|edu)/);
      if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    } catch {}

    return '';
  }

  private extractECTS(text: string): number | null {
    const match = text.match(/(\d{2,3})\s*ECTS/i);
    if (match) return parseInt(match[1], 10);
    return null;
  }

  private detectApplicationVia(text: string): 'DIRECT' | 'UNI_ASSIST' | 'BOTH' {
    const hasUniAssist = UNI_ASSIST_PATTERNS.some((p) => p.test(text));
    const hasDirect = DIRECT_PATTERNS.some((p) => p.test(text));

    if (hasUniAssist && hasDirect) return 'BOTH';
    if (hasUniAssist) return 'UNI_ASSIST';
    return 'DIRECT';
  }

  private extractUniAssistInfo(text: string): string {
    if (!/uni.?assist/i.test(text)) return '';

    const match = text.match(/(?:uni.?assist)[^\n.]*(?:\n[^\n.]*){0,2}/i);
    return match ? match[0].trim().substring(0, 300) : 'Application via uni-assist required';
  }

  private extractRequirements($: cheerio.CheerioAPI): string {
    const $body = $('body');
    const text = $body.text();
    
    const validKeywords = [
      'requirement', 'qualification', 'eligibility', 'prerequisite',
      'bachelor', 'master', 'degree', 'gpa', 'cgpa', 'diploma',
      'toefl', 'ielts', 'dsh', 'language certificate', 'english proficiency',
      'transcript', 'recommendation', 'curriculum vitae', 'cv', 'resume',
      'minimum grade', 'gpa', 'cgpa', 'academic record'
    ];

    const isValidRequirements = (text: string): boolean => {
      const lower = text.toLowerCase();
      return validKeywords.some(kw => lower.includes(kw));
    };

    const patterns = [
      /(?:entry\s*requirements?|admission\s*requirements?|application\s*requirements?|prerequisites?|eligibility)[:\s]*(.{40,350})/gi,
      /(?:minimum|required|needed|necessary)\s*(?:qualification|requirement|degree|grade|gpa)[:\s]*(.{30,300})/gi,
      /(?:bachelor|master|diploma)\s*(?:degree\s*)?(?:required|needed|minimum)?[:\s]*(.{30,250})/gi,
      /(?:gpa|cgpa)[:\s]*(.{20,200})/gi,
      /(?:toefl|ielts|dsh|testdaf|language\s*(?:certificate|requirement|proficiency))[:\s]*(.{30,250})/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const cleaned = match[1]
            .replace(/\s+/g, ' ')
            .replace(/[|»«→←•·]/g, ', ')
            .replace(/,(?=\s*,)/g, '')
            .replace(/^\W+|\W+$/g, '')
            .trim()
            .substring(0, 500);
          if (cleaned.length > 35 && isValidRequirements(cleaned)) {
            return cleaned;
          }
        }
      }
    }

    return '';
  }
}
