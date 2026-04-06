import { PrismaService } from '../prisma/prisma.service';
export declare class UpsertProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    nationality?: string;
    currentAddress?: string;
    homeAddress?: string;
    bachelorDegree?: string;
    bachelorUniversity?: string;
    bachelorGrade?: number;
    bachelorYear?: number;
    masterDegree?: string;
    masterUniversity?: string;
    masterGrade?: number;
    masterYear?: number;
    ieltsScore?: number;
    toeflScore?: number;
    testDafScore?: number;
    goetheLevel?: string;
    germanLevel?: string;
    greVerbal?: number;
    greQuant?: number;
    greAnalytical?: number;
    gmatScore?: number;
    workExperience?: string;
    skills?: string[];
    researchInterests?: string;
    publications?: string;
    targetDegree?: string;
    targetField?: string;
    targetSemester?: string;
}
export declare class CreateCalendarEventDto {
    title: string;
    description?: string;
    date: string;
    type?: string;
    color?: string;
    courseId?: string;
}
export declare class UpdateCalendarEventDto {
    title?: string;
    description?: string;
    date?: string;
    type?: string;
    color?: string;
    completed?: boolean;
}
export declare class AddTimelineEntryDto {
    action: string;
    description?: string;
    type?: string;
}
export declare class ProfileService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(): Promise<any>;
    upsert(data: UpsertProfileDto): Promise<any>;
}
export declare class ProfileController {
    private service;
    constructor(service: ProfileService);
    get(): Promise<any>;
    upsert(body: UpsertProfileDto): Promise<any>;
    update(body: UpsertProfileDto): Promise<any>;
}
export declare class ProfileModule {
}
export declare class TimelineService {
    private prisma;
    constructor(prisma: PrismaService);
    findByApplication(applicationId: string): Promise<any>;
    addEntry(applicationId: string, data: AddTimelineEntryDto): Promise<any>;
    remove(id: string): Promise<any>;
}
export declare class TimelineController {
    private service;
    constructor(service: TimelineService);
    findByApplication(id: string): Promise<any>;
    addEntry(id: string, body: AddTimelineEntryDto): Promise<any>;
}
export declare class TimelineModule {
}
export declare class CalendarService {
    private prisma;
    constructor(prisma: PrismaService);
    getEvents(): Promise<any[]>;
    createEvent(data: CreateCalendarEventDto): Promise<any>;
    updateEvent(id: string, data: UpdateCalendarEventDto): Promise<any>;
    deleteEvent(id: string): Promise<any>;
}
export declare class CalendarController {
    private service;
    constructor(service: CalendarService);
    getEvents(): Promise<any[]>;
    createEvent(body: CreateCalendarEventDto): Promise<any>;
    updateEvent(id: string, body: UpdateCalendarEventDto): Promise<any>;
    deleteEvent(id: string): Promise<any>;
}
export declare class CalendarModule {
}
