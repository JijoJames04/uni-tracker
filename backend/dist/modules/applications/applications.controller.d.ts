import { ApplicationsService, UpdateApplicationDto, UpdateChecklistDto } from './applications.service';
export declare class ApplicationsController {
    private readonly service;
    constructor(service: ApplicationsService);
    findAll(): Promise<any>;
    getKanban(): Promise<Record<string, any>>;
    findOne(id: string): Promise<any>;
    findByCourse(courseId: string): Promise<any>;
    update(id: string, dto: UpdateApplicationDto): Promise<any>;
    updateChecklist(id: string, dto: UpdateChecklistDto): Promise<any>;
    addChecklistItem(id: string, body: {
        label: string;
    }): Promise<any>;
    removeChecklistItem(itemId: string): Promise<any>;
    remove(id: string): Promise<any>;
    removeAll(): Promise<{
        message: string;
    }>;
}
