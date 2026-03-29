import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async registerOrUpdate(data: {
    firebaseUid: string;
    email: string;
    displayName?: string;
    photoUrl?: string;
  }) {
    return this.prisma.user.upsert({
      where: { firebaseUid: data.firebaseUid },
      update: {
        email: data.email,
        displayName: data.displayName,
        photoUrl: data.photoUrl,
      },
      create: {
        firebaseUid: data.firebaseUid,
        email: data.email,
        displayName: data.displayName,
        photoUrl: data.photoUrl,
      },
    });
  }

  async getUserCount(): Promise<number> {
    return this.prisma.user.count();
  }

  async findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }
}
