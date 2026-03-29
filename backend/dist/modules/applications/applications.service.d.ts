import { PrismaService } from '../../prisma/prisma.service';
export declare enum ApplicationStatus {
    DRAFT = "DRAFT",
    SOP_WRITING = "SOP_WRITING",
    DOCUMENTS_PREPARING = "DOCUMENTS_PREPARING",
    DOCUMENTS_READY = "DOCUMENTS_READY",
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    WAITLISTED = "WAITLISTED"
}
export declare enum Priority {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare class UpdateApplicationDto {
    status?: ApplicationStatus;
    notes?: string;
    appliedAt?: string;
    decisionAt?: string;
    priority?: Priority;
    submissionFee?: number;
}
export declare class UpdateChecklistDto {
    id: string;
    completed: boolean;
}
export declare class ApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    addChecklistItem(applicationId: string, label: string): Promise<{
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
    removeAll(): Promise<{
        message: string;
    }>;
    getKanbanView(): Promise<Record<string, ({
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
    private formatStatus;
}
