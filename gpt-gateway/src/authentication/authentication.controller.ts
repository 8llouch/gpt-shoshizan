import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from "@nestjs/common";
import { AuthService } from "./authentication.service";
import { RegisterDto, LoginDto } from "./dto/authentication.dto";
import { JwtAuthGuard } from "../common/guards/jwt-authentication.guard";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { RateLimit } from "../common/decorators/rate-limit.decorator";
import { JwtPayload } from "@shoshizan/shared-interfaces";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";

@Controller("auth")
@UseGuards(RateLimitGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Register new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @RateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyGenerator: (req: ExpressRequest) => req.ip || "unknown",
  })
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "User logged in successfully" })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @RateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    keyGenerator: (req: ExpressRequest) => req.ip || "unknown",
  })
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
  })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @RateLimit({
    windowMs: 60 * 1000,
    maxRequests: 30,
  })
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req: { user: JwtPayload }) {
    return this.authService.validateUser(req.user.sub);
  }
}
