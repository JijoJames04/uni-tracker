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
    getProfile(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        nationality: string | null;
        dateOfBirth: Date | null;
        currentAddress: string | null;
        homeAddress: string | null;
        bachelorDegree: string | null;
        bachelorUniversity: string | null;
        bachelorGrade: number | null;
        bachelorYear: number | null;
        masterDegree: string | null;
        masterUniversity: string | null;
        masterGrade: number | null;
        masterYear: number | null;
        ieltsScore: number | null;
        ieltsDate: Date | null;
        toeflScore: number | null;
        toeflDate: Date | null;
        testDafScore: number | null;
        testDafDate: Date | null;
        goetheLevel: string | null;
        germanLevel: string | null;
        greVerbal: number | null;
        greQuant: number | null;
        greAnalytical: number | null;
        gmatScore: number | null;
        workExperience: string | null;
        skills: string[];
        researchInterests: string | null;
        publications: string | null;
        targetDegree: string | null;
        targetField: string | null;
        targetSemester: string | null;
    }>;
    upsert(data: UpsertProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        nationality: string | null;
        dateOfBirth: Date | null;
        currentAddress: string | null;
        homeAddress: string | null;
        bachelorDegree: string | null;
        bachelorUniversity: string | null;
        bachelorGrade: number | null;
        bachelorYear: number | null;
        masterDegree: string | null;
        masterUniversity: string | null;
        masterGrade: number | null;
        masterYear: number | null;
        ieltsScore: number | null;
        ieltsDate: Date | null;
        toeflScore: number | null;
        toeflDate: Date | null;
        testDafScore: number | null;
        testDafDate: Date | null;
        goetheLevel: string | null;
        germanLevel: string | null;
        greVerbal: number | null;
        greQuant: number | null;
        greAnalytical: number | null;
        gmatScore: number | null;
        workExperience: string | null;
        skills: string[];
        researchInterests: string | null;
        publications: string | null;
        targetDegree: string | null;
        targetField: string | null;
        targetSemester: string | null;
    }>;
}
export declare class ProfileController {
    private service;
    constructor(service: ProfileService);
    get(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        nationality: string | null;
        dateOfBirth: Date | null;
        currentAddress: string | null;
        homeAddress: string | null;
        bachelorDegree: string | null;
        bachelorUniversity: string | null;
        bachelorGrade: number | null;
        bachelorYear: number | null;
        masterDegree: string | null;
        masterUniversity: string | null;
        masterGrade: number | null;
        masterYear: number | null;
        ieltsScore: number | null;
        ieltsDate: Date | null;
        toeflScore: number | null;
        toeflDate: Date | null;
        testDafScore: number | null;
        testDafDate: Date | null;
        goetheLevel: string | null;
        germanLevel: string | null;
        greVerbal: number | null;
        greQuant: number | null;
        greAnalytical: number | null;
        gmatScore: number | null;
        workExperience: string | null;
        skills: string[];
        researchInterests: string | null;
        publications: string | null;
        targetDegree: string | null;
        targetField: string | null;
        targetSemester: string | null;
    }>;
    upsert(body: UpsertProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        nationality: string | null;
        dateOfBirth: Date | null;
        currentAddress: string | null;
        homeAddress: string | null;
        bachelorDegree: string | null;
        bachelorUniversity: string | null;
        bachelorGrade: number | null;
        bachelorYear: number | null;
        masterDegree: string | null;
        masterUniversity: string | null;
        masterGrade: number | null;
        masterYear: number | null;
        ieltsScore: number | null;
        ieltsDate: Date | null;
        toeflScore: number | null;
        toeflDate: Date | null;
        testDafScore: number | null;
        testDafDate: Date | null;
        goetheLevel: string | null;
        germanLevel: string | null;
        greVerbal: number | null;
        greQuant: number | null;
        greAnalytical: number | null;
        gmatScore: number | null;
        workExperience: string | null;
        skills: string[];
        researchInterests: string | null;
        publications: string | null;
        targetDegree: string | null;
        targetField: string | null;
        targetSemester: string | null;
    }>;
    update(body: UpsertProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        nationality: string | null;
        dateOfBirth: Date | null;
        currentAddress: string | null;
        homeAddress: string | null;
        bachelorDegree: string | null;
        bachelorUniversity: string | null;
        bachelorGrade: number | null;
        bachelorYear: number | null;
        masterDegree: string | null;
        masterUniversity: string | null;
        masterGrade: number | null;
        masterYear: number | null;
        ieltsScore: number | null;
        ieltsDate: Date | null;
        toeflScore: number | null;
        toeflDate: Date | null;
        testDafScore: number | null;
        testDafDate: Date | null;
        goetheLevel: string | null;
        germanLevel: string | null;
        greVerbal: number | null;
        greQuant: number | null;
        greAnalytical: number | null;
        gmatScore: number | null;
        workExperience: string | null;
        skills: string[];
        researchInterests: string | null;
        publications: string | null;
        targetDegree: string | null;
        targetField: string | null;
        targetSemester: string | null;
    }>;
}
export declare class ProfileModule {
}
export declare class TimelineService {
    private prisma;
    constructor(prisma: PrismaService);
    findByApplication(applicationId: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        applicationId: string;
        action: string;
        type: import(".prisma/client").$Enums.TimelineType;
    }[]>;
    addEntry(applicationId: string, data: AddTimelineEntryDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        applicationId: string;
        action: string;
        type: import(".prisma/client").$Enums.TimelineType;
    }>;
    remove(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        applicationId: string;
        action: string;
        type: import(".prisma/client").$Enums.TimelineType;
    }>;
}
export declare class TimelineController {
    private service;
    constructor(service: TimelineService);
    findByApplication(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        applicationId: string;
        action: string;
        type: import(".prisma/client").$Enums.TimelineType;
    }[]>;
    addEntry(id: string, body: AddTimelineEntryDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        applicationId: string;
        action: string;
        type: import(".prisma/client").$Enums.TimelineType;
    }>;
}
export declare class TimelineModule {
}
export declare class CalendarService {
    private prisma;
    constructor(prisma: PrismaService);
    getEvents(): Promise<({
        title: string;
        description: string | null;
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: import(".prisma/client").$Enums.EventType;
        completed: boolean;
        date: Date;
        color: string | null;
    } | {
        id: string;
        title: string;
        date: Date;
        type: string;
        color: string;
        courseId: string;
        applicationId: string;
        daysLeft: number;
        university: string;
        isDeadline: boolean;
    })[]>;
    createEvent(data: CreateCalendarEventDto): Promise<{
        title: string;
        description: string | null;
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: import(".prisma/client").$Enums.EventType;
        completed: boolean;
        date: Date;
        color: string | null;
    }>;
    updateEvent(id: string, data: UpdateCalendarEventDto): Promise<{
        title: string;
        description: string | null;
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: import(".prisma/client").$Enums.EventType;
        completed: boolean;
        date: Date;
        color: string | null;
    }>;
    deleteEvent(id: string): Promise<{
        title: string;
        description: string | null;
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: import(".prisma/client").$Enums.EventType;
        completed: boolean;
        date: Date;
        color: string | null;
    }>;
}
export declare class CalendarController {
    private service;
    constructor(service: CalendarService);
    getEvents(): Promise<({
        title: string;
        description: string | null;
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: import(".prisma/client").$Enums.EventType;
        completed: boolean;
        date: Date;
        color: string | null;
    } | {
        id: string;
        title: string;
        date: Date;
        type: string;
        color: string;
        courseId: string;
        applicationId: string;
        daysLeft: number;
        university: string;
        isDeadline: boolean;
    })[]>;
    createEvent(body: CreateCalendarEventDto): Promise<{
        title: string;
        description: string | null;
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: import(".prisma/client").$Enums.EventType;
        completed: boolean;
        date: Date;
        color: string | null;
    }>;
    updateEvent(id: string, body: UpdateCalendarEventDto): Promise<{
        title: string;
        description: string | null;
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: import(".prisma/client").$Enums.EventType;
        completed: boolean;
        date: Date;
        color: string | null;
    }>;
    deleteEvent(id: string): Promise<{
        title: string;
        description: string | null;
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: import(".prisma/client").$Enums.EventType;
        completed: boolean;
        date: Date;
        color: string | null;
    }>;
}
export declare class CalendarModule {
}
