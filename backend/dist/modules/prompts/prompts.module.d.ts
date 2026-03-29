import { PromptsService } from './prompts.service';
export declare class PromptsController {
    private readonly service;
    constructor(service: PromptsService);
    generateSop(id: string): Promise<{
        prompt: string;
        wordCount: number;
        mandatoryFields: string[];
        optionalFields: string[];
        missingMandatory: string[];
    }>;
    generateLor(id: string, recommenderName?: string, recommenderTitle?: string, relationship?: string): Promise<{
        prompt: string;
        wordCount: number;
    }>;
    generateEmail(id: string, type?: string): Promise<{
        prompt: string;
    }>;
}
export declare class PromptsModule {
}
