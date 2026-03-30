import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SOP_WRITING = 'SOP_WRITING',
  DOCUMENTS_PREPARING = 'DOCUMENTS_PREPARING',
  DOCUMENTS_READY = 'DOCUMENTS_READY',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED',
}

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export class UpdateApplicationDto {
  @IsOptional() @IsEnum(ApplicationStatus) status?: ApplicationStatus;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() appliedAt?: string;
  @IsOptional() decisionAt?: string;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsNumber() submissionFee?: number;
}

export class UpdateChecklistDto {
  @IsString() id: string;
  @IsBoolean() completed: boolean;
}

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.application.findMany({
      include: {
        course: {
          include: { university: true },
        },
        documents: true,
        timeline: { orderBy: { createdAt: 'desc' }, take: 3 },
        checklist: { orderBy: { order: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        course: { include: { university: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        timeline: { orderBy: { createdAt: 'desc' } },
        checklist: { orderBy: { order: 'asc' } },
      },
    });
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    return app;
  }

  async findByCourse(courseId: string) {
    return this.prisma.application.findUnique({
      where: { courseId },
      include: {
        course: { include: { university: true } },
        documents: true,
        timeline: { orderBy: { createdAt: 'desc' } },
        checklist: { orderBy: { order: 'asc' } },
      },
    });
  }

  async update(id: string, dto: UpdateApplicationDto) {
    const existing = await this.findOne(id);

    // Track status change in timeline
    if (dto.status && dto.status !== existing.status) {
      await this.prisma.timelineEntry.create({
        data: {
          applicationId: id,
          action: `Status changed to ${this.formatStatus(dto.status)}`,
          description: `Previous status: ${this.formatStatus(existing.status)}`,
          type: 'STATUS_CHANGE',
        },
      });
    }

    return this.prisma.application.update({
      where: { id },
      data: {
        ...dto,
        appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
        decisionAt: dto.decisionAt ? new Date(dto.decisionAt) : undefined,
      },
      include: {
        course: { include: { university: true } },
        documents: true,
        timeline: { orderBy: { createdAt: 'desc' } },
        checklist: { orderBy: { order: 'asc' } },
      },
    });
  }

  async updateChecklist(id: string, dto: UpdateChecklistDto) {
    return this.prisma.checklistItem.update({
      where: { id: dto.id },
      data: { completed: dto.completed },
    });
  }

  async addChecklistItem(applicationId: string, label: string) {
    const lastItem = await this.prisma.checklistItem.findFirst({
      where: { applicationId },
      orderBy: { order: 'desc' },
    });

    return this.prisma.checklistItem.create({
      data: {
        applicationId,
        label,
        order: (lastItem?.order ?? -1) + 1,
      },
    });
  }

  async removeChecklistItem(itemId: string) {
    return this.prisma.checklistItem.delete({ where: { id: itemId } });
  }

  async remove(id: string) {
    // Look up the application to find the linked course & university
    const app = await this.prisma.application.findUnique({
      where: { id },
      select: { courseId: true, course: { select: { universityId: true } } },
    });
    if (!app) throw new NotFoundException(`Application ${id} not found`);

    const { courseId } = app;
    const { universityId } = app.course;

    // 1. Delete calendar events that reference this course
    await this.prisma.calendarEvent.deleteMany({ where: { courseId } });

    // 2. Delete the application (cascades → documents, timeline, checklist)
    await this.prisma.application.delete({ where: { id } });

    // 3. Delete the course itself (now orphaned, no application)
    await this.prisma.course.delete({ where: { id: courseId } });

    // 4. If the university has no remaining courses, delete it too
    const remainingCourses = await this.prisma.course.count({
      where: { universityId },
    });
    if (remainingCourses === 0) {
      await this.prisma.university.delete({ where: { id: universityId } });
    }

    return { message: 'Application and course deleted' };
  }

  async removeAll() {
    await this.prisma.calendarEvent.deleteMany({});
    await this.prisma.timelineEntry.deleteMany({});
    await this.prisma.checklistItem.deleteMany({});
    await this.prisma.document.deleteMany({});
    await this.prisma.application.deleteMany({});
    await this.prisma.course.deleteMany({});
    await this.prisma.university.deleteMany({});
    return { message: 'All applications and data deleted' };
  }

  async getKanbanView() {
    const applications = await this.findAll();
    const groups: Record<string, typeof applications> = {};

    for (const status of Object.values(ApplicationStatus)) {
      groups[status] = applications.filter((a) => a.status === status);
    }

    return groups;
  }

  private formatStatus(status: string): string {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
