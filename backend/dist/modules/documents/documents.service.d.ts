import { PrismaService } from '../../prisma/prisma.service';
export type DocumentType = 'SOP' | 'CV' | 'TRANSCRIPT' | 'BACHELOR_CERTIFICATE' | 'LANGUAGE_CERT_IELTS' | 'LANGUAGE_CERT_TOEFL' | 'LANGUAGE_CERT_TESTDAF' | 'LANGUAGE_CERT_GOETHE' | 'RECOMMENDATION_LETTER' | 'PASSPORT' | 'MOTIVATION_LETTER' | 'PORTFOLIO' | 'RESEARCH_PROPOSAL' | 'OTHER';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    upload(applicationId: string, type: DocumentType, file: Express.Multer.File, notes?: string): Promise<any>;
    findByApplication(applicationId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    getFilePath(id: string): Promise<{
        filePath: string;
        mimeType: string;
        name: string;
    }>;
    remove(id: string): Promise<any>;
    getDocumentStats(applicationId: string): Promise<{
        total: any;
        byType: any;
        required: DocumentType[];
        completed: DocumentType[];
        missing: DocumentType[];
    }>;
}
