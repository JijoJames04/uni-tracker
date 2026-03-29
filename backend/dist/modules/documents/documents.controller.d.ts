import { Response } from 'express';
import { DocumentsService, DocumentType } from './documents.service';
export declare class DocumentsController {
    private readonly service;
    constructor(service: DocumentsService);
    findByApplication(applicationId: string): Promise<any>;
    getStats(applicationId: string): Promise<{
        total: any;
        byType: any;
        required: DocumentType[];
        completed: DocumentType[];
        missing: DocumentType[];
    }>;
    upload(applicationId: string, file: Express.Multer.File, type: DocumentType, notes?: string): Promise<any>;
    download(id: string, res: Response): Promise<any>;
    remove(id: string): Promise<any>;
}
