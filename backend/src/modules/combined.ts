// ─── Profile ───────────────────────────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Module } from '@nestjs/common';
import { IsString, IsOptional, IsEmail, IsNumber, IsDateString, IsEnum, IsBoolean, IsArray } from 'class-validator';

// ─── DTOs ──────────────────────────────────────────────────────
export class UpsertProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail()  email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() nationality?: string;
  @IsOptional() @IsString() currentAddress?: string;
  @IsOptional() @IsString() homeAddress?: string;
  @IsOptional() @IsString() bachelorDegree?: string;
  @IsOptional() @IsString() bachelorUniversity?: string;
  @IsOptional() @IsNumber() bachelorGrade?: number;
  @IsOptional() @IsNumber() bachelorYear?: number;
  @IsOptional() @IsString() masterDegree?: string;
  @IsOptional() @IsString() masterUniversity?: string;
  @IsOptional() @IsNumber() masterGrade?: number;
  @IsOptional() @IsNumber() masterYear?: number;
  @IsOptional() @IsNumber() ieltsScore?: number;
  @IsOptional() @IsNumber() toeflScore?: number;
  @IsOptional() @IsNumber() testDafScore?: number;
  @IsOptional() @IsString() goetheLevel?: string;
  @IsOptional() @IsString() germanLevel?: string;
  @IsOptional() @IsNumber() greVerbal?: number;
  @IsOptional() @IsNumber() greQuant?: number;
  @IsOptional() @IsNumber() greAnalytical?: number;
  @IsOptional() @IsNumber() gmatScore?: number;
  @IsOptional() @IsString() workExperience?: string;
  @IsOptional() @IsArray()  skills?: string[];
  @IsOptional() @IsString() researchInterests?: string;
  @IsOptional() @IsString() publications?: string;
  @IsOptional() @IsString() targetDegree?: string;
  @IsOptional() @IsString() targetField?: string;
  @IsOptional() @IsString() targetSemester?: string;
}

export class CreateCalendarEventDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsString() date: string;
  @IsOptional() @IsEnum(['DEADLINE', 'INTERVIEW', 'PAYMENT', 'REMINDER', 'MILESTONE']) type?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() courseId?: string;
}

export class UpdateCalendarEventDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsBoolean() completed?: boolean;
}

export class AddTimelineEntryDto {
  @IsString() action: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(['STATUS_CHANGE', 'DOCUMENT_UPLOAD', 'NOTE', 'DEADLINE', 'EMAIL', 'PAYMENT']) type?: string;
}

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile() {
    const profile = await this.prisma.profile.findFirst();
    return profile || null;
  }

  async upsert(data: UpsertProfileDto) {
    const existing = await this.prisma.profile.findFirst();
    if (existing) {
      return this.prisma.profile.update({ where: { id: existing.id }, data });
    }
    return this.prisma.profile.create({ data: { ...data, firstName: data.firstName ?? '', lastName: data.lastName ?? '', email: data.email ?? '' } });
  }
}

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private service: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  get() { return this.service.getProfile(); }

  @Post()
  upsert(@Body() body: UpsertProfileDto) { return this.service.upsert(body); }

  @Patch()
  update(@Body() body: UpsertProfileDto) { return this.service.upsert(body); }
}

@Module({ controllers: [ProfileController], providers: [ProfileService] })
export class ProfileModule {}

// ─── Timeline ──────────────────────────────────────────────────
@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async findByApplication(applicationId: string) {
    return this.prisma.timelineEntry.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addEntry(applicationId: string, data: AddTimelineEntryDto) {
    return this.prisma.timelineEntry.create({
      data: {
        applicationId,
        action: data.action,
        description: data.description,
        type: (data.type as any) || 'NOTE',
      },
    });
  }

  async remove(id: string) {
    return this.prisma.timelineEntry.delete({ where: { id } });
  }
}

@ApiTags('timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private service: TimelineService) {}

  @Get('application/:applicationId')
  findByApplication(@Param('applicationId') id: string) {
    return this.service.findByApplication(id);
  }

  @Post('application/:applicationId')
  addEntry(@Param('applicationId') id: string, @Body() body: AddTimelineEntryDto) {
    return this.service.addEntry(id, body);
  }
}

@Module({ controllers: [TimelineController], providers: [TimelineService] })
export class TimelineModule {}

// ─── Calendar ──────────────────────────────────────────────────
@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getEvents() {
    const [events, deadlines] = await Promise.all([
      this.prisma.calendarEvent.findMany({ orderBy: { date: 'asc' } }),
      this.prisma.course.findMany({
        where: { deadline: { not: null } },
        select: {
          id: true, name: true, deadline: true,
          university: { select: { name: true } },
          application: { select: { id: true, status: true } },
        },
      }),
    ]);

    const deadlineEvents = deadlines.map((c) => ({
      id: `deadline-${c.id}`,
      title: `Deadline: ${c.name}`,
      date: c.deadline,
      type: 'DEADLINE',
      color: '#ef4444',
      courseId: c.id,
      applicationId: c.application?.id,
      daysLeft: c.deadline
        ? Math.ceil((c.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
      university: c.university.name,
      isDeadline: true,
    }));

    return [...events, ...deadlineEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  async createEvent(data: CreateCalendarEventDto) {
    return this.prisma.calendarEvent.create({
      data: { ...data, date: new Date(data.date), type: (data.type as any) || 'REMINDER' },
    });
  }

  async updateEvent(id: string, data: UpdateCalendarEventDto) {
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    return this.prisma.calendarEvent.update({ where: { id }, data: updateData });
  }

  async deleteEvent(id: string) {
    return this.prisma.calendarEvent.delete({ where: { id } });
  }
}

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private service: CalendarService) {}

  @Get()
  getEvents() { return this.service.getEvents(); }

  @Post()
  createEvent(@Body() body: CreateCalendarEventDto) { return this.service.createEvent(body); }

  @Patch(':id')
  updateEvent(@Param('id') id: string, @Body() body: UpdateCalendarEventDto) {
    return this.service.updateEvent(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete calendar event' })
  deleteEvent(@Param('id') id: string) { return this.service.deleteEvent(id); }
}

@Module({ controllers: [CalendarController], providers: [CalendarService] })
export class CalendarModule {}
