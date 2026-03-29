import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    registerOrUpdate(data: {
        firebaseUid: string;
        email: string;
        displayName?: string;
        photoUrl?: string;
    }): Promise<any>;
    getUserCount(): Promise<number>;
    findByFirebaseUid(firebaseUid: string): Promise<any>;
}
