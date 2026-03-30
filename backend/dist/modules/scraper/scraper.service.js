"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const common_1 = require("@nestjs/common");
const cheerio = require("cheerio");
const scraper_constants_1 = require("./scraper.constants");
const scraper_utils_1 = require("./scraper.utils");
const scraper_extractors_1 = require("./scraper.extractors");
let ScraperService = ScraperService_1 = class ScraperService {
    constructor() {
        this.logger = new common_1.Logger(ScraperService_1.name);
    }
    async scrapeUniversityCourse(url) {
        this.logger.log(`Scraping URL: ${url}`);
        try {
            const html = await this.fetchWithRetry(url);
            const result = this.parseHTML(html, url);
            this.logResult(result);
            return this.validate(result);
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Scraping failed: ${error.message}`);
            throw new common_1.HttpException(`Failed to scrape URL: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async fetchWithRetry(url, maxRetries = 3, baseTimeoutMs = 20000) {
        let lastError = null;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const ua = scraper_constants_1.USER_AGENTS[attempt % scraper_constants_1.USER_AGENTS.length];
            const timeoutMs = baseTimeoutMs + attempt * 5000;
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
                    if (html.length < 500) {
                        throw new Error('Response too short — likely blocked or error page');
                    }
                    if (/captcha|cloudflare|challenge|bot.detection/i.test(html.substring(0, 2000))) {
                        throw new Error('Bot detection / CAPTCHA detected');
                    }
                    this.logger.debug(`Fetch success on attempt ${attempt + 1} (${html.length} bytes)`);
                    return html;
                }
                finally {
                    clearTimeout(timeout);
                }
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Fetch attempt ${attempt + 1}/${maxRetries} failed: ${error.message}`);
                if (attempt < maxRetries - 1) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        throw new common_1.HttpException(`Failed after ${maxRetries} attempts: ${lastError?.message || 'unknown error'}`, common_1.HttpStatus.BAD_GATEWAY);
    }
    parseHTML(html, url) {
        const $full = cheerio.load(html);
        const $ = cheerio.load(html);
        const baseUrl = new URL(url).origin;
        const hostname = new URL(url).hostname.replace(/^www\./, '');
        const socialLinks = (0, scraper_extractors_1.extractSocialLinks)($full);
        const logoUrl = (0, scraper_extractors_1.extractLogo)($full, baseUrl);
        const sd = (0, scraper_utils_1.extractStructuredData)($full);
        this.logger.debug(`Structured data: ${sd.jsonLd.length} JSON-LD, ${Object.keys(sd.og).length} OG, ${Object.keys(sd.microdata).length} microdata items`);
        $('nav, footer, header, script, style, noscript, [role="navigation"], [role="banner"], .nav, .footer, .header, .sidebar, #nav, #footer, #header, #sidebar, .cookie, .breadcrumb, .banner, .modal, .popup, .advertisement, .ad, [class*="cookie"], [class*="consent"]').remove();
        const cleanText = $('body').text().replace(/\s+/g, ' ').trim();
        const kv = (0, scraper_utils_1.extractKeyValuePairs)($);
        this.logger.debug(`Found ${kv.size} KV pairs`);
        const city = this.safeExtract('city', () => (0, scraper_extractors_1.extractCity)(cleanText, hostname, kv, sd));
        const deadlineResult = this.safeExtract('deadline', () => (0, scraper_extractors_1.extractDeadline)(cleanText, kv, sd), { date: null, internationalDate: null, label: null });
        return {
            universityName: this.safeExtract('universityName', () => (0, scraper_extractors_1.extractUniversityName)($, cleanText, hostname, sd, kv), 'Unknown University'),
            courseName: this.safeExtract('courseName', () => (0, scraper_extractors_1.extractCourseName)($, cleanText, sd, kv), 'Unknown Course'),
            description: this.safeExtract('description', () => (0, scraper_extractors_1.extractDescription)($, sd)),
            degree: this.safeExtract('degree', () => (0, scraper_extractors_1.extractDegree)(cleanText, sd, kv)),
            language: this.safeExtract('language', () => (0, scraper_extractors_1.extractLanguage)(cleanText, kv)),
            duration: this.safeExtract('duration', () => (0, scraper_extractors_1.extractDuration)(cleanText, kv, sd)),
            fees: this.safeExtractNull('fees', () => (0, scraper_extractors_1.extractFees)(cleanText, kv, sd)),
            feesPerSemester: this.safeExtractNull('feesPerSemester', () => (0, scraper_extractors_1.extractFeesPerSemester)(cleanText, kv)),
            currency: 'EUR',
            deadline: deadlineResult.date,
            deadlineInternational: deadlineResult.internationalDate,
            deadlineLabel: deadlineResult.label,
            startDate: this.safeExtractNull('startDate', () => (0, scraper_extractors_1.extractStartDate)(cleanText, kv, sd)),
            applicationUrl: this.safeExtract('applicationUrl', () => (0, scraper_extractors_1.extractApplicationUrl)($, baseUrl, url), url),
            sourceUrl: url,
            logoUrl,
            address: this.safeExtract('address', () => (0, scraper_extractors_1.extractAddress)(cleanText, sd)),
            city,
            ects: this.safeExtractNull('ects', () => (0, scraper_extractors_1.extractECTS)(cleanText, kv, sd)),
            applicationVia: this.safeExtract('applicationVia', () => (0, scraper_extractors_1.detectApplicationVia)(cleanText), 'DIRECT'),
            uniAssistInfo: this.safeExtract('uniAssistInfo', () => (0, scraper_extractors_1.extractUniAssistInfo)(cleanText)),
            requirements: this.safeExtract('requirements', () => (0, scraper_extractors_1.extractRequirements)($, cleanText, kv)),
            linkedinUrl: socialLinks.linkedin,
            instagramUrl: socialLinks.instagram,
            websiteUrl: baseUrl,
            ...(0, scraper_extractors_1.getCityCoordinates)(city),
        };
    }
    safeExtract(fieldName, fn, fallback) {
        try {
            return fn();
        }
        catch (error) {
            this.logger.warn(`Extraction failed for "${fieldName}": ${error.message}`);
            return fallback !== undefined ? fallback : '';
        }
    }
    safeExtractNull(fieldName, fn) {
        try {
            return fn();
        }
        catch (error) {
            this.logger.warn(`Extraction failed for "${fieldName}": ${error.message}`);
            return null;
        }
    }
    validate(data) {
        const warnings = [];
        if (data.deadline) {
            const dl = new Date(data.deadline);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            if (dl < sixMonthsAgo) {
                warnings.push(`Deadline ${data.deadline} is in the past — may be outdated`);
                const nextYear = new Date(dl);
                nextYear.setFullYear(nextYear.getFullYear() + 1);
                data.deadline = nextYear.toISOString().split('T')[0];
            }
        }
        if (data.fees !== null && data.fees > 30000) {
            warnings.push(`Fees ${data.fees}€ seem unusually high for German university`);
        }
        if (data.degree && data.courseName) {
            const degreeIsMaster = /master|m\.?\s*sc|m\.?\s*a\./i.test(data.degree);
            const nameIsBachelor = /bachelor|b\.?\s*sc|b\.?\s*a\./i.test(data.courseName);
            if (degreeIsMaster && nameIsBachelor) {
                warnings.push('Degree says Master but course name mentions Bachelor — possible mismatch');
            }
        }
        if (data.ects !== null && (data.ects < 30 || data.ects > 300)) {
            warnings.push(`ECTS value ${data.ects} seems unusual`);
            if (data.ects < 10 || data.ects > 500)
                data.ects = null;
        }
        if (data.courseName === data.universityName) {
            warnings.push('Course name matches university name — likely extraction error');
        }
        if (data.applicationUrl && !data.applicationUrl.startsWith('http')) {
            data.applicationUrl = data.sourceUrl;
        }
        if (warnings.length > 0) {
            this.logger.warn(`Validation warnings:\n  - ${warnings.join('\n  - ')}`);
        }
        return data;
    }
    logResult(result) {
        this.logger.log(`Scraped: uni="${result.universityName}" course="${result.courseName}" ` +
            `degree="${result.degree}" lang="${result.language}" dur="${result.duration}" ` +
            `fees=${result.fees} ects=${result.ects} city="${result.city}" ` +
            `deadline="${result.deadline}" via="${result.applicationVia}"`);
    }
};
exports.ScraperService = ScraperService;
exports.ScraperService = ScraperService = ScraperService_1 = __decorate([
    (0, common_1.Injectable)()
], ScraperService);
//# sourceMappingURL=scraper.service.js.map