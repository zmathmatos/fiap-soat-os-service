import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Request, Response } from "express";
import { WebUserController } from "../../../../src/infrastructure/web/controllers/WebUserController";
import { UserController } from "../../../../src/interface/controllers/UserController";

jest.mock("../../../../src/interface/controllers/UserController");

const MockedUserController = UserController as jest.MockedClass<
  typeof UserController
>;

describe("WebUserController - Error Scenarios", () => {
  let webUserController: WebUserController;
  let mockUserControllerInstance: jest.Mocked<UserController>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    MockedUserController.mockClear();

    webUserController = new WebUserController();

    mockUserControllerInstance =
      MockedUserController.mock.instances[0] as jest.Mocked<UserController>;

    mockRequest = { body: {}, params: {} };
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should return 400 when an Error is thrown by the controller", async () => {
      mockRequest.body = { name: "John", document: "12345678909", email: "john@email.com", password: "pass" };

      mockUserControllerInstance.create.mockRejectedValue(
        new Error("Email already in use"),
      );

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Email already in use");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.body = { name: "John", document: "12345678909", email: "john@email.com", password: "pass" };

      mockUserControllerInstance.create.mockRejectedValue("unexpected string");

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseData).toHaveProperty("error");
    });

    it("should return 400 when name is missing", async () => {
      mockRequest.body = { document: "12345678909", email: "john@email.com", password: "pass" };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("name is required");
      expect(mockUserControllerInstance.create).not.toHaveBeenCalled();
    });

    it("should return 400 when document is missing", async () => {
      mockRequest.body = { name: "John", email: "john@email.com", password: "pass" };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockUserControllerInstance.create).not.toHaveBeenCalled();
    });

    it("should return 400 when email is missing", async () => {
      mockRequest.body = { name: "John", document: "12345678909", password: "pass" };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockUserControllerInstance.create).not.toHaveBeenCalled();
    });

    it("should return 400 when password is missing", async () => {
      mockRequest.body = { name: "John", document: "12345678909", email: "john@email.com" };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockUserControllerInstance.create).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return 400 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "invalid-id" };

      mockUserControllerInstance.getById.mockRejectedValue(
        new Error("Invalid id format"),
      );

      await webUserController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Invalid id format");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };

      mockUserControllerInstance.getById.mockRejectedValue(42);

      await webUserController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAll", () => {
    it("should return 400 when an Error is thrown", async () => {
      mockUserControllerInstance.getAll.mockRejectedValue(
        new Error("Database unavailable"),
      );

      await webUserController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockUserControllerInstance.getAll.mockRejectedValue(null);

      await webUserController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getByDocument", () => {
    it("should return 404 when an Error is thrown by the controller", async () => {
      mockRequest.params = { document: "12345678909" };

      mockUserControllerInstance.getByDocument.mockRejectedValue(
        new Error("Query failed"),
      );

      await webUserController.getByDocument(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { document: "12345678909" };

      mockUserControllerInstance.getByDocument.mockRejectedValue(undefined);

      await webUserController.getByDocument(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("update", () => {
    it("should return 400 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { name: "John", document: "12345678909", email: "john@email.com" };

      mockUserControllerInstance.update.mockRejectedValue(
        new Error("User not found"),
      );

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("User not found");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { name: "John", document: "12345678909", email: "john@email.com" };

      mockUserControllerInstance.update.mockRejectedValue({ code: 503 });

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should return 400 when name is missing", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { document: "12345678909", email: "john@email.com" };

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("name is required");
      expect(mockUserControllerInstance.update).not.toHaveBeenCalled();
    });

    it("should return 400 when document is missing", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { name: "John", email: "john@email.com" };

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockUserControllerInstance.update).not.toHaveBeenCalled();
    });

    it("should return 400 when email is missing", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { name: "John", document: "12345678909" };

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockUserControllerInstance.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should return 404 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "some-id" };

      mockUserControllerInstance.delete.mockRejectedValue(
        new Error("User not found"),
      );

      await webUserController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("User not found");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };

      mockUserControllerInstance.delete.mockRejectedValue(false);

      await webUserController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
