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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
const multer_1 = require("multer");
const documents_service_1 = require("./documents.service");
let DocumentsController = class DocumentsController {
    constructor(service) {
        this.service = service;
    }
    findByApplication(applicationId) {
        return this.service.findByApplication(applicationId);
    }
    getStats(applicationId) {
        return this.service.getDocumentStats(applicationId);
    }
    upload(applicationId, file, type, notes) {
        return this.service.upload(applicationId, type, file, notes);
    }
    async download(id, res) {
        const { filePath, mimeType, name } = await this.service.getFilePath(id);
        const { createReadStream } = await Promise.resolve().then(() => require('fs'));
        const stream = createReadStream(filePath);
        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${name}"`,
        });
        return new common_1.StreamableFile(stream);
    }
    remove(id) { return this.service.remove(id); }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)('application/:applicationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all documents for an application' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findByApplication", null);
__decorate([
    (0, common_1.Get)('application/:applicationId/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document completion stats' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('upload/:applicationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a document for an application' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download a document' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "download", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "remove", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('documents'),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map