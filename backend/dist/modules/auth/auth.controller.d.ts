import { AuthService } from './auth.service';
declare class RegisterDto {
    firebaseUid: string;
    email: string;
    displayName?: string;
    photoUrl?: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firebaseUid: string;
        displayName: string | null;
        photoUrl: string | null;
    }>;
    getUserCount(): Promise<{
        count: number;
    }>;
}
export {};
