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
exports.UniversitiesService = exports.AddFromUrlDto = exports.CreateCourseDto = exports.CreateUniversityDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const scraper_service_1 = require("../scraper/scraper.service");
const class_validator_1 = require("class-validator");
class CreateUniversityDto {
}
exports.CreateUniversityDto = CreateUniversityDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUniversityDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUniversityDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUniversityDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUniversityDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUniversityDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUniversityDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUniversityDto.prototype, "description", void 0);
class CreateCourseDto {
}
exports.CreateCourseDto = CreateCourseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "universityId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "degree", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "fees", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "feesPerSemester", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "deadline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "applicationUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "sourceUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "ects", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "applicationVia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "uniAssistInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "requirements", void 0);
class AddFromUrlDto {
}
exports.AddFromUrlDto = AddFromUrlDto;
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'Please provide a valid URL' }),
    __metadata("design:type", String)
], AddFromUrlDto.prototype, "url", void 0);
let UniversitiesService = class UniversitiesService {
    constructor(prisma, scraperService) {
        this.prisma = prisma;
        this.scraperService = scraperService;
    }
    async findAll() {
        return this.prisma.university.findMany({
            include: {
                courses: {
                    include: {
                        application: { select: { status: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const university = await this.prisma.university.findUnique({
            where: { id },
            include: {
                courses: {
                    include: {
                        application: {
                            include: {
                                documents: true,
                                timeline: { orderBy: { createdAt: 'desc' } },
                            },
                        },
                    },
                },
            },
        });
        if (!university)
            throw new common_1.NotFoundException(`University ${id} not found`);
        return university;
    }
    async create(dto) {
        const canonicalName = (0, scraper_service_1.normalizeUniversityName)(dto.name);
        const shortName = (0, scraper_service_1.getUniversityShortName)(canonicalName);
        const existing = await this.prisma.university.findFirst({
            where: {
                OR: [
                    { name: { equals: canonicalName, mode: 'insensitive' } },
                    { name: { equals: dto.name, mode: 'insensitive' } },
                ],
            },
        });
        if (existing)
            return existing;
        return this.prisma.university.create({
            data: {
                ...dto,
                name: canonicalName,
                shortName: shortName ?? undefined,
            },
        });
    }
    async update(id, dto) {
        return this.prisma.university.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const courses = await this.prisma.course.findMany({
            where: { universityId: id },
            select: { id: true },
        });
        const courseIds = courses.map((c) => c.id);
        if (courseIds.length > 0) {
            await this.prisma.calendarEvent.deleteMany({
                where: { courseId: { in: courseIds } },
            });
        }
        return this.prisma.university.delete({ where: { id } });
    }
    async updateCourseDeadline(courseId, deadline, label) {
        return this.prisma.course.update({
            where: { id: courseId },
            data: {
                deadline: new Date(deadline),
                deadlineLabel: label,
            },
            include: { university: true },
        });
    }
    async addFromUrl(dto) {
        const scraped = await this.scraperService.scrapeUniversityCourse(dto.url);
        const canonicalName = (0, scraper_service_1.normalizeUniversityName)(scraped.universityName);
        let university = await this.prisma.university.findFirst({
            where: {
                OR: [
                    { name: { equals: canonicalName, mode: 'insensitive' } },
                    { name: { contains: canonicalName, mode: 'insensitive' } },
                    { name: { equals: scraped.universityName, mode: 'insensitive' } },
                    { name: { contains: scraped.universityName, mode: 'insensitive' } },
                ],
            },
        });
        if (!university) {
            university = await this.prisma.university.create({
                data: {
                    name: canonicalName,
                    shortName: (0, scraper_service_1.getUniversityShortName)(canonicalName),
                    logoUrl: scraped.logoUrl,
                    address: scraped.address,
                    city: scraped.city,
                    website: scraped.websiteUrl || scraped.applicationUrl,
                    linkedinUrl: scraped.linkedinUrl,
                    instagramUrl: scraped.instagramUrl,
                    latitude: scraped.latitude,
                    longitude: scraped.longitude,
                    country: 'Germany',
                },
            });
        }
        const existingCourse = await this.prisma.course.findFirst({
            where: {
                universityId: university.id,
                name: { equals: scraped.courseName, mode: 'insensitive' },
            },
            include: { application: true },
        });
        if (existingCourse) {
            throw new common_1.ConflictException(`An application for "${existingCourse.name}" at this university already exists`);
        }
        const course = await this.prisma.course.create({
            data: {
                universityId: university.id,
                name: scraped.courseName,
                description: scraped.description,
                degree: scraped.degree,
                language: scraped.language,
                duration: scraped.duration,
                fees: scraped.fees,
                feesPerSemester: scraped.feesPerSemester,
                currency: scraped.currency,
                deadline: scraped.deadline ? new Date(scraped.deadline) : null,
                deadlineInternational: scraped.deadlineInternational ? new Date(scraped.deadlineInternational) : null,
                deadlineLabel: scraped.deadlineLabel,
                startDate: scraped.startDate && !['Winter', 'Summer'].includes(scraped.startDate) ? new Date(scraped.startDate) : null,
                applicationUrl: scraped.applicationUrl,
                sourceUrl: scraped.sourceUrl,
                ects: scraped.ects,
                applicationVia: scraped.applicationVia,
                uniAssistInfo: scraped.uniAssistInfo,
                requirements: scraped.requirements,
            },
        });
        const application = await this.prisma.application.create({
            data: {
                courseId: course.id,
                status: 'DRAFT',
            },
        });
        await this.createDefaultChecklist(application.id);
        await this.prisma.timelineEntry.create({
            data: {
                applicationId: application.id,
                action: 'Course Added',
                description: `Added ${scraped.courseName} at ${scraped.universityName} from URL`,
                type: 'NOTE',
            },
        });
        return { university, course, application };
    }
    async createDefaultChecklist(applicationId) {
        const defaultItems = [
            'Write Statement of Purpose (SOP)',
            'Prepare CV/Resume',
            'Gather academic transcripts',
            'Obtain language certificate',
            'Get recommendation letters',
            'Prepare copy of passport',
            'Check application portal',
            'Submit application',
            'Pay application fee',
        ];
        await this.prisma.checklistItem.createMany({
            data: defaultItems.map((label, index) => ({
                applicationId,
                label,
                order: index,
            })),
        });
    }
    async createCourse(dto) {
        const existingCourse = await this.prisma.course.findFirst({
            where: {
                universityId: dto.universityId,
                name: { equals: dto.name, mode: 'insensitive' },
            },
            include: { university: true, application: true },
        });
        if (existingCourse) {
            throw new common_1.ConflictException(`An application for "${dto.name}" at ${existingCourse.university.name} already exists`);
        }
        const course = await this.prisma.course.create({
            data: {
                ...dto,
                deadline: dto.deadline ? new Date(dto.deadline) : null,
                startDate: dto.startDate && !['Winter', 'Summer'].includes(dto.startDate) ? new Date(dto.startDate) : null,
            },
            include: { university: true },
        });
        const application = await this.prisma.application.create({
            data: { courseId: course.id, status: 'DRAFT' },
        });
        await this.createDefaultChecklist(application.id);
        return { course, application };
    }
    async getStats() {
        const [total, byStatus, totalFees, upcoming,] = await Promise.all([
            this.prisma.application.count(),
            this.prisma.application.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.course.aggregate({
                _sum: { fees: true },
                where: { application: { status: { notIn: ['REJECTED'] } } },
            }),
            this.prisma.course.findMany({
                where: {
                    deadline: { gte: new Date() },
                    application: { status: { notIn: ['APPROVED', 'REJECTED'] } },
                },
                orderBy: { deadline: 'asc' },
                take: 5,
                include: { university: true, application: true },
            }),
        ]);
        const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));
        return {
            total,
            draft: statusMap['DRAFT'] || 0,
            sopWriting: statusMap['SOP_WRITING'] || 0,
            preparing: statusMap['DOCUMENTS_PREPARING'] || 0,
            documentsReady: statusMap['DOCUMENTS_READY'] || 0,
            submitted: statusMap['SUBMITTED'] || 0,
            underReview: statusMap['UNDER_REVIEW'] || 0,
            approved: statusMap['APPROVED'] || 0,
            rejected: statusMap['REJECTED'] || 0,
            waitlisted: statusMap['WAITLISTED'] || 0,
            actionNeeded: (statusMap['DRAFT'] || 0) + (statusMap['SOP_WRITING'] || 0) + (statusMap['DOCUMENTS_PREPARING'] || 0),
            totalFees: totalFees._sum.fees || 0,
            upcomingDeadlines: upcoming,
        };
    }
};
exports.UniversitiesService = UniversitiesService;
exports.UniversitiesService = UniversitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scraper_service_1.ScraperService])
], UniversitiesService);
//# sourceMappingURL=universities.service.js.map