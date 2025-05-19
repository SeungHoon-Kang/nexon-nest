import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { LoginDto } from './dto/login.dto';
import { Roles } from './roles.decorator';

interface JwtUser {
  userId: string;
  roles: string[];
}

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  register(@Body() dto: RegisterDto) {
    console.log('[auth] register dto:', dto);
    return this.authService.register(dto);
  }

  @Post('/login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('/users/me/:userId')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    const user = req.user as JwtUser;
    return this.authService.findById(user.userId);
  }

  @Get('/users/all')
  @Roles('ADMIN', 'OPERATOR', 'AUDITOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAll() {
    return this.authService.findAll();
  }
}
