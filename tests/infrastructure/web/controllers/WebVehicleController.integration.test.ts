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
import VehicleModel from "../../../../src/infrastructure/database/sequelize/models/VehicleModel";
import { ServiceOrderModel } from "../../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import { WebVehicleController } from "../../../../src/infrastructure/web/controllers/WebVehicleController";
import { VehicleRepository } from "../../../../src/infrastructure/repositories/VehicleRepository";
import { Vehicle } from "../../../../src/domain/entities/Vehicle";

describe("WebVehicleController Integration Tests", () => {
  let webVehicleController: WebVehicleController;
  let vehicleRepository: VehicleRepository;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    vehicleRepository = new VehicleRepository();
    webVehicleController = new WebVehicleController(vehicleRepository);

    // Setup mock request and response
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
    await ServiceOrderModel.destroy({ where: {} });
    await VehicleModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a vehicle and return 201 status", async () => {
      mockRequest.body = {
        licensePlate: "ABC1234",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
      };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data).toHaveProperty("id");
      expect(responseData.data.licensePlate).toBe("ABC1234");
      expect(responseData.data.brand).toBe("Toyota");
    });

    it("should return 400 when licensePlate is missing", async () => {
      mockRequest.body = {
        brand: "Honda",
        model: "Civic",
        year: 2022,
      };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 400 when brand is missing", async () => {
      mockRequest.body = {
        licensePlate: "XYZ9876",
        model: "Civic",
        year: 2022,
      };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when model is missing", async () => {
      mockRequest.body = {
        licensePlate: "XYZ9876",
        brand: "Honda",
        year: 2022,
      };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when year is missing", async () => {
      mockRequest.body = {
        licensePlate: "XYZ9876",
        brand: "Honda",
        model: "Civic",
      };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should persist vehicle to database", async () => {
      mockRequest.body = {
        licensePlate: "DEF5678",
        brand: "Ford",
        model: "Mustang",
        year: 2021,
      };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const vehicleInDb = await VehicleModel.findOne({
        where: { licensePlate: "DEF5678" },
      });
      expect(vehicleInDb).toBeDefined();
      expect(vehicleInDb?.brand).toBe("Ford");
    });
  });

  describe("getById", () => {
    it("should get a vehicle by id and return 200 status", async () => {
      const vehicleData = Vehicle.create("GHI9012", "Chevrolet", "Cruze", 2020);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      mockRequest.params = { id: createdVehicle.id };

      await webVehicleController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.id).toBe(createdVehicle.id);
      expect(responseData.data.licensePlate).toBe("GHI9012");
    });

    it("should return 404 when vehicle does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webVehicleController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });
  });

  describe("getAll", () => {
    it("should get all vehicles and return 200 status", async () => {
      const vehicle1Data = Vehicle.create("JKL3456", "Nissan", "Altima", 2021);
      const vehicle2Data = Vehicle.create("MNO7890", "Subaru", "Outback", 2019);

      await vehicleRepository.create(vehicle1Data);
      await vehicleRepository.create(vehicle2Data);

      await webVehicleController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(Array.isArray(responseData.data)).toBe(true);
      expect(responseData.data).toHaveLength(2);
    });

    it("should return empty array when no vehicles exist", async () => {
      await webVehicleController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(Array.isArray(responseData.data)).toBe(true);
      expect(responseData.data).toHaveLength(0);
    });
  });

  describe("getVehicleByLicensePlate", () => {
    it("should get a vehicle by license plate and return 200 status", async () => {
      const vehicleData = Vehicle.create("PQR4567", "Mazda", "CX-5", 2022);
      await vehicleRepository.create(vehicleData);

      mockRequest.params = { licensePlate: "PQR4567" };

      await webVehicleController.getVehicleByLicensePlate(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.licensePlate).toBe("PQR4567");
      expect(responseData.data.brand).toBe("Mazda");
    });

    it("should return 404 when license plate does not exist", async () => {
      mockRequest.params = { licensePlate: "NONEXISTENT" };

      await webVehicleController.getVehicleByLicensePlate(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });
  });

  describe("update", () => {
    it("should update a vehicle and return 200 status", async () => {
      const vehicleData = Vehicle.create("STU8901", "Kia", "Sorento", 2021);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      mockRequest.params = { id: createdVehicle.id };
      mockRequest.body = {
        licensePlate: "STU8901",
        brand: "Kia Updated",
        model: "Sorento Premium",
        year: 2024,
      };

      await webVehicleController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data.brand).toBe("Kia Updated");
      expect(responseData.data.model).toBe("Sorento Premium");
      expect(responseData.data.year).toBe(2024);
    });

    it("should update only provided fields", async () => {
      const vehicleData = Vehicle.create("VWX2345", "Hyundai", "Elantra", 2023);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      mockRequest.params = { id: createdVehicle.id };
      mockRequest.body = {
        year: 2025,
      };

      await webVehicleController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data.year).toBe(2025);
      expect(responseData.data.brand).toBe("Hyundai");
    });

    it("should return 404 when vehicle does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };
      mockRequest.body = {
        brand: "New Brand",
      };

      await webVehicleController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });

    it("should persist updates to database", async () => {
      const vehicleData = Vehicle.create(
        "YZA6789",
        "Volkswagen",
        "Jetta",
        2020,
      );
      const createdVehicle = await vehicleRepository.create(vehicleData);

      mockRequest.params = { id: createdVehicle.id };
      mockRequest.body = {
        licensePlate: vehicleData.licensePlate,
        model: vehicleData.model,
        brand: "Volkswagen Sport",
        year: vehicleData.year,
      };

      await webVehicleController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      const vehicleInDb = await VehicleModel.findByPk(createdVehicle.id);
      expect(vehicleInDb?.brand).toBe("Volkswagen Sport");
    });
  });

  describe("delete", () => {
    it("should delete a vehicle and return 204 status", async () => {
      const vehicleData = Vehicle.create("AAA0001", "Fiat", "Strada", 2023);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      mockRequest.params = { id: createdVehicle.id };

      await webVehicleController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it("should return 404 when vehicle does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webVehicleController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });

    it("should remove vehicle from database", async () => {
      const vehicleData = Vehicle.create("BBB0002", "Renault", "Duster", 2022);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      mockRequest.params = { id: createdVehicle.id };

      await webVehicleController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      const vehicleInDb = await VehicleModel.findByPk(createdVehicle.id);
      expect(vehicleInDb).toBeNull();
    });

    it("should not affect other vehicles when deleting", async () => {
      const vehicle1Data = Vehicle.create("CCC0003", "Peugeot", "208", 2021);
      const vehicle2Data = Vehicle.create("DDD0004", "Citroën", "C3", 2022);

      const createdVehicle1 = await vehicleRepository.create(vehicle1Data);
      await vehicleRepository.create(vehicle2Data);

      mockRequest.params = { id: createdVehicle1.id };

      await webVehicleController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      const vehicles = await vehicleRepository.findAll();
      expect(vehicles).toHaveLength(1);
      expect(vehicles[0].licensePlate).toBe("DDD0004");
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully in create", async () => {
      // Create a vehicle first
      mockRequest.body = {
        licensePlate: "EEE0005",
        brand: "Tata",
        model: "Nexon",
        year: 2023,
      };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Try to create with duplicate license plate
      mockRequest.body = {
        licensePlate: "EEE0005",
        brand: "Different Brand",
        model: "Different Model",
        year: 2024,
      };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Should handle the error
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should handle validation errors in create", async () => {
      mockRequest.body = {};

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData).toHaveProperty("error");
    });
  });

  describe("complex scenarios", () => {
    it("should handle multiple vehicles operations in sequence", async () => {
      // Create first vehicle
      mockRequest.body = {
        licensePlate: "FFF0006",
        brand: "Skoda",
        model: "Rapid",
        year: 2023,
      };

      await webVehicleController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const vehicleId = responseData.data.id;

      // Get all vehicles
      await webVehicleController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data).toHaveLength(1);

      // Update vehicle
      mockRequest.params = { id: vehicleId };
      mockRequest.body = {
        licensePlate: "FFF0006",
        brand: "Skoda Updated",
        model: "Rapid",
        year: 2023,
      };

      await webVehicleController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.brand).toBe("Skoda Updated");

      // Get by ID
      mockRequest.params = { id: vehicleId };
      mockRequest.body = {};

      await webVehicleController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.licensePlate).toBe("FFF0006");

      // Delete vehicle
      mockRequest.params = { id: vehicleId };

      await webVehicleController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);

      // Verify deletion
      mockRequest.body = {};
      await webVehicleController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data).toHaveLength(0);
    });

    it("should maintain data integrity with multiple concurrent operations", async () => {
      const operations = [];

      for (let i = 0; i < 3; i++) {
        const reqData = {
          body: {
            licensePlate: `GGG000${i}`,
            brand: `Brand${i}`,
            model: `Model${i}`,
            year: 2023,
          },
          params: {},
        };

        operations.push(
          webVehicleController.create(
            reqData as unknown as Request,
            mockResponse as Response,
          ),
        );
      }

      await Promise.all(operations);

      const allVehicles = await vehicleRepository.findAll();
      expect(allVehicles).toHaveLength(3);

      const uniquePlates = new Set(allVehicles.map((v) => v.licensePlate));
      expect(uniquePlates.size).toBe(3);
    });
  });
});
