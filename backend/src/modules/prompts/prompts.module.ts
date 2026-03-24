import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PromptsService } from './prompts.service';
import { Module } from '@nestjs/common';

@ApiTags('prompts')
@Controller('prompts')
export class PromptsController {
  constructor(private readonly service: PromptsService) {}

  @Get('sop/:applicationId')
  @ApiOperation({ summary: 'Generate SOP prompt for an application (F06: adaptive)' })
  generateSop(@Param('applicationId') id: string) {
    return this.service.generateSopPrompt(id);
  }

  @Get('lor/:applicationId')
  @ApiOperation({ summary: 'Generate LOR prompt for an application (F15)' })
  generateLor(
    @Param('applicationId') id: string,
    @Query('recommenderName') recommenderName?: string,
    @Query('recommenderTitle') recommenderTitle?: string,
    @Query('relationship') relationship?: string,
  ) {
    return this.service.generateLorPrompt(id, recommenderName, recommenderTitle, relationship);
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
