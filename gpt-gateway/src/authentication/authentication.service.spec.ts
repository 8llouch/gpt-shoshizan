import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./authentication.service";
import { JwtService } from "@nestjs/jwt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserEntity } from "@shoshizan/shared-interfaces";
import { RegisterDto, LoginDto } from "./dto/authentication.dto";
import { SecureStringService } from "../common/security/secure-string.service";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  let jwtService: jest.Mocked<JwtService>;
  let secureStringService: jest.Mocked<SecureStringService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: SecureStringService,
          useValue: {
            withSecurePassword: jest.fn((password, operation) => operation(password)),
            cleanSensitiveObject: jest.fn(),
            zeroMemory: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<jest.Mocked<Repository<UserEntity>>>(getRepositoryToken(UserEntity));
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
    secureStringService = module.get<jest.Mocked<SecureStringService>>(SecureStringService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    const registerDto: RegisterDto = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    it("should register a new user successfully", async () => {
      const hashedPassword = "hashed_password";
      const mockUser = {
        id: "user-123",
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token = "jwt_token";

      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockReturnValue(mockUser as UserEntity);
      userRepository.save.mockResolvedValue(mockUser as UserEntity);
      jwtService.sign.mockReturnValue(token);

      const result = await service.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        token,
      });
    });

    it("should throw UnauthorizedException if email already exists", async () => {
      const existingUser = {
        id: "existing-user",
        email: registerDto.email,
      };

      userRepository.findOne.mockResolvedValue(existingUser as UserEntity);

      await expect(service.register(registerDto)).rejects.toThrow(new UnauthorizedException("Email already exists"));
    });
  });

  describe("login", () => {
    const loginDto: LoginDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should login user successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: loginDto.email,
        password: "hashed_password",
        name: "Test User",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token = "jwt_token";

      userRepository.findOne.mockResolvedValue(mockUser as UserEntity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        token,
      });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(new UnauthorizedException("Invalid credentials"));
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      const mockUser = {
        id: "user-123",
        email: loginDto.email,
        password: "hashed_password",
      };

      userRepository.findOne.mockResolvedValue(mockUser as UserEntity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(new UnauthorizedException("Invalid credentials"));
    });
  });

  describe("validateUser", () => {
    it("should return user if found", async () => {
      const userId = "user-123";
      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
      };

      userRepository.findOne.mockResolvedValue(mockUser as UserEntity);

      const result = await service.validateUser(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw UnauthorizedException if user not found", async () => {
      const userId = "non-existent-user";

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(userId)).rejects.toThrow(new UnauthorizedException("User not found"));
    });
  });
});
