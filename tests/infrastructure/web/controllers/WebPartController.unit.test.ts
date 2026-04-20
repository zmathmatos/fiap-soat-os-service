import { describe, it, expect, beforeEach } from "@jest/globals";
import { Request, Response } from "express";
import { WebPartController } from "../../../../src/infrastructure/web/controllers/WebPartController";
import { PartController } from "../../../../src/interface/controllers/PartController";

jest.mock("../../../../src/interface/controllers/PartController");

const MockedPartController = PartController as jest.MockedClass<
  typeof PartController
>;

describe("WebPartController - Error Scenarios", () => {
  let webPartController: WebPartController;
  let mockPartControllerInstance: jest.Mocked<PartController>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    MockedPartController.mockClear();

    webPartController = new WebPartController();

    mockPartControllerInstance =
      MockedPartController.mock.instances[0] as jest.Mocked<PartController>;

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
  })

  describe("create", () => {
    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.body = {
        name: "Filter",
        partNumber: "F-001",
        brand: "Bosch",
        price: 10,
        stockQuantity: 5,
      };

      mockPartControllerInstance.create.mockRejectedValue("unexpected string");

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseData).not.toHaveProperty("data");
    });

    it("should return 400 when an Error is thrown by the controller", async () => {
      mockRequest.body = {
        name: "Filter",
        partNumber: "F-001",
        brand: "Bosch",
        price: 10,
        stockQuantity: 5,
      };

      mockPartControllerInstance.create.mockRejectedValue(
        new Error("Part with this part number already exists"),
      );

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Part with this part number already exists");
    });
  });

  describe("getById", () => {
    it("should return 404 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "invalid-id" };

      mockPartControllerInstance.getById.mockRejectedValue(
        new Error("Invalid id format"),
      );

      await webPartController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Invalid id format");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };

      mockPartControllerInstance.getById.mockRejectedValue(42);

      await webPartController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAll", () => {
    it("should return 500 when an Error is thrown", async () => {
      mockPartControllerInstance.getAll.mockRejectedValue(
        new Error("Database unavailable"),
      );

      await webPartController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockPartControllerInstance.getAll.mockRejectedValue(null);

      await webPartController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getPartByPartNumber", () => {
    it("should return 500 when an Error is thrown", async () => {
      mockRequest.params = { partNumber: "F-001" };

      mockPartControllerInstance.getPartByPartNumber.mockRejectedValue(
        new Error("Query failed"),
      );

      await webPartController.getPartByPartNumber(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { partNumber: "F-001" };

      mockPartControllerInstance.getPartByPartNumber.mockRejectedValue(
        undefined,
      );

      await webPartController.getPartByPartNumber(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("update", () => {
    it("should return 400 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { price: -10 };

      mockPartControllerInstance.update.mockRejectedValue(
        new Error("Price cannot be negative"),
      );

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Price cannot be negative");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { brand: "New Brand" };

      mockPartControllerInstance.update.mockRejectedValue({ code: 503 });

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("delete", () => {
    it("should return 404 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "some-id" };

      mockPartControllerInstance.delete.mockRejectedValue(
        new Error("Part not found"),
      );

      await webPartController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Part not found");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };

      mockPartControllerInstance.delete.mockRejectedValue(false);

      await webPartController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
