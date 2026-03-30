import * as cheerio from 'cheerio';
import type { StructuredData, KVPairs, DeadlineResult } from './scraper.types';
export declare function extractUniversityName($: cheerio.CheerioAPI, text: string, hostname: string, sd: StructuredData, kv: KVPairs): string;
export declare function extractCourseName($: cheerio.CheerioAPI, text: string, sd: StructuredData, kv: KVPairs): string;
export declare function extractDescription($: cheerio.CheerioAPI, sd: StructuredData): string;
export declare function extractDegree(text: string, sd: StructuredData, kv: KVPairs): string;
export declare function extractLanguage(text: string, kv: KVPairs): string;
export declare function extractDuration(text: string, kv: KVPairs, sd: StructuredData): string;
export declare function extractFees(text: string, kv: KVPairs, sd: StructuredData): number | null;
export declare function extractFeesPerSemester(text: string, kv: KVPairs): number | null;
export declare function extractDeadline(text: string, kv: KVPairs, sd: StructuredData): DeadlineResult;
export declare function extractStartDate(text: string, kv: KVPairs, sd: StructuredData): string | null;
export declare function extractECTS(text: string, kv: KVPairs, sd: StructuredData): number | null;
export declare function extractCity(text: string, hostname: string, kv: KVPairs, sd: StructuredData): string;
export declare function extractApplicationUrl($: cheerio.CheerioAPI, baseUrl: string, sourceUrl: string): string;
export declare function extractLogo($: cheerio.CheerioAPI, baseUrl: string): string | null;
export declare function extractSocialLinks($: cheerio.CheerioAPI): {
    linkedin: string | null;
    instagram: string | null;
};
export declare function detectApplicationVia(text: string): 'DIRECT' | 'UNI_ASSIST' | 'BOTH';
export declare function extractUniAssistInfo(text: string): string;
export declare function extractAddress(text: string, sd: StructuredData): string;
export declare function extractRequirements($: cheerio.CheerioAPI, text: string, kv: KVPairs): string;
export declare function getCityCoordinates(city: string): {
    latitude: number | null;
    longitude: number | null;
};
