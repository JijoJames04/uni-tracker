import {
  Controller, Get, Post, Delete, Param, Body,
  UploadedFile, UseInterceptors, StreamableFile,
  Res, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { DocumentsService, DocumentType } from './documents.service';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Get all documents for an application' })
  findByApplication(@Param('applicationId') applicationId: string) {
    return this.service.findByApplication(applicationId);
  }

  @Get('application/:applicationId/stats')
  @ApiOperation({ summary: 'Get document completion stats' })
  getStats(@Param('applicationId') applicationId: string) {
    return this.service.getDocumentStats(applicationId);
  }

  @Post('upload/:applicationId')
  @ApiOperation({ summary: 'Upload a document for an application' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @Param('applicationId') applicationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: DocumentType,
    @Body('notes') notes?: string,
  ) {
    return this.service.upload(applicationId, type, file, notes);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document' })
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const { filePath, mimeType, name } = await this.service.getFilePath(id);
    const { createReadStream } = await import('fs');
    const stream = createReadStream(filePath);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${name}"`,
    });

    return new StreamableFile(stream);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
