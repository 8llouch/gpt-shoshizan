import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { UserEntity } from "@shoshizan/shared-interfaces";
import { RegisterDto, LoginDto } from "./dto/authentication.dto";
import { SecureStringService } from "../common/security/secure-string.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private secureStringService: SecureStringService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: Partial<UserEntity>; token: string }> {
    const { email, password, name } = registerDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException("Email already exists");
    }

    // 🔒 SECURITY: Hash password avec zeroing automatique de la mémoire
    const hashedPassword = await this.secureStringService.withSecurePassword(
      password,
      async (pwd) => await bcrypt.hash(pwd, 10),
    );

    // 🔒 SECURITY: Nettoyer le DTO après usage (évite traces en mémoire)
    this.secureStringService.cleanSensitiveObject(registerDto, ["password"]);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    await this.usersRepository.save(user);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const userWithoutPassword = Object.fromEntries(
      Object.entries(user).filter(([key]) => key !== "password"),
    );

    return { user: userWithoutPassword, token };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: Partial<UserEntity>; token: string }> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await this.secureStringService.withSecurePassword(
      password,
      async (pwd) => await bcrypt.compare(pwd, user.password),
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    this.secureStringService.cleanSensitiveObject(loginDto, ["password"]);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const userWithoutPassword = Object.fromEntries(
      Object.entries(user).filter(([key]) => key !== "password"),
    );

    return { user: userWithoutPassword, token };
  }

  async validateUser(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return user;
  }
}
