import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    registerOrUpdate(data: {
        firebaseUid: string;
        email: string;
        displayName?: string;
        photoUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firebaseUid: string;
        displayName: string | null;
        photoUrl: string | null;
    }>;
    getUserCount(): Promise<number>;
    findByFirebaseUid(firebaseUid: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firebaseUid: string;
        displayName: string | null;
        photoUrl: string | null;
    }>;
}
