"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperController = exports.ScrapeUrlDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const scraper_service_1 = require("./scraper.service");
class ScrapeUrlDto {
}
exports.ScrapeUrlDto = ScrapeUrlDto;
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'Please provide a valid URL' }),
    __metadata("design:type", String)
], ScrapeUrlDto.prototype, "url", void 0);
let ScraperController = class ScraperController {
    constructor(scraperService) {
        this.scraperService = scraperService;
    }
    async scrapeUrl(dto) {
        return this.scraperService.scrapeUniversityCourse(dto.url);
    }
};
exports.ScraperController = ScraperController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Scrape university course data from URL' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course data extracted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ScrapeUrlDto]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "scrapeUrl", null);
exports.ScraperController = ScraperController = __decorate([
    (0, swagger_1.ApiTags)('scraper'),
    (0, common_1.Controller)('scrape'),
    __metadata("design:paramtypes", [scraper_service_1.ScraperService])
], ScraperController);
//# sourceMappingURL=scraper.controller.js.map