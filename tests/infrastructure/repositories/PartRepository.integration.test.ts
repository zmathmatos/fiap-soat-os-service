import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
} from "@jest/globals";
import sequelize from "../../../src/infrastructure/database/sequelize/config";
import PartModel from "../../../src/infrastructure/database/sequelize/models/PartModel";
import { ServiceOrderModel, ServiceOrderModelPart } from "../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import { PartRepository } from "../../../src/infrastructure/repositories/PartRepository";
import { Part } from "../../../src/domain/entities/Part";

describe("PartRepository Integration Tests", () => {
  let partRepository: PartRepository;

  beforeEach(async () => {
    // Sincronize o banco de dados para testes
    await sequelize.sync({ force: true });
    partRepository = new PartRepository();
  });

  afterEach(async () => {
    // Limpe os dados após cada teste
    await ServiceOrderModelPart.destroy({ where: {} });
    await ServiceOrderModel.destroy({ where: {} });
    await PartModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a new part in the database", async () => {
      const partData = Part.create(
        "Engine Oil Filter",
        "EOL-123456",
        "Bosch",
        49.99,
        100
      );

      const createdPart = await partRepository.create(partData);

      expect(createdPart).toBeInstanceOf(Part);
      expect(createdPart.id).toBeDefined();
      expect(createdPart.name).toBe("Engine Oil Filter");
      expect(createdPart.partNumber).toBe("EOL-123456");
      expect(createdPart.brand).toBe("Bosch");
      expect(createdPart.price).toBe(49.99);
      expect(createdPart.stockQuantity).toBe(100);
      expect(createdPart.createdAt).toBeDefined();
      expect(createdPart.updatedAt).toBeDefined();
    });

    it("should persist part to database", async () => {
      const partData = Part.create(
        "Brake Pad",
        "BRK-789012",
        "Brembo",
        89.99,
        50
      );

      const createdPart = await partRepository.create(partData);

      const savedPart = await PartModel.findByPk(createdPart.id);
      expect(savedPart).toBeDefined();
      expect(savedPart?.partNumber).toBe("BRK-789012");
    });

    it("should create part with zero price", async () => {
      const partData = Part.create(
        "Free Sample Part",
        "FREE-001",
        "Generic",
        0,
        10
      );

      const createdPart = await partRepository.create(partData);

      expect(createdPart.price).toBe(0);
    });

    it("should create part with zero stock quantity", async () => {
      const partData = Part.create(
        "Out of Stock Part",
        "OOS-001",
        "Generic",
        19.99,
        0
      );

      const createdPart = await partRepository.create(partData);

      expect(createdPart.stockQuantity).toBe(0);
    });
  });

  describe("findById", () => {
    it("should find a part by id", async () => {
      const partData = Part.create(
        "Air Filter",
        "AIR-345678",
        "Mann",
        29.99,
        75
      );
      const createdPart = await partRepository.create(partData);

      const foundPart = await partRepository.findById(createdPart.id);

      expect(foundPart).toBeInstanceOf(Part);
      expect(foundPart?.id).toBe(createdPart.id);
      expect(foundPart?.partNumber).toBe("AIR-345678");
    });

    it("should return null when part does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const foundPart = await partRepository.findById(uuid);

      expect(foundPart).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return empty array when no parts exist", async () => {
      const parts = await partRepository.findAll();

      expect(parts).toEqual([]);
    });

    it("should return all parts from database", async () => {
      const part1Data = Part.create(
        "Oil Filter",
        "OIL-111",
        "Bosch",
        49.99,
        100
      );
      const part2Data = Part.create("Air Filter", "AIR-222", "Mann", 29.99, 75);
      const part3Data = Part.create(
        "Fuel Filter",
        "FUEL-333",
        "Mahle",
        39.99,
        50
      );

      await partRepository.create(part1Data);
      await partRepository.create(part2Data);
      await partRepository.create(part3Data);

      const parts = await partRepository.findAll();

      expect(parts).toHaveLength(3);
      expect(parts.every((p) => p instanceof Part)).toBe(true);
      expect(parts.map((p) => p.partNumber)).toContain("OIL-111");
      expect(parts.map((p) => p.partNumber)).toContain("AIR-222");
      expect(parts.map((p) => p.partNumber)).toContain("FUEL-333");
    });

    it("should return Part instances", async () => {
      const partData = Part.create("Spark Plug", "SPARK-444", "NGK", 9.99, 200);
      await partRepository.create(partData);

      const parts = await partRepository.findAll();

      expect(parts[0]).toBeInstanceOf(Part);
    });
  });

  describe("findByPartNumber", () => {
    it("should find a part by part number", async () => {
      const partData = Part.create(
        "Wiper Blade",
        "WIPER-555",
        "Valeo",
        19.99,
        150
      );
      await partRepository.create(partData);

      const foundPart = await partRepository.findByPartNumber("WIPER-555");

      expect(foundPart).toBeInstanceOf(Part);
      expect(foundPart?.partNumber).toBe("WIPER-555");
      expect(foundPart?.brand).toBe("Valeo");
    });

    it("should return null when part number does not exist", async () => {
      const foundPart = await partRepository.findByPartNumber("NONEXISTENT");

      expect(foundPart).toBeNull();
    });

    it("should be case-sensitive for part number search", async () => {
      const partData = Part.create("Battery", "BAT-666", "Moura", 299.99, 30);
      await partRepository.create(partData);

      const foundPart = await partRepository.findByPartNumber("bat-666");

      expect(foundPart).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a part", async () => {
      const partData = Part.create(
        "Headlight Bulb",
        "BULB-777",
        "Philips",
        24.99,
        80
      );
      const createdPart = await partRepository.create(partData);

      const updatedPart = await partRepository.update(createdPart.id, {
        name: "LED Headlight Bulb",
        brand: "Philips Premium",
        price: 34.99,
        stockQuantity: 120,
      });

      expect(updatedPart).toBeInstanceOf(Part);
      expect(updatedPart?.name).toBe("LED Headlight Bulb");
      expect(updatedPart?.brand).toBe("Philips Premium");
      expect(updatedPart?.price).toBe(34.99);
      expect(updatedPart?.stockQuantity).toBe(120);
      expect(updatedPart?.partNumber).toBe("BULB-777"); // Should not change
    });

    it("should update only specified fields", async () => {
      const partData = Part.create(
        "Cabin Filter",
        "CABIN-888",
        "Fram",
        19.99,
        60
      );
      const createdPart = await partRepository.create(partData);

      const updatedPart = await partRepository.update(createdPart.id, {
        price: 24.99,
      });

      expect(updatedPart?.price).toBe(24.99);
      expect(updatedPart?.name).toBe("Cabin Filter");
      expect(updatedPart?.brand).toBe("Fram");
      expect(updatedPart?.stockQuantity).toBe(60);
    });

    it("should persist updates to database", async () => {
      const partData = Part.create(
        "Timing Belt",
        "TIMING-999",
        "Gates",
        89.99,
        40
      );
      const createdPart = await partRepository.create(partData);

      await partRepository.update(createdPart.id, {
        brand: "Gates Premium",
        stockQuantity: 45,
      });

      const partInDb = await PartModel.findByPk(createdPart.id);
      expect(partInDb?.brand).toBe("Gates Premium");
      expect(partInDb?.stockQuantity).toBe(45);
    });

    it("should return null when part does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const result = await partRepository.update(uuid, {
        brand: "New Brand",
      });

      expect(result).toBeNull();
    });

    it("should allow updating price to zero", async () => {
      const partData = Part.create(
        "Promotional Item",
        "PROMO-001",
        "Generic",
        19.99,
        100
      );
      const createdPart = await partRepository.create(partData);

      const updatedPart = await partRepository.update(createdPart.id, {
        price: 0,
      });

      expect(updatedPart?.price).toBe(0);
    });

    it("should allow updating stock quantity to zero", async () => {
      const partData = Part.create(
        "Limited Stock",
        "LIMITED-001",
        "Generic",
        39.99,
        5
      );
      const createdPart = await partRepository.create(partData);

      const updatedPart = await partRepository.update(createdPart.id, {
        stockQuantity: 0,
      });

      expect(updatedPart?.stockQuantity).toBe(0);
    });
  });

  describe("delete", () => {
    it("should delete a part", async () => {
      const partData = Part.create(
        "Windshield",
        "WIND-001",
        "Saint-Gobain",
        499.99,
        10
      );
      const createdPart = await partRepository.create(partData);

      const deleted = await partRepository.delete(createdPart.id);

      expect(deleted).toBe(true);
    });

    it("should remove part from database", async () => {
      const partData = Part.create("Radiator", "RAD-002", "Denso", 299.99, 15);
      const createdPart = await partRepository.create(partData);

      await partRepository.delete(createdPart.id);

      const partInDb = await PartModel.findByPk(createdPart.id);
      expect(partInDb).toBeNull();
    });

    it("should return false when part does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const deleted = await partRepository.delete(uuid);

      expect(deleted).toBe(false);
    });

    it("should not affect other parts when deleting", async () => {
      const part1Data = Part.create(
        "Mirror Left",
        "MIR-L-001",
        "Valeo",
        79.99,
        25
      );
      const part2Data = Part.create(
        "Mirror Right",
        "MIR-R-002",
        "Valeo",
        79.99,
        25
      );

      const createdPart1 = await partRepository.create(part1Data);
      await partRepository.create(part2Data);

      await partRepository.delete(createdPart1.id);

      const parts = await partRepository.findAll();
      expect(parts).toHaveLength(1);
      expect(parts[0].partNumber).toBe("MIR-R-002");
    });
  });

  describe("complex scenarios", () => {
    it("should handle CRUD operations in sequence", async () => {
      // Create
      const partData = Part.create(
        "Alternator",
        "ALT-003",
        "Bosch",
        349.99,
        20
      );
      const created = await partRepository.create(partData);
      expect(created.id).toBeDefined();

      // Read
      let found = await partRepository.findById(created.id);
      expect(found?.partNumber).toBe("ALT-003");

      // Update
      const updated = await partRepository.update(created.id, {
        brand: "Bosch Reman",
        price: 299.99,
      });
      expect(updated?.brand).toBe("Bosch Reman");
      expect(updated?.price).toBe(299.99);

      // Verify update
      found = await partRepository.findById(created.id);
      expect(found?.brand).toBe("Bosch Reman");

      // Delete
      const deleted = await partRepository.delete(created.id);
      expect(deleted).toBe(true);

      // Verify deletion
      found = await partRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it("should maintain data integrity with concurrent operations", async () => {
      const part1Data = Part.create(
        "Starter Motor",
        "START-004",
        "Valeo",
        249.99,
        12
      );
      const part2Data = Part.create(
        "Water Pump",
        "PUMP-005",
        "Dolz",
        149.99,
        18
      );

      const [created1, created2] = await Promise.all([
        partRepository.create(part1Data),
        partRepository.create(part2Data),
      ]);

      expect(created1.id).not.toBe(created2.id);

      const all = await partRepository.findAll();
      expect(all).toHaveLength(2);
    });

    it("should handle multiple updates to same part", async () => {
      const partData = Part.create(
        "Suspension Spring",
        "SPRING-006",
        "Monroe",
        129.99,
        30
      );
      const created = await partRepository.create(partData);

      await partRepository.update(created.id, { price: 119.99 });
      await partRepository.update(created.id, { stockQuantity: 35 });
      await partRepository.update(created.id, { brand: "Monroe Heavy Duty" });

      const final = await partRepository.findById(created.id);
      expect(final?.price).toBe(119.99);
      expect(final?.stockQuantity).toBe(35);
      expect(final?.brand).toBe("Monroe Heavy Duty");
    });

    it("should allow searching by part number after update", async () => {
      const partData = Part.create(
        "Shock Absorber",
        "SHOCK-007",
        "KYB",
        159.99,
        22
      );
      await partRepository.create(partData);

      const found1 = await partRepository.findByPartNumber("SHOCK-007");
      expect(found1).not.toBeNull();

      await partRepository.update(found1!.id, { brand: "KYB Excel-G" });

      const found2 = await partRepository.findByPartNumber("SHOCK-007");
      expect(found2?.brand).toBe("KYB Excel-G");
    });
  });
});
