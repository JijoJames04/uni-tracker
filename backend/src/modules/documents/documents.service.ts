import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export type DocumentType =
  | 'SOP' | 'CV' | 'TRANSCRIPT' | 'BACHELOR_CERTIFICATE'
  | 'LANGUAGE_CERT_IELTS' | 'LANGUAGE_CERT_TOEFL' | 'LANGUAGE_CERT_TESTDAF'
  | 'LANGUAGE_CERT_GOETHE' | 'RECOMMENDATION_LETTER' | 'PASSPORT'
  | 'MOTIVATION_LETTER' | 'PORTFOLIO' | 'RESEARCH_PROPOSAL' | 'OTHER';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {
    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async upload(
    applicationId: string,
    type: DocumentType,
    file: Express.Multer.File,
    notes?: string,
  ) {
    // Validate application exists
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException(`Application ${applicationId} not found`);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed. Use PDF, DOC, DOCX, or images.');
    }

    // Check if version exists (versioning)
    const existing = await this.prisma.document.findFirst({
      where: { applicationId, type },
      orderBy: { version: 'desc' },
    });

    const version = existing ? existing.version + 1 : 1;

    // Build unique filepath
    const ext = path.extname(file.originalname);
    const filename = `${applicationId}_${type}_v${version}_${Date.now()}${ext}`;
    const appDir = path.join(UPLOAD_DIR, applicationId);

    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    const filePath = path.join(appDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    const doc = await this.prisma.document.create({
      data: {
        applicationId,
        type,
        name: file.originalname.replace(ext, ''),
        originalName: file.originalname,
        filePath: `${applicationId}/${filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        version,
        notes,
      },
    });

    // Log to timeline
    await this.prisma.timelineEntry.create({
      data: {
        applicationId,
        action: `Document uploaded: ${type}`,
        description: `${file.originalname} (v${version})`,
        type: 'DOCUMENT_UPLOAD',
      },
    });

    // Update application status if SOP uploaded
    if (type === 'SOP' && application.status === 'DRAFT') {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { status: 'SOP_WRITING' },
      });
    }

    return doc;
  }

  async findByApplication(applicationId: string) {
    return this.prisma.document.findMany({
      where: { applicationId },
      orderBy: [{ type: 'asc' }, { version: 'desc' }],
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async getFilePath(id: string): Promise<{ filePath: string; mimeType: string; name: string }> {
    const doc = await this.findOne(id);
    const fullPath = path.join(UPLOAD_DIR, doc.filePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File not found on disk');
    }

    return {
      filePath: fullPath,
      mimeType: doc.mimeType,
      name: doc.originalName,
    };
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    const fullPath = path.join(UPLOAD_DIR, doc.filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return this.prisma.document.delete({ where: { id } });
  }

  async getDocumentStats(applicationId: string) {
    const docs = await this.findByApplication(applicationId);
    const required: DocumentType[] = [
      'SOP', 'CV', 'TRANSCRIPT', 'PASSPORT',
    ];

    return {
      total: docs.length,
      byType: docs.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      required,
      completed: required.filter((t) => docs.some((d) => d.type === t)),
      missing: required.filter((t) => !docs.some((d) => d.type === t)),
    };
  }
}
