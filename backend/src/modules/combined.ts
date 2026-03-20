// ─── Profile ───────────────────────────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Module } from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile() {
    const profile = await this.prisma.profile.findFirst();
    return profile || null;
  }

  async upsert(data: any) {
    const existing = await this.prisma.profile.findFirst();
    if (existing) {
      return this.prisma.profile.update({ where: { id: existing.id }, data });
    }
    return this.prisma.profile.create({ data });
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
  upsert(@Body() body: any) { return this.service.upsert(body); }

  @Patch()
  update(@Body() body: any) { return this.service.upsert(body); }
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

  async addEntry(applicationId: string, data: { action: string; description?: string; type?: string }) {
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
  addEntry(@Param('applicationId') id: string, @Body() body: any) {
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

  async createEvent(data: any) {
    return this.prisma.calendarEvent.create({
      data: { ...data, date: new Date(data.date) },
    });
  }

  async updateEvent(id: string, data: any) {
    return this.prisma.calendarEvent.update({ where: { id }, data });
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
  createEvent(@Body() body: any) { return this.service.createEvent(body); }

  @Patch(':id')
  updateEvent(@Param('id') id: string, @Body() body: any) {
    return this.service.updateEvent(id, body);
  }

  @ApiOperation({ summary: 'Delete calendar event' })
  @Post(':id/delete')
  deleteEvent(@Param('id') id: string) { return this.service.deleteEvent(id); }
}

@Module({ controllers: [CalendarController], providers: [CalendarService] })
export class CalendarModule {}
