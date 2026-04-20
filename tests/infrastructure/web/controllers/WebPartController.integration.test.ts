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
import PartModel from "../../../../src/infrastructure/database/sequelize/models/PartModel";
import { ServiceOrderModel } from "../../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import { WebPartController } from "../../../../src/infrastructure/web/controllers/WebPartController";
import { PartRepository } from "../../../../src/infrastructure/repositories/PartRepository";
import { Part } from "../../../../src/domain/entities/Part";

describe("WebPartController Integration Tests", () => {
  let webPartController: WebPartController;
  let partRepository: PartRepository;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: number;
  let responseData: any;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    partRepository = new PartRepository();
    webPartController = new WebPartController(partRepository);

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
    await PartModel.destroy({ where: {} });
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a part and return 201 status", async () => {
      mockRequest.body = {
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 49.99,
        stockQuantity: 100,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data).toHaveProperty("id");
      expect(responseData.data.name).toBe("Engine Oil Filter");
      expect(responseData.data.partNumber).toBe("EOL-123456");
      expect(responseData.data.brand).toBe("Bosch");
    });

    it("should return 400 when name is missing", async () => {
      mockRequest.body = {
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 49.99,
        stockQuantity: 100,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 400 when partNumber is missing", async () => {
      mockRequest.body = {
        name: "Engine Oil Filter",
        brand: "Bosch",
        price: 49.99,
        stockQuantity: 100,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when brand is missing", async () => {
      mockRequest.body = {
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        price: 49.99,
        stockQuantity: 100,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when price is missing", async () => {
      mockRequest.body = {
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        stockQuantity: 100,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when stockQuantity is missing", async () => {
      mockRequest.body = {
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 49.99,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should persist part to database", async () => {
      mockRequest.body = {
        name: "Brake Pad",
        partNumber: "BRK-789012",
        brand: "Brembo",
        price: 89.99,
        stockQuantity: 50,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const partInDb = await PartModel.findOne({
        where: { partNumber: "BRK-789012" },
      });
      expect(partInDb).toBeDefined();
      expect(partInDb?.brand).toBe("Brembo");
    });

    it("should accept zero price", async () => {
      mockRequest.body = {
        name: "Free Sample",
        partNumber: "FREE-001",
        brand: "Generic",
        price: 0,
        stockQuantity: 10,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseData.data.price).toBe(0);
    });

    it("should accept zero stock quantity", async () => {
      mockRequest.body = {
        name: "Out of Stock",
        partNumber: "OOS-001",
        brand: "Generic",
        price: 19.99,
        stockQuantity: 0,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseData.data.stockQuantity).toBe(0);
    });
  });

  describe("getById", () => {
    it("should get a part by id and return 200 status", async () => {
      const partData = Part.create(
        "Air Filter",
        "AIR-345678",
        "Mann",
        29.99,
        75,
      );
      const createdPart = await partRepository.create(partData);

      mockRequest.params = { id: createdPart.id };

      await webPartController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.id).toBe(createdPart.id);
      expect(responseData.data.partNumber).toBe("AIR-345678");
    });

    it("should return 404 when part does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webPartController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });
  });

  describe("getAll", () => {
    it("should get all parts and return 200 status", async () => {
      const part1Data = Part.create(
        "Oil Filter",
        "OIL-111",
        "Bosch",
        49.99,
        100,
      );
      const part2Data = Part.create("Air Filter", "AIR-222", "Mann", 29.99, 75);

      await partRepository.create(part1Data);
      await partRepository.create(part2Data);

      await webPartController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(Array.isArray(responseData.data)).toBe(true);
      expect(responseData.data).toHaveLength(2);
    });

    it("should return empty array when no parts exist", async () => {
      await webPartController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(Array.isArray(responseData.data)).toBe(true);
      expect(responseData.data).toHaveLength(0);
    });
  });

  describe("getPartByPartNumber", () => {
    it("should get a part by part number and return 200 status", async () => {
      const partData = Part.create(
        "Fuel Filter",
        "FUEL-333",
        "Mahle",
        39.99,
        50,
      );
      await partRepository.create(partData);

      mockRequest.params = { partNumber: "FUEL-333" };

      await webPartController.getPartByPartNumber(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.partNumber).toBe("FUEL-333");
      expect(responseData.data.brand).toBe("Mahle");
    });

    it("should return 404 when part number does not exist", async () => {
      mockRequest.params = { partNumber: "NONEXISTENT" };

      await webPartController.getPartByPartNumber(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });
  });

  describe("update", () => {
    it("should update a part and return 200 status", async () => {
      const partData = Part.create("Spark Plug", "SPARK-444", "NGK", 9.99, 200);
      const createdPart = await partRepository.create(partData);

      mockRequest.params = { id: createdPart.id };
      mockRequest.body = {
        name: "Premium Spark Plug",
        brand: "NGK Iridium",
        price: 14.99,
        stockQuantity: 250,
      };

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data.name).toBe("Premium Spark Plug");
      expect(responseData.data.brand).toBe("NGK Iridium");
      expect(responseData.data.price).toBe(14.99);
      expect(responseData.data.stockQuantity).toBe(250);
    });

    it("should update only provided fields", async () => {
      const partData = Part.create(
        "Wiper Blade",
        "WIPER-555",
        "Valeo",
        19.99,
        150,
      );
      const createdPart = await partRepository.create(partData);

      mockRequest.params = { id: createdPart.id };
      mockRequest.body = {
        price: 24.99,
      };

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data.price).toBe(24.99);
      expect(responseData.data.brand).toBe("Valeo");
    });

    it("should return 404 when part does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };
      mockRequest.body = {
        brand: "New Brand",
      };

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });

    it("should persist updates to database", async () => {
      const partData = Part.create("Battery", "BAT-666", "Moura", 299.99, 30);
      const createdPart = await partRepository.create(partData);

      mockRequest.params = { id: createdPart.id };
      mockRequest.body = {
        brand: "Moura Clean",
      };

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      const partInDb = await PartModel.findByPk(createdPart.id);
      expect(partInDb?.brand).toBe("Moura Clean");
    });

    it("should allow updating price to zero", async () => {
      const partData = Part.create(
        "Promotional Item",
        "PROMO-001",
        "Generic",
        19.99,
        100,
      );
      const createdPart = await partRepository.create(partData);

      mockRequest.params = { id: createdPart.id };
      mockRequest.body = {
        price: 0,
      };

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data.price).toBe(0);
    });

    it("should allow updating stock quantity to zero", async () => {
      const partData = Part.create(
        "Last Unit",
        "LAST-001",
        "Generic",
        39.99,
        1,
      );
      const createdPart = await partRepository.create(partData);

      mockRequest.params = { id: createdPart.id };
      mockRequest.body = {
        stockQuantity: 0,
      };

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data.stockQuantity).toBe(0);
    });
  });

  describe("delete", () => {
    it("should delete a part and return 204 status", async () => {
      const partData = Part.create(
        "Headlight Bulb",
        "BULB-777",
        "Philips",
        24.99,
        80,
      );
      const createdPart = await partRepository.create(partData);

      mockRequest.params = { id: createdPart.id };

      await webPartController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it("should return 404 when part does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webPartController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });

    it("should remove part from database", async () => {
      const partData = Part.create(
        "Cabin Filter",
        "CABIN-888",
        "Fram",
        19.99,
        60,
      );
      const createdPart = await partRepository.create(partData);

      mockRequest.params = { id: createdPart.id };

      await webPartController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      const partInDb = await PartModel.findByPk(createdPart.id);
      expect(partInDb).toBeNull();
    });

    it("should not affect other parts when deleting", async () => {
      const part1Data = Part.create(
        "Timing Belt",
        "TIMING-999",
        "Gates",
        89.99,
        40,
      );
      const part2Data = Part.create(
        "Serpentine Belt",
        "SERP-001",
        "Continental",
        49.99,
        45,
      );

      const createdPart1 = await partRepository.create(part1Data);
      await partRepository.create(part2Data);

      mockRequest.params = { id: createdPart1.id };

      await webPartController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      const parts = await partRepository.findAll();
      expect(parts).toHaveLength(1);
      expect(parts[0].partNumber).toBe("SERP-001");
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully in create", async () => {
      // Create a part first
      mockRequest.body = {
        name: "Windshield",
        partNumber: "WIND-001",
        brand: "Saint-Gobain",
        price: 499.99,
        stockQuantity: 10,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Try to create with duplicate part number
      mockRequest.body = {
        name: "Different Windshield",
        partNumber: "WIND-001",
        brand: "Different Brand",
        price: 599.99,
        stockQuantity: 5,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Should handle the error
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should handle validation errors in create", async () => {
      mockRequest.body = {};

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData).toHaveProperty("error");
    });

    it("should reject negative price", async () => {
      mockRequest.body = {
        name: "Invalid Part",
        partNumber: "INV-001",
        brand: "Generic",
        price: -10,
        stockQuantity: 100,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should reject negative stock quantity", async () => {
      mockRequest.body = {
        name: "Invalid Part",
        partNumber: "INV-002",
        brand: "Generic",
        price: 10,
        stockQuantity: -5,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe("complex scenarios", () => {
    it("should handle multiple parts operations in sequence", async () => {
      // Create first part
      mockRequest.body = {
        name: "Radiator",
        partNumber: "RAD-002",
        brand: "Denso",
        price: 299.99,
        stockQuantity: 15,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const partId = responseData.data.id;

      // Get all parts
      await webPartController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data).toHaveLength(1);

      // Update part
      mockRequest.params = { id: partId };
      mockRequest.body = {
        brand: "Denso Premium",
        price: 349.99,
      };

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.brand).toBe("Denso Premium");
      expect(responseData.data.price).toBe(349.99);

      // Get by ID
      mockRequest.params = { id: partId };
      mockRequest.body = {};

      await webPartController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.partNumber).toBe("RAD-002");

      // Delete part
      mockRequest.params = { id: partId };

      await webPartController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);

      // Verify deletion
      mockRequest.body = {};
      await webPartController.getAll(
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
            name: `Part ${i}`,
            partNumber: `PART-00${i}`,
            brand: `Brand${i}`,
            price: 10.0 + i,
            stockQuantity: 100 + i,
          },
          params: {},
        };

        operations.push(
          webPartController.create(
            reqData as unknown as Request,
            mockResponse as Response,
          ),
        );
      }

      await Promise.all(operations);

      const allParts = await partRepository.findAll();
      expect(allParts).toHaveLength(3);

      const uniquePartNumbers = new Set(allParts.map((p) => p.partNumber));
      expect(uniquePartNumbers.size).toBe(3);
    });

    it("should handle inventory updates correctly", async () => {
      mockRequest.body = {
        name: "Alternator",
        partNumber: "ALT-003",
        brand: "Bosch",
        price: 349.99,
        stockQuantity: 20,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const partId = responseData.data.id;

      // Simulate stock reduction
      mockRequest.params = { id: partId };
      mockRequest.body = { stockQuantity: 15 };

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.stockQuantity).toBe(15);

      // Simulate stock replenishment
      mockRequest.body = { stockQuantity: 30 };

      await webPartController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.stockQuantity).toBe(30);
    });

    it("should search by part number after creation", async () => {
      mockRequest.body = {
        name: "Water Pump",
        partNumber: "PUMP-005",
        brand: "Dolz",
        price: 149.99,
        stockQuantity: 18,
      };

      await webPartController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      mockRequest.params = { partNumber: "PUMP-005" };
      mockRequest.body = {};

      await webPartController.getPartByPartNumber(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data.name).toBe("Water Pump");
      expect(responseData.data.brand).toBe("Dolz");
    });
  });
});
