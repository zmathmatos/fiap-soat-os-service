import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Request, Response } from "express";
import { WebServiceOrderController } from "../../../../src/infrastructure/web/controllers/WebServiceOrderController";
import { ServiceOrderController } from "../../../../src/interface/controllers/ServiceOrderController";
import { UserController } from "../../../../src/interface/controllers/UserController";
import { VehicleController } from "../../../../src/interface/controllers/VehicleController";
import { ServiceController } from "../../../../src/interface/controllers/ServiceController";

jest.mock("../../../../src/interface/controllers/ServiceOrderController");
jest.mock("../../../../src/interface/controllers/UserController");
jest.mock("../../../../src/interface/controllers/VehicleController");
jest.mock("../../../../src/interface/controllers/ServiceController");

const MockedServiceOrderController = ServiceOrderController as jest.MockedClass<typeof ServiceOrderController>;
const MockedUserController = UserController as jest.MockedClass<typeof UserController>;
const MockedVehicleController = VehicleController as jest.MockedClass<typeof VehicleController>;
const MockedServiceController = ServiceController as jest.MockedClass<typeof ServiceController>;

const mockServiceOrder = {
  id: "order-id",
  serviceOrderNumber: 1001,
  user: { id: "user-id" },
  vehicle: { id: "vehicle-id" },
  services: [{ id: "svc-id" }],
  parts: [],
  status: "open",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = { id: "user-id", name: "John", document: "12345678909", email: "john@email.com" };
const mockVehicle = { id: "vehicle-id", licensePlate: "ABC1234", brand: "Toyota", model: "Corolla", year: 2023 };

describe("WebServiceOrderController - Error Scenarios", () => {
  let webController: WebServiceOrderController;
  let mockSOController: jest.Mocked<ServiceOrderController>;
  let mockUserController: jest.Mocked<UserController>;
  let mockVehicleController: jest.Mocked<VehicleController>;
  let mockServiceController: jest.Mocked<ServiceController>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    MockedServiceOrderController.mockClear();
    MockedUserController.mockClear();
    MockedVehicleController.mockClear();
    MockedServiceController.mockClear();

    webController = new WebServiceOrderController();

    mockSOController = MockedServiceOrderController.mock.instances[0] as jest.Mocked<ServiceOrderController>;
    mockUserController = MockedUserController.mock.instances[0] as jest.Mocked<UserController>;
    mockVehicleController = MockedVehicleController.mock.instances[0] as jest.Mocked<VehicleController>;
    mockServiceController = MockedServiceController.mock.instances[0] as jest.Mocked<ServiceController>;

    mockRequest = { body: {}, params: {}, query: {} };
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

  // ─── create ────────────────────────────────────────────────────────────────

  describe("create", () => {
    it("should return 400 when document is missing", async () => {
      mockRequest.body = { licensePlate: "ABC1234" };

      await webController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("document is required");
      expect(mockUserController.getByDocument).not.toHaveBeenCalled();
    });

    it("should return 404 when user is not found", async () => {
      mockRequest.body = { document: "12345678909", licensePlate: "ABC1234" };
      mockUserController.getByDocument.mockResolvedValue(null);

      await webController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("User not found");
    });

    it("should return 400 when licensePlate is missing", async () => {
      mockRequest.body = { document: "12345678909" };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);

      await webController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("licensePlate is required");
    });

    it("should return 400 when vehicle creation fails with an Error", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ABC1234",
        brand: "Toyota",
        model: "Corolla",
        year: 2023,
      };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.create.mockRejectedValue(
        new Error("Vehicle with this license plate already exists"),
      );

      await webController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe(
        "Error creating vehicle: Vehicle with this license plate already exists",
      );
    });

    it("should return 400 when vehicle creation fails with a non-Error", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ABC1234",
        brand: "Toyota",
        model: "Corolla",
        year: 2023,
      };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.create.mockRejectedValue("db crash");

      await webController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Error creating vehicle: ");
    });

    it("should return 404 when vehicle is not found by license plate", async () => {
      mockRequest.body = { document: "12345678909", licensePlate: "ABC1234" };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(null);

      await webController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Vehicle not found");
    });

    it("should return 400 when serviceOrderController.create throws an Error", async () => {
      mockRequest.body = { document: "12345678909", licensePlate: "ABC1234" };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(mockVehicle as any);
      mockSOController.create.mockRejectedValue(new Error("Creation failed"));

      await webController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Creation failed");
    });

    it("should return 500 when serviceOrderController.create throws a non-Error", async () => {
      mockRequest.body = { document: "12345678909", licensePlate: "ABC1234" };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(mockVehicle as any);
      mockSOController.create.mockRejectedValue({ code: 500 });

      await webController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── createForCustomer ─────────────────────────────────────────────────────

  describe("createForCustomer", () => {
    const fullBody = {
      name: "John",
      document: "12345678909",
      email: "john@email.com",
      password: "secret123",
      licensePlate: "ABC1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2023,
      serviceIds: ["svc-id"],
      partIds: ["part-id"],
    };

    it("should return 400 when a required field is missing", async () => {
      mockRequest.body = { document: "12345678909" };

      await webController.createForCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("name is required");
      expect(mockUserController.getByDocument).not.toHaveBeenCalled();
    });

    it("should create a new user and a new vehicle when neither exists", async () => {
      mockRequest.body = { ...fullBody };
      mockUserController.getByDocument.mockResolvedValue(null);
      mockUserController.create.mockResolvedValue(mockUser as any);
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(null);
      mockVehicleController.create.mockResolvedValue(mockVehicle as any);
      mockSOController.create.mockResolvedValue(mockServiceOrder as any);

      await webController.createForCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockUserController.create).toHaveBeenCalledWith({
        name: fullBody.name,
        document: fullBody.document,
        email: fullBody.email,
        password: fullBody.password,
      });
      expect(mockVehicleController.create).toHaveBeenCalledWith(
        fullBody.licensePlate,
        fullBody.brand,
        fullBody.model,
        fullBody.year,
      );
      expect(mockSOController.create).toHaveBeenCalledWith(
        mockUser.id,
        mockVehicle.id,
        fullBody.serviceIds,
        fullBody.partIds,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseData.data).toBeDefined();
    });

    it("should reuse an existing user and vehicle instead of creating them", async () => {
      mockRequest.body = { ...fullBody };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(mockVehicle as any);
      mockSOController.create.mockResolvedValue(mockServiceOrder as any);

      await webController.createForCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockUserController.create).not.toHaveBeenCalled();
      expect(mockVehicleController.create).not.toHaveBeenCalled();
      expect(mockSOController.create).toHaveBeenCalledWith(
        mockUser.id,
        mockVehicle.id,
        fullBody.serviceIds,
        fullBody.partIds,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 when user creation fails with an Error", async () => {
      mockRequest.body = { ...fullBody };
      mockUserController.getByDocument.mockResolvedValue(null);
      mockUserController.create.mockRejectedValue(new Error("Invalid document"));

      await webController.createForCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Error creating user: Invalid document");
      expect(mockVehicleController.getVehicleByLicensePlate).not.toHaveBeenCalled();
    });

    it("should return 400 when user creation fails with a non-Error", async () => {
      mockRequest.body = { ...fullBody };
      mockUserController.getByDocument.mockResolvedValue(null);
      mockUserController.create.mockRejectedValue("db crash");

      await webController.createForCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Error creating user: ");
    });

    it("should return 400 when vehicle creation fails with an Error", async () => {
      mockRequest.body = { ...fullBody };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(null);
      mockVehicleController.create.mockRejectedValue(
        new Error("Vehicle with this license plate already exists"),
      );

      await webController.createForCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe(
        "Error creating vehicle: Vehicle with this license plate already exists",
      );
      expect(mockSOController.create).not.toHaveBeenCalled();
    });

    it("should return 400 when vehicle creation fails with a non-Error", async () => {
      mockRequest.body = { ...fullBody };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(null);
      mockVehicleController.create.mockRejectedValue("db crash");

      await webController.createForCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Error creating vehicle: ");
    });

    it("should return 400 when serviceOrderController.create throws an Error", async () => {
      mockRequest.body = { ...fullBody };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(mockVehicle as any);
      mockSOController.create.mockRejectedValue(new Error("Creation failed"));

      await webController.createForCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Creation failed");
    });

    it("should return 500 when serviceOrderController.create throws a non-Error", async () => {
      mockRequest.body = { ...fullBody };
      mockUserController.getByDocument.mockResolvedValue(mockUser as any);
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(mockVehicle as any);
      mockSOController.create.mockRejectedValue({ code: 500 });

      await webController.createForCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getById ───────────────────────────────────────────────────────────────

  describe("getById", () => {
    it("should return 404 when service order is not found", async () => {
      mockRequest.params = { id: "unknown-id" };
      mockSOController.getById.mockResolvedValue(null);

      await webController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service Order not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };
      mockSOController.getById.mockRejectedValue(new Error("Query failed"));

      await webController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "some-id" };
      mockSOController.getById.mockRejectedValue(42);

      await webController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getByServiceOrderNumber ───────────────────────────────────────────────

  describe("getByServiceOrderNumber", () => {
    it("should return 404 when service order is not found", async () => {
      mockRequest.params = { serviceOrderNumber: "9999" };
      mockSOController.getByServiceOrderNumber.mockResolvedValue(null);

      await webController.getByServiceOrderNumber(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service Order not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { serviceOrderNumber: "9999" };
      mockSOController.getByServiceOrderNumber.mockRejectedValue(new Error("Not found"));

      await webController.getByServiceOrderNumber(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Not found");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { serviceOrderNumber: "9999" };
      mockSOController.getByServiceOrderNumber.mockRejectedValue(null);

      await webController.getByServiceOrderNumber(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getAll ────────────────────────────────────────────────────────────────

  describe("getAll", () => {
    it("should return 400 when an Error is thrown", async () => {
      mockRequest.query = {};
      mockSOController.getAll.mockRejectedValue(new Error("Database unavailable"));

      await webController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Database unavailable");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.query = {};
      mockSOController.getAll.mockRejectedValue(undefined);

      await webController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getByUserId ───────────────────────────────────────────────────────────

  describe("getByUserId", () => {
    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { userId: "user-id" };
      mockSOController.getByUserId.mockRejectedValue(new Error("Query failed"));

      await webController.getByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { userId: "user-id" };
      mockSOController.getByUserId.mockRejectedValue(false);

      await webController.getByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getByUserDocument ─────────────────────────────────────────────────────

  describe("getByUserDocument", () => {
    it("should return 404 when user is not found", async () => {
      mockRequest.params = { document: "12345678909" };
      mockUserController.getByDocument.mockResolvedValue(null);

      await webController.getByUserDocument(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("User not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { document: "12345678909" };
      mockUserController.getByDocument.mockRejectedValue(new Error("Query failed"));

      await webController.getByUserDocument(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { document: "12345678909" };
      mockUserController.getByDocument.mockRejectedValue(null);

      await webController.getByUserDocument(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getByVehicleId ────────────────────────────────────────────────────────

  describe("getByVehicleId", () => {
    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { vehicleId: "vehicle-id" };
      mockSOController.getByVehicleId.mockRejectedValue(new Error("Query failed"));

      await webController.getByVehicleId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { vehicleId: "vehicle-id" };
      mockSOController.getByVehicleId.mockRejectedValue(false);

      await webController.getByVehicleId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getByVehicleLicensePlate ──────────────────────────────────────────────

  describe("getByVehicleLicensePlate", () => {
    it("should return 404 when vehicle is not found", async () => {
      mockRequest.params = { licensePlate: "ABC1234" };
      mockVehicleController.getVehicleByLicensePlate.mockResolvedValue(null);

      await webController.getByVehicleLicensePlate(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Vehicle not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { licensePlate: "ABC1234" };
      mockVehicleController.getVehicleByLicensePlate.mockRejectedValue(new Error("Query failed"));

      await webController.getByVehicleLicensePlate(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { licensePlate: "ABC1234" };
      mockVehicleController.getVehicleByLicensePlate.mockRejectedValue(null);

      await webController.getByVehicleLicensePlate(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe("update", () => {
    it("should return 400 when userId is missing", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { vehicleId: "vehicle-id" };

      await webController.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("userId is required");
      expect(mockUserController.getById).not.toHaveBeenCalled();
    });

    it("should return 404 when user is not found", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { userId: "user-id", vehicleId: "vehicle-id" };
      mockUserController.getById.mockResolvedValue(null);

      await webController.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("User not found");
    });

    it("should return 400 when vehicleId is missing", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { userId: "user-id" };
      mockUserController.getById.mockResolvedValue(mockUser as any);

      await webController.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("vehicleId is required");
      expect(mockVehicleController.getById).not.toHaveBeenCalled();
    });

    it("should return 404 when vehicle is not found", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { userId: "user-id", vehicleId: "vehicle-id" };
      mockUserController.getById.mockResolvedValue(mockUser as any);
      mockVehicleController.getById.mockResolvedValue(null);

      await webController.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Vehicle not found");
    });

    it("should return 400 when serviceOrderController.update throws an Error", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { userId: "user-id", vehicleId: "vehicle-id" };
      mockUserController.getById.mockResolvedValue(mockUser as any);
      mockVehicleController.getById.mockResolvedValue(mockVehicle as any);
      mockSOController.update.mockRejectedValue(new Error("Update failed"));

      await webController.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Update failed");
    });

    it("should return 500 when serviceOrderController.update throws a non-Error", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { userId: "user-id", vehicleId: "vehicle-id" };
      mockUserController.getById.mockResolvedValue(mockUser as any);
      mockVehicleController.getById.mockResolvedValue(mockVehicle as any);
      mockSOController.update.mockRejectedValue({ code: 503 });

      await webController.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── delete ────────────────────────────────────────────────────────────────

  describe("delete", () => {
    it("should return 404 when service order is not found", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.delete.mockResolvedValue(false);

      await webController.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service Order not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.delete.mockRejectedValue(new Error("Delete failed"));

      await webController.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Delete failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.delete.mockRejectedValue(null);

      await webController.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── setAsInDiagnostic ─────────────────────────────────────────────────────

  describe("setAsInDiagnostic", () => {
    it("should return 404 when service order is not found", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockResolvedValue(null);

      await webController.setAsInDiagnostic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service Order not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockRejectedValue(new Error("Query failed"));

      await webController.setAsInDiagnostic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockRejectedValue(false);

      await webController.setAsInDiagnostic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── addPartsAndServices ───────────────────────────────────────────────────

  describe("addPartsAndServices", () => {
    it("should return 404 when service order is not found", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { parts: [], serviceIds: [] };
      mockSOController.getById.mockResolvedValue(null);

      await webController.addPartsAndServices(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service Order not found");
    });

    it("should return 400 when a part has quantity <= 0", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { parts: [{ partId: "p1", quantity: 0 }], serviceIds: [] };
      mockSOController.getById.mockResolvedValue(mockServiceOrder as any);

      await webController.addPartsAndServices(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Quantity must be greater than zero for all parts");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { parts: [], serviceIds: [] };
      mockSOController.getById.mockRejectedValue(new Error("Query failed"));

      await webController.addPartsAndServices(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { parts: [], serviceIds: [] };
      mockSOController.getById.mockRejectedValue(false);

      await webController.addPartsAndServices(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── setAsInExecution ──────────────────────────────────────────────────────

  describe("setAsInExecution", () => {
    it("should return 404 when service order is not found", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockResolvedValue(null);

      await webController.setAsInExecution(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service Order not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockRejectedValue(new Error("Query failed"));

      await webController.setAsInExecution(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockRejectedValue(false);

      await webController.setAsInExecution(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── setAsCompleted ────────────────────────────────────────────────────────

  describe("setAsCompleted", () => {
    it("should return 404 when service order is not found", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockResolvedValue(null);

      await webController.setAsCompleted(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service Order not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockRejectedValue(new Error("Query failed"));

      await webController.setAsCompleted(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockRejectedValue(false);

      await webController.setAsCompleted(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── setAsDelivered ────────────────────────────────────────────────────────

  describe("setAsDelivered", () => {
    it("should return 404 when service order is not found", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockResolvedValue(null);

      await webController.setAsDelivered(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service Order not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockRejectedValue(new Error("Query failed"));

      await webController.setAsDelivered(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockSOController.getById.mockRejectedValue(false);

      await webController.setAsDelivered(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── updateStatus ──────────────────────────────────────────────────────────

  describe("updateStatus", () => {
    it("should return 404 when service order is not found", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { status: "inExecution" };
      mockSOController.getById.mockResolvedValue(null);

      await webController.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe("Service Order not found");
    });

    it("should return 400 when an Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { status: "inExecution" };
      mockSOController.getById.mockRejectedValue(new Error("Query failed"));

      await webController.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Query failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockRequest.params = { id: "order-id" };
      mockRequest.body = { status: "inExecution" };
      mockSOController.getById.mockRejectedValue(false);

      await webController.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getAverageServiceTime ─────────────────────────────────────────────────

  describe("getAverageServiceTime", () => {
    it("should return 400 when an Error is thrown", async () => {
      mockSOController.getAverageServiceTime.mockRejectedValue(
        new Error("Calculation failed"),
      );

      await webController.getAverageServiceTime(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe("Calculation failed");
    });

    it("should return 500 when a non-Error is thrown", async () => {
      mockSOController.getAverageServiceTime.mockRejectedValue(null);

      await webController.getAverageServiceTime(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
