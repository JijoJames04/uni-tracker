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
exports.UniversitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const universities_service_1 = require("./universities.service");
let UniversitiesController = class UniversitiesController {
    constructor(service) {
        this.service = service;
    }
    findAll() { return this.service.findAll(); }
    getStats() { return this.service.getStats(); }
    findOne(id) { return this.service.findOne(id); }
    create(dto) { return this.service.create(dto); }
    addFromUrl(dto) { return this.service.addFromUrl(dto); }
    createCourse(dto) { return this.service.createCourse(dto); }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    updateDeadline(courseId, body) {
        return this.service.updateCourseDeadline(courseId, body.deadline, body.deadlineLabel);
    }
    remove(id) { return this.service.remove(id); }
};
exports.UniversitiesController = UniversitiesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all universities with courses' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get application statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universities_service_1.CreateUniversityDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('from-url'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add university and course from URL (web scraping)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universities_service_1.AddFromUrlDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "addFromUrl", null);
__decorate([
    (0, common_1.Post)('courses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universities_service_1.CreateCourseDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('courses/:courseId/deadline'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "updateDeadline", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "remove", null);
exports.UniversitiesController = UniversitiesController = __decorate([
    (0, swagger_1.ApiTags)('universities'),
    (0, common_1.Controller)('universities'),
    __metadata("design:paramtypes", [universities_service_1.UniversitiesService])
], UniversitiesController);
//# sourceMappingURL=universities.controller.js.map