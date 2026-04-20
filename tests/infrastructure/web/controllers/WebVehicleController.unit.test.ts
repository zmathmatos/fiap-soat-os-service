import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Request, Response } from "express";
import { WebVehicleController } from "../../../../src/infrastructure/web/controllers/WebVehicleController";
import { VehicleController } from "../../../../src/interface/controllers/VehicleController";

jest.mock("../../../../src/interface/controllers/VehicleController");

const MockedVehicleController = VehicleController as jest.MockedClass<
  typeof VehicleController
>;

describe("WebVehicleController - Error Scenarios", () => {
  let webVehicleController: WebVehicleController;
  let mockVehicleControllerInstance: jest.Mocked<VehicleController>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    MockedVehicleController.mockClear();

    webVehicleController = new WebVehicleController();

    mockVehicleControllerInstance =
      MockedVehicleController.mock.instances[0] as jest.Mocked<VehicleController>;

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
      mockRequest.body = { licensePlate: "ABC1234", brand: "Toyota", model: "Corolla", year: 2023 };

      mockVehicleControllerInstance.create.mockRejectedValue(
        new Error("Vehicle with this license plate already exists"),
      );

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Vehicle with this license plate already exists");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.body = { licensePlate: "ABC1234", brand: "Toyota", model: "Corolla", year: 2023 };

      mockVehicleControllerInstance.create.mockRejectedValue("unexpected string");

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseData).toHaveProperty("error");
    });

    it("should return 400 when licensePlate is missing", async () => {
      mockRequest.body = { brand: "Toyota", model: "Corolla", year: 2023 };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("License plate, brand, model and year are required");
      expect(mockVehicleControllerInstance.create).not.toHaveBeenCalled();
    });

    it("should return 400 when brand is missing", async () => {
      mockRequest.body = { licensePlate: "ABC1234", model: "Corolla", year: 2023 };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockVehicleControllerInstance.create).not.toHaveBeenCalled();
    });

    it("should return 400 when model is missing", async () => {
      mockRequest.body = { licensePlate: "ABC1234", brand: "Toyota", year: 2023 };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockVehicleControllerInstance.create).not.toHaveBeenCalled();
    });

    it("should return 400 when year is missing", async () => {
      mockRequest.body = { licensePlate: "ABC1234", brand: "Toyota", model: "Corolla" };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockVehicleControllerInstance.create).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return 404 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "invalid-id" };

      mockVehicleControllerInstance.getById.mockRejectedValue(
        new Error("Invalid id format"),
      );

      await webVehicleController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Invalid id format");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };

      mockVehicleControllerInstance.getById.mockRejectedValue(42);

      await webVehicleController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAll", () => {
    it("should return 500 when an Error is thrown", async () => {
      mockVehicleControllerInstance.getAll.mockRejectedValue(
        new Error("Database unavailable"),
      );

      await webVehicleController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockVehicleControllerInstance.getAll.mockRejectedValue(null);

      await webVehicleController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getVehicleByLicensePlate", () => {
    it("should return 500 when an Error is thrown", async () => {
      mockRequest.params = { licensePlate: "ABC1234" };

      mockVehicleControllerInstance.getVehicleByLicensePlate.mockRejectedValue(
        new Error("Query failed"),
      );

      await webVehicleController.getVehicleByLicensePlate(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { licensePlate: "ABC1234" };

      mockVehicleControllerInstance.getVehicleByLicensePlate.mockRejectedValue(
        undefined,
      );

      await webVehicleController.getVehicleByLicensePlate(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("update", () => {
    it("should return 400 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { year: -1 };

      mockVehicleControllerInstance.update.mockRejectedValue(
        new Error("Invalid year"),
      );

      await webVehicleController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Invalid year");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };
      mockRequest.body = { brand: "Honda" };

      mockVehicleControllerInstance.update.mockRejectedValue({ code: 503 });

      await webVehicleController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("delete", () => {
    it("should return 404 when an Error is thrown by the controller", async () => {
      mockRequest.params = { id: "some-id" };

      mockVehicleControllerInstance.delete.mockRejectedValue(
        new Error("Vehicle not found"),
      );

      await webVehicleController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Vehicle not found");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };

      mockVehicleControllerInstance.delete.mockRejectedValue(false);

      await webVehicleController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
