import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  UniversitiesService,
  CreateUniversityDto,
  CreateCourseDto,
  AddFromUrlDto,
} from './universities.service';

@ApiTags('universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly service: UniversitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all universities with courses' })
  findAll() { return this.service.findAll(); }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  getStats() { return this.service.getStats(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateUniversityDto) { return this.service.create(dto); }

  @Post('from-url')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add university and course from URL (web scraping)' })
  addFromUrl(@Body() dto: AddFromUrlDto) { return this.service.addFromUrl(dto); }

  @Post('courses')
  createCourse(@Body() dto: CreateCourseDto) { return this.service.createCourse(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateUniversityDto>) {
    return this.service.update(id, dto);
  }

  @Patch('courses/:courseId/deadline')
  updateDeadline(
    @Param('courseId') courseId: string,
    @Body() body: { deadline: string; deadlineLabel?: string },
  ) {
    return this.service.updateCourseDeadline(courseId, body.deadline, body.deadlineLabel);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
