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
exports.PromptsModule = exports.PromptsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prompts_service_1 = require("./prompts.service");
const common_2 = require("@nestjs/common");
let PromptsController = class PromptsController {
    constructor(service) {
        this.service = service;
    }
    generateSop(id) {
        return this.service.generateSopPrompt(id);
    }
    generateLor(id, recommenderName, recommenderTitle, relationship) {
        return this.service.generateLorPrompt(id, recommenderName, recommenderTitle, relationship);
    }
    generateEmail(id, type = 'inquiry') {
        return this.service.generateEmailPrompt(id, type);
    }
};
exports.PromptsController = PromptsController;
__decorate([
    (0, common_1.Get)('sop/:applicationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate SOP prompt for an application (F06: adaptive)' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromptsController.prototype, "generateSop", null);
__decorate([
    (0, common_1.Get)('lor/:applicationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate LOR prompt for an application (F15)' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Query)('recommenderName')),
    __param(2, (0, common_1.Query)('recommenderTitle')),
    __param(3, (0, common_1.Query)('relationship')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PromptsController.prototype, "generateLor", null);
__decorate([
    (0, common_1.Get)('email/:applicationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate email prompt (inquiry/status/acceptance)' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PromptsController.prototype, "generateEmail", null);
exports.PromptsController = PromptsController = __decorate([
    (0, swagger_1.ApiTags)('prompts'),
    (0, common_1.Controller)('prompts'),
    __metadata("design:paramtypes", [prompts_service_1.PromptsService])
], PromptsController);
let PromptsModule = class PromptsModule {
};
exports.PromptsModule = PromptsModule;
exports.PromptsModule = PromptsModule = __decorate([
    (0, common_2.Module)({
        controllers: [PromptsController],
        providers: [prompts_service_1.PromptsService],
    })
], PromptsModule);
//# sourceMappingURL=prompts.module.js.map