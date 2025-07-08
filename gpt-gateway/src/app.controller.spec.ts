import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let controller: AppController;
  let service: jest.Mocked<AppService>;

  beforeEach(async () => {
    const mockService = {
      getHello: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get(AppService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getHello", () => {
    it("should return hello message", () => {
      const expectedMessage = "GPT-SHOSHIZAN Gateway is running!";
      service.getHello.mockReturnValue(expectedMessage);

      const result = controller.getHello();

      expect(result).toBe(expectedMessage);
      expect(service.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
