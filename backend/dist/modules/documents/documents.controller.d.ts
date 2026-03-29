import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { DocumentsService, DocumentType } from './documents.service';
export declare class DocumentsController {
    private readonly service;
    constructor(service: DocumentsService);
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
    getStats(applicationId: string): Promise<{
        total: number;
        byType: Record<string, number>;
        required: DocumentType[];
        completed: DocumentType[];
        missing: DocumentType[];
    }>;
    upload(applicationId: string, file: Express.Multer.File, type: DocumentType, notes?: string): Promise<{
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
    download(id: string, res: Response): Promise<StreamableFile>;
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
}
