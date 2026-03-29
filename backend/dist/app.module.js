"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const health_controller_1 = require("./health.controller");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const prisma_module_1 = require("./prisma/prisma.module");
const universities_module_1 = require("./modules/universities/universities.module");
const applications_module_1 = require("./modules/applications/applications.module");
const documents_module_1 = require("./modules/documents/documents.module");
const scraper_module_1 = require("./modules/scraper/scraper.module");
const prompts_module_1 = require("./modules/prompts/prompts.module");
const timeline_module_1 = require("./modules/timeline/timeline.module");
const profile_module_1 = require("./modules/profile/profile.module");
const calendar_module_1 = require("./modules/calendar/calendar.module");
const auth_module_1 = require("./modules/auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            prisma_module_1.PrismaModule,
            universities_module_1.UniversitiesModule,
            applications_module_1.ApplicationsModule,
            documents_module_1.DocumentsModule,
            scraper_module_1.ScraperModule,
            prompts_module_1.PromptsModule,
            timeline_module_1.TimelineModule,
            profile_module_1.ProfileModule,
            calendar_module_1.CalendarModule,
            auth_module_1.AuthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map