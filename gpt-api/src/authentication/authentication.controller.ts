import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './authentication.service';
import { RegisterDto, LoginDto } from './dto/authentication.dto';
import { JwtAuthGuard } from './guards/jwt-authentication.guard';
import { JwtPayload } from '@shoshizan/shared-interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: JwtPayload }) {
    console.log('getProfile', req.user);
    return this.authService.validateUser(req.user.sub);
  }
}
