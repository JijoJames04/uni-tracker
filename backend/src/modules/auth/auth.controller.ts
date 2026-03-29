import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class RegisterDto {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register or update a user after Google sign-in' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerOrUpdate(dto);
  }

  @Get('user-count')
  @ApiOperation({ summary: 'Get total number of registered users (public)' })
  async getUserCount() {
    const count = await this.authService.getUserCount();
    return { count };
  }
}
