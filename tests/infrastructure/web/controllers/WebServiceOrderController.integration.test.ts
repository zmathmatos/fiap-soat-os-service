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
import { ServiceOrderModel } from "../../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import UserModel from "../../../../src/infrastructure/database/sequelize/models/UserModel";
import { VehicleModel } from "../../../../src/infrastructure/database/sequelize/models/VehicleModel";
import { ServiceModel } from "../../../../src/infrastructure/database/sequelize/models/ServiceModel";
import { WebServiceOrderController } from "../../../../src/infrastructure/web/controllers/WebServiceOrderController";
import { ServiceOrderRepository } from "../../../../src/infrastructure/repositories/ServiceOrderRepository";
import { User } from "../../../../src/domain/entities/User";
import { Vehicle } from "../../../../src/domain/entities/Vehicle";
import { Service } from "../../../../src/domain/entities/Service";

describe("WebServiceOrderController Integration Tests", () => {
  let webServiceOrderController: WebServiceOrderController;
  let serviceOrderRepository: ServiceOrderRepository;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: number;
  let responseData: any;
  let userId: string;
  let vehicleId: string;
  let serviceId: string;

  const firstUserEmail = "user1@email.com";
  const firstUserPassword = "user1_password";

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    serviceOrderRepository = new ServiceOrderRepository();
    webServiceOrderController = new WebServiceOrderController();

    // Setup mock request and response
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    responseStatus = 0;
    responseData = null;

    mockResponse = {
      status: jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      }),
      json: jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      }),
      send: jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      }),
    };

    // Create support data (user, vehicle, service)
    const userData = User.create(
      "John Doe",
      "12345678909",
      firstUserEmail,
      firstUserPassword,
    );
    const userModel = await UserModel.create({
      name: userData.name,
      document: userData.document,
      email: userData.email,
      password: userData.password,
    });
    userId = userModel.id;

    const vehicleData = Vehicle.create("ABC1234", "Toyota", "Camry", 2023);
    const vehicleModel = await VehicleModel.create({
      licensePlate: vehicleData.licensePlate,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
    });
    vehicleId = vehicleModel.id;

    const serviceData = Service.create("Oil Change", "SRV-001", 99.99);
    const serviceModel = await ServiceModel.create({
      name: serviceData.name,
      serviceCode: serviceData.serviceCode,
      price: serviceData.price,
    });
    serviceId = serviceModel.id;
  });

  afterEach(async () => {
    // Clean up data after each test - clean in correct order to respect foreign keys
    await ServiceOrderModel.destroy({ where: {} });
    await ServiceModel.destroy({ where: {} });
    await VehicleModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a service order and return 201 status", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "CRT1111",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data).toHaveProperty("id");
      expect(responseData.data.serviceOrderNumber).toBeDefined();
    });

    it("should return 400 when document is missing", async () => {
      mockRequest.body = {
        licensePlate: "ABC1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 404 when user not found", async () => {
      // Reset mock
      responseStatus = 0;
      mockResponse.status = jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      });
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      mockRequest.body = {
        document: "99999999999",
        licensePlate: "USR1111",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 400 when license plate is missing", async () => {
      mockRequest.body = {
        document: "12345678909",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 404 when vehicle not found", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "XYZ9999",
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should persist service order to database", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "CRT2222",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderInDb = await ServiceOrderModel.findByPk(
        responseData.data.id,
        {
          include: ["user", "vehicle"],
        },
      );
      expect(serviceOrderInDb).toBeDefined();
      expect(serviceOrderInDb?.get("user")).toBeDefined();
      expect(serviceOrderInDb?.get("vehicle")).toBeDefined();
    });

    it("should create service order with multiple services", async () => {
      // Create another service
      const serviceData2 = Service.create("Tire Change", "SRV-002", 149.99);
      await ServiceModel.create({
        name: serviceData2.name,
        serviceCode: serviceData2.serviceCode,
        price: serviceData2.price,
      });

      mockRequest.body = {
        document: "12345678909",
        licensePlate: "CRT3333",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001", "SRV-002"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should create service order with new vehicle", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "CRT4444",
        brand: "Honda",
        model: "Civic",
        year: 2024,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("createForCustomer", () => {
    it("should create a new user and a new vehicle when neither is registered", async () => {
      mockRequest.body = {
        name: "New Customer",
        document: "98765432100",
        email: "new.customer@email.com",
        password: "customer_password",
        licensePlate: "NEW1111",
        brand: "Fiat",
        model: "Uno",
        year: 2020,
        serviceIds: [serviceId],
      };

      await webServiceOrderController.createForCustomer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseData.data).toHaveProperty("id");
      expect(responseData.data.user.document).toBe("98765432100");
      expect(responseData.data.vehicle.licensePlate).toBe("NEW1111");
      expect(responseData.data.services).toHaveLength(1);

      const createdUser = await UserModel.findOne({
        where: { document: "98765432100" },
      });
      expect(createdUser).toBeDefined();

      const createdVehicle = await VehicleModel.findOne({
        where: { licensePlate: "NEW1111" },
      });
      expect(createdVehicle).toBeDefined();
    });

    it("should associate the service order with the existing user and vehicle", async () => {
      mockRequest.body = {
        name: "John Doe",
        document: "12345678909",
        email: firstUserEmail,
        password: firstUserPassword,
        licensePlate: "ABC1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceIds: [serviceId],
      };

      await webServiceOrderController.createForCustomer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseData.data.user.id).toBe(userId);
      expect(responseData.data.vehicle.id).toBe(vehicleId);

      const usersWithDocument = await UserModel.findAll({
        where: { document: "12345678909" },
      });
      expect(usersWithDocument).toHaveLength(1);

      const vehiclesWithPlate = await VehicleModel.findAll({
        where: { licensePlate: "ABC1234" },
      });
      expect(vehiclesWithPlate).toHaveLength(1);
    });

    it("should return 400 when a required field is missing", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ABC1234",
      };

      await webServiceOrderController.createForCustomer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 400 when the document is invalid", async () => {
      mockRequest.body = {
        name: "Invalid Doc Customer",
        document: "123456789",
        email: "invalid.doc@email.com",
        password: "customer_password",
        licensePlate: "INV0000",
        brand: "Fiat",
        model: "Uno",
        year: 2020,
      };

      await webServiceOrderController.createForCustomer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toContain("Invalid document");
    });
  });

  describe("getById", () => {
    it("should get a service order by id and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "GBI1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      mockRequest.params = { id: serviceOrderId };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.id).toBe(serviceOrderId);
    });

    it("should return 404 when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webServiceOrderController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("getAll", () => {
    it("should return all service orders and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ABC1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(Array.isArray(responseData.data)).toBe(true);
    });

    it("should return empty array when no service orders exist", async () => {
      await webServiceOrderController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data).toEqual([]);
    });

    it("should exclude completed and delivered orders when includeFinished is not provided", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ACT1111",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const activeOrderId = responseData.data.id;

      mockRequest.body = {
        document: "12345678909",
        licensePlate: "CMP2222",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const completedOrderId = responseData.data.id;
      await ServiceOrderModel.update({ status: "Finalizado" }, { where: { id: completedOrderId } });

      mockRequest.query = {};
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const ids = responseData.data.map((so: any) => so.id);
      expect(ids).toContain(activeOrderId);
      expect(ids).not.toContain(completedOrderId);
    });

    it("should exclude completed and delivered orders when includeFinished is false", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ACT3333",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const activeOrderId = responseData.data.id;

      mockRequest.body = {
        document: "12345678909",
        licensePlate: "DEL4444",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const deliveredOrderId = responseData.data.id;
      await ServiceOrderModel.update({ status: "Entregue" }, { where: { id: deliveredOrderId } });

      mockRequest.query = { includeFinished: "false" };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const ids = responseData.data.map((so: any) => so.id);
      expect(ids).toContain(activeOrderId);
      expect(ids).not.toContain(deliveredOrderId);
    });

    it("should include completed and delivered orders when includeFinished is true", async () => {
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ACT5555",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const activeOrderId = responseData.data.id;

      mockRequest.body = {
        document: "12345678909",
        licensePlate: "CMP6666",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const completedOrderId = responseData.data.id;
      await ServiceOrderModel.update({ status: "Finalizado" }, { where: { id: completedOrderId } });

      mockRequest.query = { includeFinished: "true" };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const ids = responseData.data.map((so: any) => so.id);
      expect(ids).toContain(activeOrderId);
      expect(ids).toContain(completedOrderId);
    });

    it("should not order by status when orderByStatus is not provided", async () => {
      // Create order with status "Recebido"
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ORD3333",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const receivedOrderId = responseData.data.id;

      // Create order and set it to "Em execução" (highest priority)
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ORD4444",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const inExecutionOrderId = responseData.data.id;
      await ServiceOrderModel.update({ status: "Em execução" }, { where: { id: inExecutionOrderId } });

      mockRequest.query = {};
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const ids = responseData.data.map((so: any) => so.id);
      expect(ids[0]).toBe(receivedOrderId);
      expect(ids[1]).toBe(inExecutionOrderId);
    });

    it("should not order by status when orderByStatus=false", async () => {
      // Create order with status "Recebido"
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ORD3333",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const receivedOrderId = responseData.data.id;

      // Create order and set it to "Em execução" (highest priority)
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ORD4444",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const inExecutionOrderId = responseData.data.id;
      await ServiceOrderModel.update({ status: "Em execução" }, { where: { id: inExecutionOrderId } });

      mockRequest.query = { orderByStatus: "false" };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const ids = responseData.data.map((so: any) => so.id);
      expect(ids[0]).toBe(receivedOrderId);
      expect(ids[1]).toBe(inExecutionOrderId);
    });

    it("should order by status priority when orderByStatus=true", async () => {
      // Create order with status "Recebido"
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ORD3333",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const receivedOrderId = responseData.data.id;

      // Create order and set it to "Em execução" (highest priority)
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ORD4444",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const inExecutionOrderId = responseData.data.id;
      await ServiceOrderModel.update({ status: "Em execução" }, { where: { id: inExecutionOrderId } });

      mockRequest.query = { orderByStatus: "true" };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const ids = responseData.data.map((so: any) => so.id);
      expect(ids[0]).toBe(inExecutionOrderId);
      expect(ids[1]).toBe(receivedOrderId);
    });

    it("should combine orderByStatus=true with includeFinished=true", async () => {
      // Create order with status "Recebido"
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ORD5555",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const receivedOrderId = responseData.data.id;

      // Create completed order
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ORD6666",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.create(mockRequest as Request, mockResponse as Response);
      const completedOrderId = responseData.data.id;
      await ServiceOrderModel.update({ status: "Finalizado" }, { where: { id: completedOrderId } });

      mockRequest.query = { orderByStatus: "true", includeFinished: "true" };
      mockResponse.json = jest.fn().mockImplementation((data) => { responseData = data; return mockResponse; });
      await webServiceOrderController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const ids = responseData.data.map((so: any) => so.id);
      expect(ids[0]).toBe(receivedOrderId);
      expect(ids[1]).toBe(completedOrderId);
    });
  });

  describe("getByServiceOrderNumber", () => {
    it("should get a service order by number and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "GBN1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderNumber = responseData?.data?.serviceOrderNumber;

      mockRequest.params = {
        serviceOrderNumber: serviceOrderNumber?.toString() || "1000",
      };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.getByServiceOrderNumber(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.serviceOrderNumber).toBe(serviceOrderNumber);
    });

    it("should return 404 when service order number does not exist", async () => {
      mockRequest.params = { serviceOrderNumber: "999" };

      await webServiceOrderController.getByServiceOrderNumber(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("getByUserId", () => {
    it("should get service orders by user id and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "GBU1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      mockRequest.params = { userId };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.getByUserId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(Array.isArray(responseData.data)).toBe(true);
    });
  });

  describe("getByVehicleId", () => {
    it("should get service orders by vehicle id and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "GBV1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      mockRequest.params = { vehicleId };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.getByVehicleId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(Array.isArray(responseData.data)).toBe(true);
    });
  });

  describe("update", () => {
    it("should update a service order and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "UPD1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData?.data?.id;

      mockRequest.params = { id: serviceOrderId };
      mockRequest.body = {
        userId: userId,
        vehicleId: vehicleId,
        status: "Em execução",
      };

      // Reset mock for next call
      responseStatus = 0;
      mockResponse.status = jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      });
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.status).toBe("Em execução");
    });

    it("should return 404 when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };
      mockRequest.body = {
        userId: userId,
        vehicleId: vehicleId,
        status: "Em execução",
      };

      await webServiceOrderController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete a service order and return 204 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "DEL1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      mockRequest.params = { id: serviceOrderId };

      // Reset mock for next call
      responseStatus = 0;
      mockResponse.status = jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      });
      mockResponse.send = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it("should return 404 when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webServiceOrderController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json || mockResponse.send).toBeCalled();
    });
  });

  describe("getAverageServiceTime", () => {
    it("should return 200 with average service time data", async () => {
      const serviceOrderData = {
        document: firstUserEmail,
        licensePlate: "AVG1234",
        brand: "Honda",
        model: "Civic",
        year: 2022,
        serviceCodes: ["SRV-001"],
      };

      mockRequest.body = serviceOrderData;

      // Create a service order
      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Reset mock for next call
      responseStatus = 0;
      mockResponse.status = jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      });
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      // Call getAverageServiceTime
      await webServiceOrderController.getAverageServiceTime(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return average service time with correct properties", async () => {
      responseStatus = 0;
      mockResponse.status = jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      });
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.getAverageServiceTime(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data).toHaveProperty("averageTimeInHours");
      expect(responseData.data).toHaveProperty("completedOrders");
      expect(responseData.data).toHaveProperty("totalOrders");
      expect(typeof responseData.data.averageTimeInHours).toBe("number");
      expect(typeof responseData.data.completedOrders).toBe("number");
      expect(typeof responseData.data.totalOrders).toBe("number");
    });

    it("should return zero values when no orders exist", async () => {
      responseStatus = 0;
      mockResponse.status = jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      });
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.getAverageServiceTime(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.averageTimeInHours).toBe(0);
      expect(responseData.data.completedOrders).toBe(0);
      expect(responseData.data.totalOrders).toBe(0);
    });
  });

  describe("approveQuotation", () => {
    it("should approve quotation successfully when customer owns the service order", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "APR1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderNumber = responseData.data.serviceOrderNumber;

      // Reset mock for approveQuotation call
      responseStatus = 0;
      mockResponse.status = jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      });
      mockResponse.send = jest.fn().mockImplementation((message) => {
        return message;
      });

      // Setup mock request with authenticated user
      mockRequest.params = { serviceOrderNumber };

      await webServiceOrderController.approveQuotation(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(
        `Service order #${serviceOrderNumber} is approved`,
      );
    });

    it("should return 404 when service order does not exist", async () => {
      const serviceOrderNumber = 1003;

      // Setup mock request
      mockRequest.params = {
        serviceOrderNumber: serviceOrderNumber.toString(),
      };
      mockRequest.body = { isApproved: true };
      // @ts-ignore
      mockRequest.user = {
        userId: userId,
        email: firstUserEmail,
        role: "customer",
      };

      await webServiceOrderController.approveQuotation(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.error).toContain("Service Order not found");
    });
  });

  describe("rejectQuotation", () => {
    it("should reject quotation successfully when customer owns the service order", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "APR1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderNumber = responseData.data.serviceOrderNumber;

      // Reset mock for approveQuotation call
      responseStatus = 0;
      mockResponse.status = jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      });
      mockResponse.send = jest.fn().mockImplementation((message) => {
        return message;
      });

      // Setup mock request with authenticated user
      mockRequest.params = { serviceOrderNumber };

      await webServiceOrderController.rejectQuotation(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(
        `Service order #${serviceOrderNumber} is rejected`,
      );
    });

    it("should return 404 when service order does not exist", async () => {
      const serviceOrderNumber = 1003;

      // Setup mock request
      mockRequest.params = {
        serviceOrderNumber: serviceOrderNumber.toString(),
      };
      mockRequest.body = { isApproved: true };
      // @ts-ignore
      mockRequest.user = {
        userId: userId,
        email: firstUserEmail,
        role: "customer",
      };

      await webServiceOrderController.approveQuotation(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.error).toContain("Service Order not found");
    });
  });

  describe("getByUserDocument", () => {
    it("should get service orders by user document and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "GBD1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      mockRequest.params = { document: "12345678909" };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.getByUserDocument(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(Array.isArray(responseData.data)).toBe(true);
    });

    it("should return 404 when user document does not exist", async () => {
      mockRequest.params = { document: "99999999999" };

      await webServiceOrderController.getByUserDocument(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("getByVehicleLicensePlate", () => {
    it("should get service orders by vehicle license plate and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "GBL1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      mockRequest.params = { licensePlate: "GBL1234" };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.getByVehicleLicensePlate(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(Array.isArray(responseData.data)).toBe(true);
    });

    it("should return 404 when vehicle license plate does not exist", async () => {
      mockRequest.params = { licensePlate: "XYZ9999" };

      await webServiceOrderController.getByVehicleLicensePlate(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("setAsInDiagnostic", () => {
    it("should set service order status as in diagnostic and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "DGN1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      mockRequest.params = { id: serviceOrderId };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.setAsInDiagnostic(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.status).toBe("Em diagnóstico");
    });

    it("should return 404 when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webServiceOrderController.setAsInDiagnostic(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("addPartsAndServices", () => {
    it("should add parts and services to service order and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "ADD1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      // Create a part
      const { PartModel } =
        await import("../../../../src/infrastructure/database/sequelize/models/PartModel");
      const partModel = await PartModel.create({
        partNumber: "PART-001",
        name: "Oil Filter",
        brand: "ACME",
        price: 49.99,
        quantity: 100,
      });

      // Create another service
      const serviceData2 = Service.create("Tire Change", "SRV-002", 149.99);
      const serviceModel2 = await ServiceModel.create({
        name: serviceData2.name,
        serviceCode: serviceData2.serviceCode,
        price: serviceData2.price,
      });

      mockRequest.params = { id: serviceOrderId };
      mockRequest.body = {
        parts: [{ partId: partModel.id, quantity: 2 }],
        serviceIds: [serviceModel2.id],
      };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.addPartsAndServices(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.status).toBe("Aguardando aprovação");
    });

    it("should return 404 when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };
      mockRequest.body = {
        parts: [],
        serviceIds: [],
      };

      await webServiceOrderController.addPartsAndServices(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 400 when part quantity is zero or negative", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "QNT1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      mockRequest.params = { id: serviceOrderId };
      mockRequest.body = {
        parts: [{ partId: "test-id", quantity: 0 }],
        serviceIds: [],
      };

      // Reset mock for next call
      mockResponse.status = jest.fn().mockImplementation((status) => {
        responseStatus = status;
        return mockResponse;
      });
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.addPartsAndServices(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("setAsInExecution", () => {
    it("should set service order status as in execution and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "EXE1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      mockRequest.params = { id: serviceOrderId };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.setAsInExecution(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.status).toBe("Em execução");
    });

    it("should return 404 when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webServiceOrderController.setAsInExecution(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("setAsCompleted", () => {
    it("should set service order status as completed and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "CMP1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      mockRequest.params = { id: serviceOrderId };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.setAsCompleted(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.status).toBe("Finalizado");
    });

    it("should return 404 when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webServiceOrderController.setAsCompleted(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("setAsDelivered", () => {
    it("should set service order status as delivered and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "DLV1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      mockRequest.params = { id: serviceOrderId };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.setAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.status).toBe("Entregue");
    });

    it("should return 404 when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webServiceOrderController.setAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("updateStatus", () => {
    it("should update service order status and return 200 status", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "UPD1235",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      mockRequest.params = { id: serviceOrderId };
      mockRequest.body = { status: "Em diagnóstico" };

      // Reset mock for next call
      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.updateStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.status).toBe("Em diagnóstico");
    });

    it("should return 404 when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };
      mockRequest.body = { status: "Em diagnóstico" };

      await webServiceOrderController.updateStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should update to multiple statuses sequentially", async () => {
      // Create a service order first
      mockRequest.body = {
        document: "12345678909",
        licensePlate: "SEQ1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        serviceCodes: ["SRV-001"],
      };

      await webServiceOrderController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const serviceOrderId = responseData.data.id;

      // Update to inDiagnostic
      mockRequest.params = { id: serviceOrderId };
      mockRequest.body = { status: "Em diagnóstico" };

      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.updateStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.status).toBe("Em diagnóstico");

      // Update to inExecution
      mockRequest.body = { status: "Em execução" };

      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.updateStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.status).toBe("Em execução");

      // Update to completed
      mockRequest.body = { status: "Entregue" };

      mockResponse.json = jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      });

      await webServiceOrderController.updateStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.status).toBe("Entregue");
    });
  });
});
