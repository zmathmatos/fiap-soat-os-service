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
import ServiceModel from "../../../../src/infrastructure/database/sequelize/models/ServiceModel";
import { ServiceOrderModel } from "../../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import { WebServiceController } from "../../../../src/infrastructure/web/controllers/WebServiceController";
import { ServiceRepository } from "../../../../src/infrastructure/repositories/ServiceRepository";
import { Service } from "../../../../src/domain/entities/Service";

describe("WebServiceController Integration Tests", () => {
  let webServiceController: WebServiceController;
  let serviceRepository: ServiceRepository;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: number;
  let responseData: any;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    serviceRepository = new ServiceRepository();
    webServiceController = new WebServiceController(serviceRepository);

    // Setup mock request and response
    mockRequest = {
      body: {},
      params: {},
    };

    responseStatus = 0;
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
    await ServiceOrderModel.destroy({ where: {} });
    await ServiceModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a service and return 201 status", async () => {
      mockRequest.body = {
        name: "Oil Change",
        serviceCode: "SRV-001",
        price: 99.99,
      };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data).toHaveProperty("id");
      expect(responseData.data.name).toBe("Oil Change");
      expect(responseData.data.serviceCode).toBe("SRV-001");
      expect(responseData.data.price).toBe(99.99);
    });

    it("should return 400 when name is missing", async () => {
      mockRequest.body = {
        serviceCode: "SRV-001",
        price: 99.99,
      };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 400 when serviceCode is missing", async () => {
      mockRequest.body = {
        name: "Oil Change",
        price: 99.99,
      };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 400 when price is missing", async () => {
      mockRequest.body = {
        name: "Oil Change",
        serviceCode: "SRV-001",
      };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 400 when price is negative", async () => {
      mockRequest.body = {
        name: "Oil Change",
        serviceCode: "SRV-001",
        price: -10,
      };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toContain("negative");
    });

    it("should return 400 when service code already exists", async () => {
      const serviceData = Service.create("Existing Service", "SRV-001", 50);
      await serviceRepository.create(serviceData);

      mockRequest.body = {
        name: "New Service",
        serviceCode: "SRV-001",
        price: 99.99,
      };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toContain("already exists");
    });

    it("should create service with price zero", async () => {
      mockRequest.body = {
        name: "Free Inspection",
        serviceCode: "SRV-FREE",
        price: 0,
      };

      await webServiceController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseData.data.price).toBe(0);
    });
  });

  describe("getById", () => {
    it("should return a service by id with 200 status", async () => {
      const serviceData = Service.create("Brake Service", "SRV-002", 149.99);
      const createdService = await serviceRepository.create(serviceData);

      mockRequest.params = { id: createdService.id };

      await webServiceController.getById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.id).toBe(createdService.id);
      expect(responseData.data.name).toBe("Brake Service");
    });

    it("should return 404 when service is not found", async () => {
      mockRequest.params = { id: "12345678-1234-1234-1234-123456789012" };

      await webServiceController.getById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toContain("not found");
    });
  });

  describe("getAll", () => {
    it("should return all services with 200 status", async () => {
      const service1Data = Service.create("Oil Change", "SRV-001", 99.99);
      const service2Data = Service.create("Tire Rotation", "SRV-002", 49.99);
      const service3Data = Service.create("Brake Service", "SRV-003", 79.99);

      await serviceRepository.create(service1Data);
      await serviceRepository.create(service2Data);
      await serviceRepository.create(service3Data);

      await webServiceController.getAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(Array.isArray(responseData.data)).toBe(true);
      expect(responseData.data).toHaveLength(3);
    });

    it("should return empty array when no services exist", async () => {
      await webServiceController.getAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data).toEqual([]);
    });
  });

  describe("getServiceByServiceCode", () => {
    it("should return a service by service code with 200 status", async () => {
      const serviceData = Service.create("Alignment", "SRV-004", 79.99);
      await serviceRepository.create(serviceData);

      mockRequest.params = { serviceCode: "SRV-004" };

      await webServiceController.getServiceByServiceCode(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.serviceCode).toBe("SRV-004");
      expect(responseData.data.name).toBe("Alignment");
    });

    it("should return 404 when service code is not found", async () => {
      mockRequest.params = { serviceCode: "NONEXISTENT" };

      await webServiceController.getServiceByServiceCode(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toContain("not found");
    });
  });

  describe("update", () => {
    it("should update a service and return 200 status", async () => {
      const serviceData = Service.create("Basic Oil Change", "SRV-005", 79.99);
      const createdService = await serviceRepository.create(serviceData);

      mockRequest.params = { id: createdService.id };
      mockRequest.body = {
        name: "Premium Oil Change",
        price: 129.99,
      };

      await webServiceController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.name).toBe("Premium Oil Change");
      expect(responseData.data.price).toBe(129.99);
    });

    it("should update only specified fields", async () => {
      const serviceData = Service.create("Wheel Alignment", "SRV-006", 89.99);
      const createdService = await serviceRepository.create(serviceData);

      mockRequest.params = { id: createdService.id };
      mockRequest.body = {
        price: 99.99,
      };

      await webServiceController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data.price).toBe(99.99);
      expect(responseData.data.name).toBe("Wheel Alignment");
    });

    it("should return 404 when service is not found", async () => {
      mockRequest.params = { id: "12345678-1234-1234-1234-123456789012" };
      mockRequest.body = {
        name: "Updated Service",
      };

      await webServiceController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toContain("not found");
    });

    it("should return 400 when price is negative", async () => {
      const serviceData = Service.create("Test Service", "SRV-007", 99.99);
      const createdService = await serviceRepository.create(serviceData);

      mockRequest.params = { id: createdService.id };
      mockRequest.body = {
        price: -50,
      };

      await webServiceController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toContain("negative");
    });

    it("should return 400 when service code already exists for another service", async () => {
      const service1Data = Service.create("Service 1", "SRV-009", 50);
      const service2Data = Service.create("Service 2", "SRV-010", 60);

      const createdService1 = await serviceRepository.create(service1Data);
      await serviceRepository.create(service2Data);

      mockRequest.params = { id: createdService1.id };
      mockRequest.body = {
        serviceCode: "SRV-010",
      };

      await webServiceController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toContain("already exists");
    });
  });

  describe("delete", () => {
    it("should delete a service and return 204 status", async () => {
      const serviceData = Service.create("Coolant Flush", "SRV-011", 89.99);
      const createdService = await serviceRepository.create(serviceData);

      mockRequest.params = { id: createdService.id };

      await webServiceController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();

      // Verify service was deleted
      const deletedService = await serviceRepository.findById(
        createdService.id
      );
      expect(deletedService).toBeNull();
    });

    it("should return 404 when service is not found", async () => {
      mockRequest.params = { id: "12345678-1234-1234-1234-123456789012" };

      await webServiceController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toContain("not found");
    });

    it("should remove service from database", async () => {
      const serviceData = Service.create("Test Service", "SRV-012", 49.99);
      const createdService = await serviceRepository.create(serviceData);

      mockRequest.params = { id: createdService.id };

      await webServiceController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      const services = await serviceRepository.findAll();
      expect(services.find((s) => s.id === createdService.id)).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should handle internal server errors gracefully", async () => {
      // Force an error by passing invalid data
      const invalidServiceRepository = {
        ...serviceRepository,
        findAll: jest.fn().mockRejectedValue("Database error"),
      };

      const errorController = new WebServiceController(
        invalidServiceRepository as any
      );

      await errorController.getAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
