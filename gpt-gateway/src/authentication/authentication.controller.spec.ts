import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./authentication.controller";
import { AuthService } from "./authentication.service";
import { RegisterDto, LoginDto } from "./dto/authentication.dto";
import { JwtAuthGuard } from "../common/guards/jwt-authentication.guard";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { UserEntity } from "@shoshizan/shared-interfaces";

describe("AuthController", () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockService = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const expectedResult = {
        user: {
          id: "user-123",
          email: registerDto.email,
          name: registerDto.name,
          role: "user" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: "jwt_token",
      };

      service.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(service.register).toHaveBeenCalledTimes(1);
    });

    it("should handle registration errors", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const error = new Error("Email already exists");
      service.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(error);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const expectedResult = {
        user: {
          id: "user-123",
          email: loginDto.email,
          name: "Test User",
          role: "user" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: "jwt_token",
      };

      service.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalledTimes(1);
    });

    it("should handle login errors", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const error = new Error("Invalid credentials");
      service.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const userId = "user-123";
      const mockReq = {
        user: {
          sub: userId,
          email: "test@example.com",
          role: "user",
          iat: 1234567890,
          exp: 1234567890,
        },
      };

      const expectedUser: UserEntity = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.validateUser.mockResolvedValue(expectedUser);

      const result = await controller.getProfile(mockReq);

      expect(result).toEqual(expectedUser);
      expect(service.validateUser).toHaveBeenCalledWith(userId);
      expect(service.validateUser).toHaveBeenCalledTimes(1);
    });

    it("should handle profile retrieval errors", async () => {
      const userId = "user-123";
      const mockReq = {
        user: {
          sub: userId,
          email: "test@example.com",
          role: "user",
          iat: 1234567890,
          exp: 1234567890,
        },
      };

      const error = new Error("User not found");
      service.validateUser.mockRejectedValue(error);

      await expect(controller.getProfile(mockReq)).rejects.toThrow(error);
      expect(service.validateUser).toHaveBeenCalledWith(userId);
    });
  });
});
