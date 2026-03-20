import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';
import { ScraperService } from './scraper.service';

export class ScrapeUrlDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;
}

@ApiTags('scraper')
@Controller('scrape')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Scrape university course data from URL' })
  @ApiResponse({ status: 200, description: 'Course data extracted successfully' })
  async scrapeUrl(@Body() dto: ScrapeUrlDto) {
    return this.scraperService.scrapeUniversityCourse(dto.url);
  }
}
