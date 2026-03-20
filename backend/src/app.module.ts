import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { UniversitiesModule } from './modules/universities/universities.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CalendarModule } from './modules/calendar/calendar.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    UniversitiesModule,
    ApplicationsModule,
    DocumentsModule,
    ScraperModule,
    PromptsModule,
    TimelineModule,
    ProfileModule,
    CalendarModule,
  ],
})
export class AppModule {}
