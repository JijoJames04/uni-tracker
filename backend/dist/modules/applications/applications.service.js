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
exports.ApplicationsService = exports.UpdateChecklistDto = exports.UpdateApplicationDto = exports.Priority = exports.ApplicationStatus = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const class_validator_1 = require("class-validator");
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["DRAFT"] = "DRAFT";
    ApplicationStatus["SOP_WRITING"] = "SOP_WRITING";
    ApplicationStatus["DOCUMENTS_PREPARING"] = "DOCUMENTS_PREPARING";
    ApplicationStatus["DOCUMENTS_READY"] = "DOCUMENTS_READY";
    ApplicationStatus["SUBMITTED"] = "SUBMITTED";
    ApplicationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ApplicationStatus["APPROVED"] = "APPROVED";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["WAITLISTED"] = "WAITLISTED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var Priority;
(function (Priority) {
    Priority["HIGH"] = "HIGH";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["LOW"] = "LOW";
})(Priority || (exports.Priority = Priority = {}));
class UpdateApplicationDto {
}
exports.UpdateApplicationDto = UpdateApplicationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ApplicationStatus),
    __metadata("design:type", String)
], UpdateApplicationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateApplicationDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateApplicationDto.prototype, "appliedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateApplicationDto.prototype, "decisionAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Priority),
    __metadata("design:type", String)
], UpdateApplicationDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateApplicationDto.prototype, "submissionFee", void 0);
class UpdateChecklistDto {
}
exports.UpdateChecklistDto = UpdateChecklistDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChecklistDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateChecklistDto.prototype, "completed", void 0);
let ApplicationsService = class ApplicationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.application.findMany({
            include: {
                course: {
                    include: { university: true },
                },
                documents: true,
                timeline: { orderBy: { createdAt: 'desc' }, take: 3 },
                checklist: { orderBy: { order: 'asc' } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(id) {
        const app = await this.prisma.application.findUnique({
            where: { id },
            include: {
                course: { include: { university: true } },
                documents: { orderBy: { uploadedAt: 'desc' } },
                timeline: { orderBy: { createdAt: 'desc' } },
                checklist: { orderBy: { order: 'asc' } },
            },
        });
        if (!app)
            throw new common_1.NotFoundException(`Application ${id} not found`);
        return app;
    }
    async findByCourse(courseId) {
        return this.prisma.application.findUnique({
            where: { courseId },
            include: {
                course: { include: { university: true } },
                documents: true,
                timeline: { orderBy: { createdAt: 'desc' } },
                checklist: { orderBy: { order: 'asc' } },
            },
        });
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        if (dto.status && dto.status !== existing.status) {
            await this.prisma.timelineEntry.create({
                data: {
                    applicationId: id,
                    action: `Status changed to ${this.formatStatus(dto.status)}`,
                    description: `Previous status: ${this.formatStatus(existing.status)}`,
                    type: 'STATUS_CHANGE',
                },
            });
        }
        return this.prisma.application.update({
            where: { id },
            data: {
                ...dto,
                appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
                decisionAt: dto.decisionAt ? new Date(dto.decisionAt) : undefined,
            },
            include: {
                course: { include: { university: true } },
                documents: true,
                timeline: { orderBy: { createdAt: 'desc' } },
                checklist: { orderBy: { order: 'asc' } },
            },
        });
    }
    async updateChecklist(id, dto) {
        return this.prisma.checklistItem.update({
            where: { id: dto.id },
            data: { completed: dto.completed },
        });
    }
    async addChecklistItem(applicationId, label) {
        const lastItem = await this.prisma.checklistItem.findFirst({
            where: { applicationId },
            orderBy: { order: 'desc' },
        });
        return this.prisma.checklistItem.create({
            data: {
                applicationId,
                label,
                order: (lastItem?.order ?? -1) + 1,
            },
        });
    }
    async removeChecklistItem(itemId) {
        return this.prisma.checklistItem.delete({ where: { id: itemId } });
    }
    async remove(id) {
        const app = await this.prisma.application.findUnique({
            where: { id },
            select: { courseId: true, course: { select: { universityId: true } } },
        });
        if (!app)
            throw new common_1.NotFoundException(`Application ${id} not found`);
        const { courseId } = app;
        const { universityId } = app.course;
        await this.prisma.calendarEvent.deleteMany({ where: { courseId } });
        await this.prisma.application.delete({ where: { id } });
        await this.prisma.course.delete({ where: { id: courseId } });
        const remainingCourses = await this.prisma.course.count({
            where: { universityId },
        });
        if (remainingCourses === 0) {
            await this.prisma.university.delete({ where: { id: universityId } });
        }
        return { message: 'Application and course deleted' };
    }
    async removeAll() {
        await this.prisma.calendarEvent.deleteMany({});
        await this.prisma.timelineEntry.deleteMany({});
        await this.prisma.checklistItem.deleteMany({});
        await this.prisma.document.deleteMany({});
        await this.prisma.application.deleteMany({});
        await this.prisma.course.deleteMany({});
        await this.prisma.university.deleteMany({});
        return { message: 'All applications and data deleted' };
    }
    async getKanbanView() {
        const applications = await this.findAll();
        const groups = {};
        for (const status of Object.values(ApplicationStatus)) {
            groups[status] = applications.filter((a) => a.status === status);
        }
        return groups;
    }
    formatStatus(status) {
        return status
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map