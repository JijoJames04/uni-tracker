import { ScraperService } from './scraper.service';
export declare class ScrapeUrlDto {
    url: string;
}
export declare class ScraperController {
    private readonly scraperService;
    constructor(scraperService: ScraperService);
    scrapeUrl(dto: ScrapeUrlDto): Promise<import("./scraper.service").ScrapedCourseData>;
}
