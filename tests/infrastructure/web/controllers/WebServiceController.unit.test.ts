import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Request, Response } from "express";
import { WebServiceController } from "../../../../src/infrastructure/web/controllers/WebServiceController";
import { ServiceController } from "../../../../src/interface/controllers/ServiceController";

jest.mock("../../../../src/interface/controllers/ServiceController");

const MockedServiceController = ServiceController as jest.MockedClass<
  typeof ServiceController
>;

describe("WebServiceController - Error Scenarios", () => {
  let webServiceController: WebServiceController;
  let mockServiceControllerInstance: jest.Mocked<ServiceController>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    MockedServiceController.mockClear();

    webServiceController = new WebServiceController();

    mockServiceControllerInstance =
      MockedServiceController.mock.instances[0] as jest.Mocked<ServiceController>;

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
      mockRequest.body = { name: "Oil Change", serviceCode: "SRV-001", price: 99.99 };

      mockServiceControllerInstance.create.mockRejectedValue(
        new Error("Service with this code already exists"),
      );

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Service with this code already exists");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.body = { name: "Oil Change", serviceCode: "SRV-001", price: 99.99 };

      mockServiceControllerInstance.create.mockRejectedValue("unexpected string");

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseData).toHaveProperty("error");
    });

    it("should return 400 when name is missing", async () => {
      mockRequest.body = { serviceCode: "SRV-001", price: 99.99 };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("name is required");
      expect(mockServiceControllerInstance.create).not.toHaveBeenCalled();
    });

    it("should return 400 when serviceCode is missing", async () => {
      mockRequest.body = { name: "Oil Change", price: 99.99 };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockServiceControllerInstance.create).not.toHaveBeenCalled();
    });

    it("should return 400 when price is missing", async () => {
      mockRequest.body = { name: "Oil Change", serviceCode: "SRV-001" };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockServiceControllerInstance.create).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return 400 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "invalid-id" };

      mockServiceControllerInstance.getById.mockRejectedValue(
        new Error("Invalid id format"),
      );

      await webServiceController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Invalid id format");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };

      mockServiceControllerInstance.getById.mockRejectedValue(42);

      await webServiceController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAll", () => {
    it("should return 400 when an Error is thrown", async () => {
      mockServiceControllerInstance.getAll.mockRejectedValue(
        new Error("Database unavailable"),
      );

      await webServiceController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockServiceControllerInstance.getAll.mockRejectedValue(null);

      await webServiceController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getServiceByServiceCode", () => {
    it("should return 404 when an Error is thrown by the controller", async () => {
      mockRequest.params = { serviceCode: "SRV-001" };

      mockServiceControllerInstance.getServiceByServiceCode.mockRejectedValue(
        new Error("Query failed"),
      );

      await webServiceController.getServiceByServiceCode(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { serviceCode: "SRV-001" };

      mockServiceControllerInstance.getServiceByServiceCode.mockRejectedValue(
        undefined,
      );

      await webServiceController.getServiceByServiceCode(
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

      mockServiceControllerInstance.update.mockRejectedValue(
        new Error("Price cannot be negative"),
      );

      await webServiceController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Price cannot be negative");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { name: "New Name" };

      mockServiceControllerInstance.update.mockRejectedValue({ code: 503 });

      await webServiceController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("delete", () => {
    it("should return 404 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "some-id" };

      mockServiceControllerInstance.delete.mockRejectedValue(
        new Error("Service not found"),
      );

      await webServiceController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service not found");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };

      mockServiceControllerInstance.delete.mockRejectedValue(false);

      await webServiceController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
