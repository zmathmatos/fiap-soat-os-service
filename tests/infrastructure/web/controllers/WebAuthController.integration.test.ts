import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
} from "@jest/globals";
import { Request, Response } from "express";
import sequelize from "../../../../src/infrastructure/database/sequelize/config";
import UserModel from "../../../../src/infrastructure/database/sequelize/models/UserModel";
import { WebAuthController } from "../../../../src/infrastructure/web/controllers/WebAuthController";
import { UserRepository } from "../../../../src/infrastructure/repositories/UserRepository";
import { AuthService } from "../../../../src/application/services/AuthService";

describe("WebAuthController Integration Tests", () => {
  const validDocument = "12345678909";
  const userEmail = "auth@email.com";
  const userPassword = "auth_password";

  let webAuthController: WebAuthController;
  let userRepository: UserRepository;
  let authService: AuthService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    userRepository = new UserRepository();
    webAuthController = new WebAuthController(userRepository);
    authService = new AuthService();

    mockRequest = {
      body: {},
      params: {},
    };

    responseData = null;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      }),
      send: jest.fn().mockReturnThis(),
    };
  });

  afterEach(async () => {
    await UserModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("login", () => {
    it("should return 200 when authentication is done", async () => {
      const hashedPassword = await authService.hashPassword(userPassword);
      await UserModel.create({
        name: "John Doe",
        document: validDocument,
        email: userEmail,
        password: hashedPassword,
      });

      mockRequest.body = {
        email: userEmail,
        password: userPassword,
      };

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 when email is missing", async () => {
      mockRequest.body = {
        password: userPassword,
      };

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData).toHaveProperty("error");
    });

    it("should return 400 when password is missing", async () => {
      mockRequest.body = {
        email: userEmail,
      };

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData).toHaveProperty("error");
    });

    it("should return 400 when both email and password are missing", async () => {
      mockRequest.body = {};

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 401 when user not found", async () => {
      mockRequest.body = {
        email: "nonexistent@email.com",
        password: userPassword,
      };

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData).toHaveProperty("error");
    });

    it("should return 401 when password is incorrect", async () => {
      const hashedPassword = await authService.hashPassword(userPassword);
      await UserModel.create({
        name: "John Doe",
        document: validDocument,
        email: userEmail,
        password: hashedPassword,
      });

      mockRequest.body = {
        email: userEmail,
        password: "wrong_password",
      };

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData).toHaveProperty("error");
    });

    it("should return 500 on unknown error type", async () => {
      const mockRepo = {
        findByEmail: jest.fn().mockRejectedValue({ custom: "error object" }),
      };

      webAuthController = new WebAuthController(mockRepo as any);

      mockRequest.body = {
        email: userEmail,
        password: userPassword,
      };

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData).toHaveProperty("error");
    });
  });
});
