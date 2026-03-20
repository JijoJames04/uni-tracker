import {
  Controller, Get, Put, Patch, Delete, Post,
  Body, Param, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ApplicationsService,
  UpdateApplicationDto,
  UpdateChecklistDto,
} from './applications.service';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  findAll() { return this.service.findAll(); }

  @Get('kanban')
  @ApiOperation({ summary: 'Get applications grouped by status (Kanban view)' })
  getKanban() { return this.service.getKanbanView(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/checklist')
  updateChecklist(@Param('id') id: string, @Body() dto: UpdateChecklistDto) {
    return this.service.updateChecklist(id, dto);
  }

  @Post(':id/checklist')
  addChecklistItem(
    @Param('id') id: string,
    @Body() body: { label: string },
  ) {
    return this.service.addChecklistItem(id, body.label);
  }

  @Delete('checklist/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeChecklistItem(@Param('itemId') itemId: string) {
    return this.service.removeChecklistItem(itemId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all applications and related data' })
  removeAll() { return this.service.removeAll(); }
}
