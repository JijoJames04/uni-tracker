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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fs = require("fs");
const path = require("path");
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
];
let DocumentsService = class DocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
    }
    async upload(applicationId, type, file, notes) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });
        if (!application)
            throw new common_1.NotFoundException(`Application ${applicationId} not found`);
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('File type not allowed. Use PDF, DOC, DOCX, or images.');
        }
        const existing = await this.prisma.document.findFirst({
            where: { applicationId, type },
            orderBy: { version: 'desc' },
        });
        const version = existing ? existing.version + 1 : 1;
        const ext = path.extname(file.originalname);
        const filename = `${applicationId}_${type}_v${version}_${Date.now()}${ext}`;
        const appDir = path.join(UPLOAD_DIR, applicationId);
        if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir, { recursive: true });
        }
        const filePath = path.join(appDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        const doc = await this.prisma.document.create({
            data: {
                applicationId,
                type,
                name: file.originalname.replace(ext, ''),
                originalName: file.originalname,
                filePath: `${applicationId}/${filename}`,
                fileSize: file.size,
                mimeType: file.mimetype,
                version,
                notes,
            },
        });
        await this.prisma.timelineEntry.create({
            data: {
                applicationId,
                action: `Document uploaded: ${type}`,
                description: `${file.originalname} (v${version})`,
                type: 'DOCUMENT_UPLOAD',
            },
        });
        if (type === 'SOP' && application.status === 'DRAFT') {
            await this.prisma.application.update({
                where: { id: applicationId },
                data: { status: 'SOP_WRITING' },
            });
        }
        return doc;
    }
    async findByApplication(applicationId) {
        return this.prisma.document.findMany({
            where: { applicationId },
            orderBy: [{ type: 'asc' }, { version: 'desc' }],
        });
    }
    async findOne(id) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException(`Document ${id} not found`);
        return doc;
    }
    async getFilePath(id) {
        const doc = await this.findOne(id);
        const fullPath = path.join(UPLOAD_DIR, doc.filePath);
        if (!fs.existsSync(fullPath)) {
            throw new common_1.NotFoundException('File not found on disk');
        }
        return {
            filePath: fullPath,
            mimeType: doc.mimeType,
            name: doc.originalName,
        };
    }
    async remove(id) {
        const doc = await this.findOne(id);
        const fullPath = path.join(UPLOAD_DIR, doc.filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
        return this.prisma.document.delete({ where: { id } });
    }
    async getDocumentStats(applicationId) {
        const docs = await this.findByApplication(applicationId);
        const required = [
            'SOP', 'CV', 'TRANSCRIPT', 'PASSPORT',
        ];
        return {
            total: docs.length,
            byType: docs.reduce((acc, doc) => {
                acc[doc.type] = (acc[doc.type] || 0) + 1;
                return acc;
            }, {}),
            required,
            completed: required.filter((t) => docs.some((d) => d.type === t)),
            missing: required.filter((t) => !docs.some((d) => d.type === t)),
        };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map