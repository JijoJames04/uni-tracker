import { PrismaService } from '../../prisma/prisma.service';
export declare class PromptsService {
    private prisma;
    constructor(prisma: PrismaService);
    generateSopPrompt(applicationId: string): Promise<{
        prompt: string;
        wordCount: number;
        mandatoryFields: string[];
        optionalFields: string[];
        missingMandatory: string[];
    }>;
    generateLorPrompt(applicationId: string, recommenderName?: string, recommenderTitle?: string, relationship?: string): Promise<{
        prompt: string;
        wordCount: number;
    }>;
    generateEmailPrompt(applicationId: string, emailType: string): Promise<{
        prompt: string;
    }>;
    private buildStudentSection;
    private buildCourseSection;
    private buildLanguageSection;
    private buildExperienceSection;
}
