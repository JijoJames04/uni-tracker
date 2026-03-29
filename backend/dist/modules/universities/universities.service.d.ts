import { PrismaService } from '../../prisma/prisma.service';
import { ScraperService } from '../scraper/scraper.service';
export declare class CreateUniversityDto {
    name: string;
    logoUrl?: string;
    address?: string;
    city?: string;
    country?: string;
    website?: string;
    description?: string;
}
export declare class CreateCourseDto {
    universityId: string;
    name: string;
    description?: string;
    degree?: string;
    language?: string;
    duration?: string;
    fees?: number;
    feesPerSemester?: number;
    currency?: string;
    deadline?: string;
    startDate?: string;
    applicationUrl?: string;
    sourceUrl?: string;
    ects?: number;
    applicationVia?: 'DIRECT' | 'UNI_ASSIST' | 'BOTH';
    uniAssistInfo?: string;
    requirements?: string;
}
export declare class AddFromUrlDto {
    url: string;
}
export declare class UniversitiesService {
    private prisma;
    private scraperService;
    constructor(prisma: PrismaService, scraperService: ScraperService);
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    create(dto: CreateUniversityDto): Promise<any>;
    update(id: string, dto: Partial<CreateUniversityDto>): Promise<any>;
    remove(id: string): Promise<any>;
    updateCourseDeadline(courseId: string, deadline: string, label?: string): Promise<any>;
    addFromUrl(dto: AddFromUrlDto): Promise<{
        university: any;
        course: any;
        application: any;
    }>;
    private createDefaultChecklist;
    createCourse(dto: CreateCourseDto): Promise<{
        course: any;
        application: any;
    }>;
    getStats(): Promise<{
        total: any;
        draft: any;
        sopWriting: any;
        preparing: any;
        documentsReady: any;
        submitted: any;
        underReview: any;
        approved: any;
        rejected: any;
        waitlisted: any;
        actionNeeded: any;
        totalFees: any;
        upcomingDeadlines: any;
    }>;
}
