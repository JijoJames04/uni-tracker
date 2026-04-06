import { UniversitiesService, CreateUniversityDto, CreateCourseDto, AddFromUrlDto } from './universities.service';
export declare class UniversitiesController {
    private readonly service;
    constructor(service: UniversitiesService);
    findAll(): Promise<any>;
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
    findOne(id: string): Promise<any>;
    create(dto: CreateUniversityDto): Promise<any>;
    addFromUrl(dto: AddFromUrlDto): Promise<{
        university: any;
        course: any;
        application: any;
    }>;
    createCourse(dto: CreateCourseDto): Promise<{
        course: any;
        application: any;
    }>;
    updateDeadline(courseId: string, body: {
        deadline: string;
        deadlineLabel?: string;
    }): Promise<any>;
    update(id: string, dto: Partial<CreateUniversityDto>): Promise<any>;
    remove(id: string): Promise<any>;
}
