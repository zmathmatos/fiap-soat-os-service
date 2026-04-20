import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Request, Response } from "express";
import { WebAuthController } from "../../../../src/infrastructure/web/controllers/WebAuthController";
import { AuthController } from "../../../../src/interface/controllers/AuthController";

jest.mock("../../../../src/interface/controllers/AuthController");

const MockedAuthController = AuthController as jest.MockedClass<
  typeof AuthController
>;

describe("WebAuthController - Error Scenarios", () => {
  let webAuthController: WebAuthController;
  let mockAuthControllerInstance: jest.Mocked<AuthController>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    MockedAuthController.mockClear();

    webAuthController = new WebAuthController();

    mockAuthControllerInstance =
      MockedAuthController.mock.instances[0] as jest.Mocked<AuthController>;

    mockRequest = { body: {} };
    responseData = null;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return 401 when AuthController throws an Error", async () => {
      mockRequest.body = { email: "user@email.com", password: "wrong" };

      mockAuthControllerInstance.login.mockRejectedValue(
        new Error("Invalid credentials"),
      );

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseData.error).toBe("Invalid credentials");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.body = { email: "user@email.com", password: "password" };

      mockAuthControllerInstance.login.mockRejectedValue("unexpected string");

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseData).toHaveProperty("error");
    });

    it("should return 500 when a non-Error object is thrown", async () => {
      mockRequest.body = { email: "user@email.com", password: "password" };

      mockAuthControllerInstance.login.mockRejectedValue({ code: 503 });

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should return 400 when email is missing", async () => {
      mockRequest.body = { password: "password" };

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Email and password are required");
      expect(mockAuthControllerInstance.login).not.toHaveBeenCalled();
    });

    it("should return 400 when password is missing", async () => {
      mockRequest.body = { email: "user@email.com" };

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Email and password are required");
      expect(mockAuthControllerInstance.login).not.toHaveBeenCalled();
    });

    it("should return 400 when body is empty", async () => {
      mockRequest.body = {};

      await webAuthController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockAuthControllerInstance.login).not.toHaveBeenCalled();
    });
  });
});
