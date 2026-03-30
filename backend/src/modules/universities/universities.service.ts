import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScraperService } from '../scraper/scraper.service';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateUniversityDto {
  @IsString() name: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() description?: string;
}

export class CreateCourseDto {
  @IsString() universityId: string;
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() duration?: string;
  @IsOptional() fees?: number;
  @IsOptional() feesPerSemester?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() deadline?: string;
  @IsOptional() startDate?: string;
  @IsOptional() @IsString() applicationUrl?: string;
  @IsOptional() @IsString() sourceUrl?: string;
  @IsOptional() ects?: number;
  @IsOptional() @IsString() applicationVia?: 'DIRECT' | 'UNI_ASSIST' | 'BOTH';
  @IsOptional() @IsString() uniAssistInfo?: string;
  @IsOptional() @IsString() requirements?: string;
}

export class AddFromUrlDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;
}

@Injectable()
export class UniversitiesService {
  constructor(
    private prisma: PrismaService,
    private scraperService: ScraperService,
  ) {}

  async findAll() {
    return this.prisma.university.findMany({
      include: {
        courses: {
          include: {
            application: { select: { status: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const university = await this.prisma.university.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            application: {
              include: {
                documents: true,
                timeline: { orderBy: { createdAt: 'desc' } },
              },
            },
          },
        },
      },
    });
    if (!university) throw new NotFoundException(`University ${id} not found`);
    return university;
  }

  async create(dto: CreateUniversityDto) {
    return this.prisma.university.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateUniversityDto>) {
    return this.prisma.university.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    // Clean up calendar events referencing any of this university's courses
    const courses = await this.prisma.course.findMany({
      where: { universityId: id },
      select: { id: true },
    });
    const courseIds = courses.map((c) => c.id);
    if (courseIds.length > 0) {
      await this.prisma.calendarEvent.deleteMany({
        where: { courseId: { in: courseIds } },
      });
    }

    // Prisma cascade handles: courses → applications → docs/timeline/checklist
    return this.prisma.university.delete({ where: { id } });
  }

  async updateCourseDeadline(courseId: string, deadline: string, label?: string) {
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        deadline: new Date(deadline),
        deadlineLabel: label,
      },
      include: { university: true },
    });
  }

  async addFromUrl(dto: AddFromUrlDto) {
    const scraped = await this.scraperService.scrapeUniversityCourse(dto.url);

    // Find or create university
    let university = await this.prisma.university.findFirst({
      where: { name: { contains: scraped.universityName, mode: 'insensitive' } },
    });

    if (!university) {
      university = await this.prisma.university.create({
        data: {
          name: scraped.universityName,
          logoUrl: scraped.logoUrl,
          address: scraped.address,
          city: scraped.city,
          website: scraped.websiteUrl || scraped.applicationUrl,
          linkedinUrl: scraped.linkedinUrl,
          instagramUrl: scraped.instagramUrl,
          latitude: scraped.latitude,
          longitude: scraped.longitude,
          country: 'Germany',
        },
      });
    }

    // Check for duplicate: same course name at same university
    const existingCourse = await this.prisma.course.findFirst({
      where: {
        universityId: university.id,
        name: { equals: scraped.courseName, mode: 'insensitive' },
      },
      include: { application: true },
    });

    if (existingCourse) {
      // Use the stored course name (not the freshly scraped one) for a clean error message
      throw new ConflictException(
        `An application for "${existingCourse.name}" at this university already exists`,
      );
    }

    // Create course
    const course = await this.prisma.course.create({
      data: {
        universityId: university.id,
        name: scraped.courseName,
        description: scraped.description,
        degree: scraped.degree,
        language: scraped.language,
        duration: scraped.duration,
        fees: scraped.fees,
        feesPerSemester: scraped.feesPerSemester,
        currency: scraped.currency,
        deadline: scraped.deadline ? new Date(scraped.deadline) : null,
        deadlineInternational: scraped.deadlineInternational ? new Date(scraped.deadlineInternational) : null,
        deadlineLabel: scraped.deadlineLabel,
        startDate: scraped.startDate && !['Winter', 'Summer'].includes(scraped.startDate) ? new Date(scraped.startDate) : null,
        applicationUrl: scraped.applicationUrl,
        sourceUrl: scraped.sourceUrl,
        ects: scraped.ects,
        applicationVia: scraped.applicationVia,
        uniAssistInfo: scraped.uniAssistInfo,
        requirements: scraped.requirements,
      },
    });

    // Auto-create application in DRAFT status
    const application = await this.prisma.application.create({
      data: {
        courseId: course.id,
        status: 'DRAFT',
      },
    });

    // Auto-add default checklist
    await this.createDefaultChecklist(application.id);

    // Add timeline entry
    await this.prisma.timelineEntry.create({
      data: {
        applicationId: application.id,
        action: 'Course Added',
        description: `Added ${scraped.courseName} at ${scraped.universityName} from URL`,
        type: 'NOTE',
      },
    });

    return { university, course, application };
  }

  private async createDefaultChecklist(applicationId: string) {
    const defaultItems = [
      'Write Statement of Purpose (SOP)',
      'Prepare CV/Resume',
      'Gather academic transcripts',
      'Obtain language certificate',
      'Get recommendation letters',
      'Prepare copy of passport',
      'Check application portal',
      'Submit application',
      'Pay application fee',
    ];

    await this.prisma.checklistItem.createMany({
      data: defaultItems.map((label, index) => ({
        applicationId,
        label,
        order: index,
      })),
    });
  }

  async createCourse(dto: CreateCourseDto) {
    // Check for duplicate: same course name at same university
    const existingCourse = await this.prisma.course.findFirst({
      where: {
        universityId: dto.universityId,
        name: { equals: dto.name, mode: 'insensitive' },
      },
      include: { university: true, application: true },
    });

    if (existingCourse) {
      throw new ConflictException(
        `An application for "${dto.name}" at ${existingCourse.university.name} already exists`,
      );
    }

    const course = await this.prisma.course.create({
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        startDate: dto.startDate && !['Winter', 'Summer'].includes(dto.startDate) ? new Date(dto.startDate) : null,
      },
      include: { university: true },
    });

    // Auto-create application
    const application = await this.prisma.application.create({
      data: { courseId: course.id, status: 'DRAFT' },
    });
    await this.createDefaultChecklist(application.id);

    return { course, application };
  }

  async getStats() {
    const [
      total,
      byStatus,
      totalFees,
      upcoming,
    ] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.application.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.course.aggregate({
        _sum: { fees: true },
        where: { application: { status: { notIn: ['REJECTED'] } } },
      }),
      this.prisma.course.findMany({
        where: {
          deadline: { gte: new Date() },
          application: { status: { notIn: ['APPROVED', 'REJECTED'] } },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
        include: { university: true, application: true },
      }),
    ]);

    const statusMap = Object.fromEntries(
      byStatus.map((s) => [s.status, s._count]),
    );

    return {
      total,
      draft: statusMap['DRAFT'] || 0,
      sopWriting: statusMap['SOP_WRITING'] || 0,
      preparing: statusMap['DOCUMENTS_PREPARING'] || 0,
      documentsReady: statusMap['DOCUMENTS_READY'] || 0,
      submitted: statusMap['SUBMITTED'] || 0,
      underReview: statusMap['UNDER_REVIEW'] || 0,
      approved: statusMap['APPROVED'] || 0,
      rejected: statusMap['REJECTED'] || 0,
      waitlisted: statusMap['WAITLISTED'] || 0,
      actionNeeded: (statusMap['DRAFT'] || 0) + (statusMap['SOP_WRITING'] || 0) + (statusMap['DOCUMENTS_PREPARING'] || 0),
      totalFees: totalFees._sum.fees || 0,
      upcomingDeadlines: upcoming,
    };
  }
}
