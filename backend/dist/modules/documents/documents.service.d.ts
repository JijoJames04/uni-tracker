import { PrismaService } from '../../prisma/prisma.service';
export type DocumentType = 'SOP' | 'CV' | 'TRANSCRIPT' | 'BACHELOR_CERTIFICATE' | 'LANGUAGE_CERT_IELTS' | 'LANGUAGE_CERT_TOEFL' | 'LANGUAGE_CERT_TESTDAF' | 'LANGUAGE_CERT_GOETHE' | 'RECOMMENDATION_LETTER' | 'PASSPORT' | 'MOTIVATION_LETTER' | 'PORTFOLIO' | 'RESEARCH_PROPOSAL' | 'OTHER';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    upload(applicationId: string, type: DocumentType, file: Express.Multer.File, notes?: string): Promise<{
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
    }>;
    findByApplication(applicationId: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    getFilePath(id: string): Promise<{
        filePath: string;
        mimeType: string;
        name: string;
    }>;
    remove(id: string): Promise<{
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
    }>;
    getDocumentStats(applicationId: string): Promise<{
        total: number;
        byType: Record<string, number>;
        required: DocumentType[];
        completed: DocumentType[];
        missing: DocumentType[];
    }>;
}
