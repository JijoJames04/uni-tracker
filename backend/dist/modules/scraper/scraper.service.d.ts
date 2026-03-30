import type { ScrapedCourseData } from './scraper.types';
export type { ScrapedCourseData } from './scraper.types';
export declare class ScraperService {
    private readonly logger;
    scrapeUniversityCourse(url: string): Promise<ScrapedCourseData>;
    private fetchWithRetry;
    private parseHTML;
    private safeExtract;
    private safeExtractNull;
    private validate;
    private logResult;
}
