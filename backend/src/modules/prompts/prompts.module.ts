import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PromptsService } from './prompts.service';
import { Module } from '@nestjs/common';

@ApiTags('prompts')
@Controller('prompts')
export class PromptsController {
  constructor(private readonly service: PromptsService) {}

  @Get('sop/:applicationId')
  @ApiOperation({ summary: 'Generate SOP prompt for an application' })
  generateSop(@Param('applicationId') id: string) {
    return this.service.generateSopPrompt(id);
  }

  @Get('email/:applicationId')
  @ApiOperation({ summary: 'Generate email prompt (inquiry/status/acceptance)' })
  generateEmail(
    @Param('applicationId') id: string,
    @Query('type') type: string = 'inquiry',
  ) {
    return this.service.generateEmailPrompt(id, type);
  }
}

@Module({
  controllers: [PromptsController],
  providers: [PromptsService],
})
export class PromptsModule {}
