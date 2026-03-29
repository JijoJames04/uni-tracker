"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('UniTracker API')
        .setDescription('German University Application Tracker API')
        .setVersion('1.0')
        .addTag('universities', 'University management')
        .addTag('courses', 'Course management')
        .addTag('applications', 'Application tracking')
        .addTag('documents', 'Document management')
        .addTag('scraper', 'Web scraping')
        .addTag('prompts', 'SOP prompt generation')
        .addTag('timeline', 'Activity timeline')
        .addTag('profile', 'User profile')
        .addTag('calendar', 'Calendar events')
        .addTag('auth', 'Authentication & user count')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`🚀 Application running on: http://localhost:${port}`);
    logger.log(`📚 API Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map