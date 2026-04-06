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
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    findByCourse(courseId: string): Promise<any>;
    update(id: string, dto: UpdateApplicationDto): Promise<any>;
    updateChecklist(id: string, dto: UpdateChecklistDto): Promise<any>;
    addChecklistItem(applicationId: string, label: string): Promise<any>;
    removeChecklistItem(itemId: string): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    removeAll(): Promise<{
        message: string;
    }>;
    getKanbanView(): Promise<Record<string, any>>;
    private formatStatus;
}
