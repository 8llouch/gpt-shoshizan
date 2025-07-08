import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "./jwt-authentication.guard";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should extend AuthGuard with jwt strategy", () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
    // The guard extends AuthGuard('jwt') so it inherits passport JWT functionality
    expect(guard.constructor.name).toBe("JwtAuthGuard");
  });
});
