import { ApplicationsService, UpdateApplicationDto, UpdateChecklistDto } from './applications.service';
export declare class ApplicationsController {
    private readonly service;
    constructor(service: ApplicationsService);
    findAll(): Promise<({
        course: {
            university: {
                name: string;
                logoUrl: string | null;
                address: string | null;
                city: string | null;
                country: string;
                website: string | null;
                description: string | null;
                id: string;
                shortName: string | null;
                linkedinUrl: string | null;
                instagramUrl: string | null;
                ranking: number | null;
                latitude: number | null;
                longitude: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            name: string;
            description: string | null;
            universityId: string;
            degree: string | null;
            language: string | null;
            duration: string | null;
            fees: number | null;
            feesPerSemester: number | null;
            currency: string;
            deadline: Date | null;
            startDate: Date | null;
            applicationUrl: string | null;
            sourceUrl: string | null;
            ects: number | null;
            applicationVia: import(".prisma/client").$Enums.ApplicationVia;
            uniAssistInfo: string | null;
            requirements: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deadlineInternational: Date | null;
            deadlineLabel: string | null;
        };
        documents: {
            name: string;
            id: string;
            notes: string | null;
            applicationId: string;
            type: import(".prisma/client").$Enums.DocumentType;
            uploadedAt: Date;
            originalName: string;
            filePath: string;
            fileSize: number;
            mimeType: string;
            version: number;
        }[];
        timeline: {
            description: string | null;
            id: string;
            createdAt: Date;
            applicationId: string;
            action: string;
            type: import(".prisma/client").$Enums.TimelineType;
        }[];
        checklist: {
            id: string;
            createdAt: Date;
            applicationId: string;
            completed: boolean;
            order: number;
            label: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        intake: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        priority: import(".prisma/client").$Enums.Priority;
        notes: string | null;
        appliedAt: Date | null;
        decisionAt: Date | null;
        submissionFee: number | null;
        courseId: string;
    })[]>;
    getKanban(): Promise<Record<string, ({
        course: {
            university: {
                name: string;
                logoUrl: string | null;
                address: string | null;
                city: string | null;
                country: string;
                website: string | null;
                description: string | null;
                id: string;
                shortName: string | null;
                linkedinUrl: string | null;
                instagramUrl: string | null;
                ranking: number | null;
                latitude: number | null;
                longitude: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            name: string;
            description: string | null;
            universityId: string;
            degree: string | null;
            language: string | null;
            duration: string | null;
            fees: number | null;
            feesPerSemester: number | null;
            currency: string;
            deadline: Date | null;
            startDate: Date | null;
            applicationUrl: string | null;
            sourceUrl: string | null;
            ects: number | null;
            applicationVia: import(".prisma/client").$Enums.ApplicationVia;
            uniAssistInfo: string | null;
            requirements: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deadlineInternational: Date | null;
            deadlineLabel: string | null;
        };
        documents: {
            name: string;
            id: string;
            notes: string | null;
            applicationId: string;
            type: import(".prisma/client").$Enums.DocumentType;
            uploadedAt: Date;
            originalName: string;
            filePath: string;
            fileSize: number;
            mimeType: string;
            version: number;
        }[];
        timeline: {
            description: string | null;
            id: string;
            createdAt: Date;
            applicationId: string;
            action: string;
            type: import(".prisma/client").$Enums.TimelineType;
        }[];
        checklist: {
            id: string;
            createdAt: Date;
            applicationId: string;
            completed: boolean;
            order: number;
            label: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        intake: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        priority: import(".prisma/client").$Enums.Priority;
        notes: string | null;
        appliedAt: Date | null;
        decisionAt: Date | null;
        submissionFee: number | null;
        courseId: string;
    })[]>>;
    findOne(id: string): Promise<{
        course: {
            university: {
                name: string;
                logoUrl: string | null;
                address: string | null;
                city: string | null;
                country: string;
                website: string | null;
                description: string | null;
                id: string;
                shortName: string | null;
                linkedinUrl: string | null;
                instagramUrl: string | null;
                ranking: number | null;
                latitude: number | null;
                longitude: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            name: string;
            description: string | null;
            universityId: string;
            degree: string | null;
            language: string | null;
            duration: string | null;
            fees: number | null;
            feesPerSemester: number | null;
            currency: string;
            deadline: Date | null;
            startDate: Date | null;
            applicationUrl: string | null;
            sourceUrl: string | null;
            ects: number | null;
            applicationVia: import(".prisma/client").$Enums.ApplicationVia;
            uniAssistInfo: string | null;
            requirements: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deadlineInternational: Date | null;
            deadlineLabel: string | null;
        };
        documents: {
            name: string;
            id: string;
            notes: string | null;
            applicationId: string;
            type: import(".prisma/client").$Enums.DocumentType;
            uploadedAt: Date;
            originalName: string;
            filePath: string;
            fileSize: number;
            mimeType: string;
            version: number;
        }[];
        timeline: {
            description: string | null;
            id: string;
            createdAt: Date;
            applicationId: string;
            action: string;
            type: import(".prisma/client").$Enums.TimelineType;
        }[];
        checklist: {
            id: string;
            createdAt: Date;
            applicationId: string;
            completed: boolean;
            order: number;
            label: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        intake: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        priority: import(".prisma/client").$Enums.Priority;
        notes: string | null;
        appliedAt: Date | null;
        decisionAt: Date | null;
        submissionFee: number | null;
        courseId: string;
    }>;
    findByCourse(courseId: string): Promise<{
        course: {
            university: {
                name: string;
                logoUrl: string | null;
                address: string | null;
                city: string | null;
                country: string;
                website: string | null;
                description: string | null;
                id: string;
                shortName: string | null;
                linkedinUrl: string | null;
                instagramUrl: string | null;
                ranking: number | null;
                latitude: number | null;
                longitude: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            name: string;
            description: string | null;
            universityId: string;
            degree: string | null;
            language: string | null;
            duration: string | null;
            fees: number | null;
            feesPerSemester: number | null;
            currency: string;
            deadline: Date | null;
            startDate: Date | null;
            applicationUrl: string | null;
            sourceUrl: string | null;
            ects: number | null;
            applicationVia: import(".prisma/client").$Enums.ApplicationVia;
            uniAssistInfo: string | null;
            requirements: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deadlineInternational: Date | null;
            deadlineLabel: string | null;
        };
        documents: {
            name: string;
            id: string;
            notes: string | null;
            applicationId: string;
            type: import(".prisma/client").$Enums.DocumentType;
            uploadedAt: Date;
            originalName: string;
            filePath: string;
            fileSize: number;
            mimeType: string;
            version: number;
        }[];
        timeline: {
            description: string | null;
            id: string;
            createdAt: Date;
            applicationId: string;
            action: string;
            type: import(".prisma/client").$Enums.TimelineType;
        }[];
        checklist: {
            id: string;
            createdAt: Date;
            applicationId: string;
            completed: boolean;
            order: number;
            label: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        intake: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        priority: import(".prisma/client").$Enums.Priority;
        notes: string | null;
        appliedAt: Date | null;
        decisionAt: Date | null;
        submissionFee: number | null;
        courseId: string;
    }>;
    update(id: string, dto: UpdateApplicationDto): Promise<{
        course: {
            university: {
                name: string;
                logoUrl: string | null;
                address: string | null;
                city: string | null;
                country: string;
                website: string | null;
                description: string | null;
                id: string;
                shortName: string | null;
                linkedinUrl: string | null;
                instagramUrl: string | null;
                ranking: number | null;
                latitude: number | null;
                longitude: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            name: string;
            description: string | null;
            universityId: string;
            degree: string | null;
            language: string | null;
            duration: string | null;
            fees: number | null;
            feesPerSemester: number | null;
            currency: string;
            deadline: Date | null;
            startDate: Date | null;
            applicationUrl: string | null;
            sourceUrl: string | null;
            ects: number | null;
            applicationVia: import(".prisma/client").$Enums.ApplicationVia;
            uniAssistInfo: string | null;
            requirements: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deadlineInternational: Date | null;
            deadlineLabel: string | null;
        };
        documents: {
            name: string;
            id: string;
            notes: string | null;
            applicationId: string;
            type: import(".prisma/client").$Enums.DocumentType;
            uploadedAt: Date;
            originalName: string;
            filePath: string;
            fileSize: number;
            mimeType: string;
            version: number;
        }[];
        timeline: {
            description: string | null;
            id: string;
            createdAt: Date;
            applicationId: string;
            action: string;
            type: import(".prisma/client").$Enums.TimelineType;
        }[];
        checklist: {
            id: string;
            createdAt: Date;
            applicationId: string;
            completed: boolean;
            order: number;
            label: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        intake: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        priority: import(".prisma/client").$Enums.Priority;
        notes: string | null;
        appliedAt: Date | null;
        decisionAt: Date | null;
        submissionFee: number | null;
        courseId: string;
    }>;
    updateChecklist(id: string, dto: UpdateChecklistDto): Promise<{
        id: string;
        createdAt: Date;
        applicationId: string;
        completed: boolean;
        order: number;
        label: string;
    }>;
    addChecklistItem(id: string, body: {
        label: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        applicationId: string;
        completed: boolean;
        order: number;
        label: string;
    }>;
    removeChecklistItem(itemId: string): Promise<{
        id: string;
        createdAt: Date;
        applicationId: string;
        completed: boolean;
        order: number;
        label: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    removeAll(): Promise<{
        message: string;
    }>;
}
