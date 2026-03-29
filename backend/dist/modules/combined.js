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
exports.CalendarModule = exports.CalendarController = exports.CalendarService = exports.TimelineModule = exports.TimelineController = exports.TimelineService = exports.ProfileModule = exports.ProfileController = exports.ProfileService = exports.AddTimelineEntryDto = exports.UpdateCalendarEventDto = exports.CreateCalendarEventDto = exports.UpsertProfileDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_3 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
class UpsertProfileDto {
}
exports.UpsertProfileDto = UpsertProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "nationality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "currentAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "homeAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "bachelorDegree", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "bachelorUniversity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "bachelorGrade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "bachelorYear", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "masterDegree", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "masterUniversity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "masterGrade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "masterYear", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "ieltsScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "toeflScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "testDafScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "goetheLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "germanLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "greVerbal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "greQuant", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "greAnalytical", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertProfileDto.prototype, "gmatScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "workExperience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpsertProfileDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "researchInterests", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "publications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "targetDegree", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "targetField", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProfileDto.prototype, "targetSemester", void 0);
class CreateCalendarEventDto {
}
exports.CreateCalendarEventDto = CreateCalendarEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCalendarEventDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCalendarEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCalendarEventDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['DEADLINE', 'INTERVIEW', 'PAYMENT', 'REMINDER', 'MILESTONE']),
    __metadata("design:type", String)
], CreateCalendarEventDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCalendarEventDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCalendarEventDto.prototype, "courseId", void 0);
class UpdateCalendarEventDto {
}
exports.UpdateCalendarEventDto = UpdateCalendarEventDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCalendarEventDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCalendarEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCalendarEventDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCalendarEventDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCalendarEventDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCalendarEventDto.prototype, "completed", void 0);
class AddTimelineEntryDto {
}
exports.AddTimelineEntryDto = AddTimelineEntryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddTimelineEntryDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddTimelineEntryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['STATUS_CHANGE', 'DOCUMENT_UPLOAD', 'NOTE', 'DEADLINE', 'EMAIL', 'PAYMENT']),
    __metadata("design:type", String)
], AddTimelineEntryDto.prototype, "type", void 0);
let ProfileService = class ProfileService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile() {
        const profile = await this.prisma.profile.findFirst();
        return profile || null;
    }
    async upsert(data) {
        const existing = await this.prisma.profile.findFirst();
        if (existing) {
            return this.prisma.profile.update({ where: { id: existing.id }, data });
        }
        return this.prisma.profile.create({ data: { ...data, firstName: data.firstName ?? '', lastName: data.lastName ?? '', email: data.email ?? '' } });
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
let ProfileController = class ProfileController {
    constructor(service) {
        this.service = service;
    }
    get() { return this.service.getProfile(); }
    upsert(body) { return this.service.upsert(body); }
    update(body) { return this.service.upsert(body); }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_2.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "get", null);
__decorate([
    (0, common_2.Post)(),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpsertProfileDto]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "upsert", null);
__decorate([
    (0, common_2.Patch)(),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpsertProfileDto]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "update", null);
exports.ProfileController = ProfileController = __decorate([
    (0, swagger_1.ApiTags)('profile'),
    (0, common_2.Controller)('profile'),
    __metadata("design:paramtypes", [ProfileService])
], ProfileController);
let ProfileModule = class ProfileModule {
};
exports.ProfileModule = ProfileModule;
exports.ProfileModule = ProfileModule = __decorate([
    (0, common_3.Module)({ controllers: [ProfileController], providers: [ProfileService] })
], ProfileModule);
let TimelineService = class TimelineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByApplication(applicationId) {
        return this.prisma.timelineEntry.findMany({
            where: { applicationId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addEntry(applicationId, data) {
        return this.prisma.timelineEntry.create({
            data: {
                applicationId,
                action: data.action,
                description: data.description,
                type: data.type || 'NOTE',
            },
        });
    }
    async remove(id) {
        return this.prisma.timelineEntry.delete({ where: { id } });
    }
};
exports.TimelineService = TimelineService;
exports.TimelineService = TimelineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TimelineService);
let TimelineController = class TimelineController {
    constructor(service) {
        this.service = service;
    }
    findByApplication(id) {
        return this.service.findByApplication(id);
    }
    addEntry(id, body) {
        return this.service.addEntry(id, body);
    }
};
exports.TimelineController = TimelineController;
__decorate([
    (0, common_2.Get)('application/:applicationId'),
    __param(0, (0, common_2.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimelineController.prototype, "findByApplication", null);
__decorate([
    (0, common_2.Post)('application/:applicationId'),
    __param(0, (0, common_2.Param)('applicationId')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddTimelineEntryDto]),
    __metadata("design:returntype", void 0)
], TimelineController.prototype, "addEntry", null);
exports.TimelineController = TimelineController = __decorate([
    (0, swagger_1.ApiTags)('timeline'),
    (0, common_2.Controller)('timeline'),
    __metadata("design:paramtypes", [TimelineService])
], TimelineController);
let TimelineModule = class TimelineModule {
};
exports.TimelineModule = TimelineModule;
exports.TimelineModule = TimelineModule = __decorate([
    (0, common_3.Module)({ controllers: [TimelineController], providers: [TimelineService] })
], TimelineModule);
let CalendarService = class CalendarService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEvents() {
        const [events, deadlines] = await Promise.all([
            this.prisma.calendarEvent.findMany({ orderBy: { date: 'asc' } }),
            this.prisma.course.findMany({
                where: { deadline: { not: null } },
                select: {
                    id: true, name: true, deadline: true,
                    university: { select: { name: true } },
                    application: { select: { id: true, status: true } },
                },
            }),
        ]);
        const deadlineEvents = deadlines.map((c) => ({
            id: `deadline-${c.id}`,
            title: `Deadline: ${c.name}`,
            date: c.deadline,
            type: 'DEADLINE',
            color: '#ef4444',
            courseId: c.id,
            applicationId: c.application?.id,
            daysLeft: c.deadline
                ? Math.ceil((c.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null,
            university: c.university.name,
            isDeadline: true,
        }));
        return [...events, ...deadlineEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    async createEvent(data) {
        return this.prisma.calendarEvent.create({
            data: { ...data, date: new Date(data.date), type: data.type || 'REMINDER' },
        });
    }
    async updateEvent(id, data) {
        const updateData = { ...data };
        if (data.date)
            updateData.date = new Date(data.date);
        return this.prisma.calendarEvent.update({ where: { id }, data: updateData });
    }
    async deleteEvent(id) {
        return this.prisma.calendarEvent.delete({ where: { id } });
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarService);
let CalendarController = class CalendarController {
    constructor(service) {
        this.service = service;
    }
    getEvents() { return this.service.getEvents(); }
    createEvent(body) { return this.service.createEvent(body); }
    updateEvent(id, body) {
        return this.service.updateEvent(id, body);
    }
    deleteEvent(id) { return this.service.deleteEvent(id); }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_2.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "getEvents", null);
__decorate([
    (0, common_2.Post)(),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCalendarEventDto]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "createEvent", null);
__decorate([
    (0, common_2.Patch)(':id'),
    __param(0, (0, common_2.Param)('id')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCalendarEventDto]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "updateEvent", null);
__decorate([
    (0, common_2.Delete)(':id'),
    (0, common_2.HttpCode)(common_2.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete calendar event' }),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "deleteEvent", null);
exports.CalendarController = CalendarController = __decorate([
    (0, swagger_1.ApiTags)('calendar'),
    (0, common_2.Controller)('calendar'),
    __metadata("design:paramtypes", [CalendarService])
], CalendarController);
let CalendarModule = class CalendarModule {
};
exports.CalendarModule = CalendarModule;
exports.CalendarModule = CalendarModule = __decorate([
    (0, common_3.Module)({ controllers: [CalendarController], providers: [CalendarService] })
], CalendarModule);
//# sourceMappingURL=combined.js.map