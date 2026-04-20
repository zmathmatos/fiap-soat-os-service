import { PartController } from "../../../src/interface/controllers/PartController";
import type { IPartRepository } from "../../../src/domain/repositories/IPartRepository";
import { Part } from "../../../src/domain/entities/Part";

const makePart = (
  overrides: Partial<ConstructorParameters<typeof Part>[0]> = {},
): Part =>
  new Part({
    id: "1",
    name: "Engine Oil Filter",
    partNumber: "EOL-123456",
    brand: "Bosch",
    price: 49.99,
    stockQuantity: 100,
    ...overrides,
  });

describe("PartController", () => {
  let partController: PartController;
  let mockPartRepository: jest.Mocked<IPartRepository>;

  beforeEach(() => {
    mockPartRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByPartNumber: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    partController = new PartController(mockPartRepository);
  });

  describe("create", () => {
    it("should create a part and return it", async () => {
      const part = makePart();

      mockPartRepository.findByPartNumber.mockResolvedValue(null);
      mockPartRepository.create.mockResolvedValue(part);

      const result = await partController.create({
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 49.99,
        stockQuantity: 100,
      });

      expect(result).toEqual(part);
      expect(mockPartRepository.findByPartNumber).toHaveBeenCalledWith(
        "EOL-123456",
      );
      expect(mockPartRepository.create).toHaveBeenCalledWith({
        name: part.name,
        partNumber: part.partNumber,
        brand: part.brand,
        price: part.price,
        stockQuantity: part.stockQuantity,
      });
    });

    it("should throw an error when name is missing", async () => {
      await expect(
        partController.create({
          name: "",
          partNumber: "EOL-123456",
          brand: "Bosch",
          price: 49.99,
          stockQuantity: 100,
        }),
      ).rejects.toThrow("All fields are required");

      expect(mockPartRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when partNumber is missing", async () => {
      await expect(
        partController.create({
          name: "Engine Oil Filter",
          partNumber: "",
          brand: "Bosch",
          price: 49.99,
          stockQuantity: 100,
        }),
      ).rejects.toThrow("All fields are required");

      expect(mockPartRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when brand is missing", async () => {
      await expect(
        partController.create({
          name: "Engine Oil Filter",
          partNumber: "EOL-123456",
          brand: "",
          price: 49.99,
          stockQuantity: 100,
        }),
      ).rejects.toThrow("All fields are required");

      expect(mockPartRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when price is negative", async () => {
      await expect(
        partController.create({
          name: "Engine Oil Filter",
          partNumber: "EOL-123456",
          brand: "Bosch",
          price: -10,
          stockQuantity: 100,
        }),
      ).rejects.toThrow("Price cannot be negative");

      expect(mockPartRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when stockQuantity is negative", async () => {
      await expect(
        partController.create({
          name: "Engine Oil Filter",
          partNumber: "EOL-123456",
          brand: "Bosch",
          price: 49.99,
          stockQuantity: -5,
        }),
      ).rejects.toThrow("Stock quantity cannot be negative");

      expect(mockPartRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when part number is already in use", async () => {
      const existing = makePart();
      mockPartRepository.findByPartNumber.mockResolvedValue(existing);

      await expect(
        partController.create({
          name: "Another Filter",
          partNumber: "EOL-123456",
          brand: "Mann",
          price: 39.99,
          stockQuantity: 50,
        }),
      ).rejects.toThrow("Part with this part number already exists");

      expect(mockPartRepository.create).not.toHaveBeenCalled();
    });

    it("should accept zero price", async () => {
      const part = makePart({ price: 0, partNumber: "FREE-001" });

      mockPartRepository.findByPartNumber.mockResolvedValue(null);
      mockPartRepository.create.mockResolvedValue(part);

      const result = await partController.create({
        name: "Engine Oil Filter",
        partNumber: "FREE-001",
        brand: "Bosch",
        price: 0,
        stockQuantity: 100,
      });

      expect(result).toEqual(part);
    });

    it("should accept zero stockQuantity", async () => {
      const part = makePart({ stockQuantity: 0, partNumber: "OUT-STOCK" });

      mockPartRepository.findByPartNumber.mockResolvedValue(null);
      mockPartRepository.create.mockResolvedValue(part);

      const result = await partController.create({
        name: "Engine Oil Filter",
        partNumber: "OUT-STOCK",
        brand: "Bosch",
        price: 49.99,
        stockQuantity: 0,
      });

      expect(result).toEqual(part);
    });
  });

  describe("getById", () => {
    it("should return a part by id", async () => {
      const part = makePart();
      mockPartRepository.findById.mockResolvedValue(part);

      const result = await partController.getById("1");

      expect(result).toEqual(part);
      expect(mockPartRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should return null when part is not found", async () => {
      mockPartRepository.findById.mockResolvedValue(null);

      const result = await partController.getById("non-existent-id");

      expect(result).toBeNull();
      expect(mockPartRepository.findById).toHaveBeenCalledWith(
        "non-existent-id",
      );
    });
  });

  describe("getAll", () => {
    it("should return all parts", async () => {
      const parts = [
        makePart({ id: "1" }),
        makePart({ id: "2", partNumber: "BRK-987654" }),
      ];
      mockPartRepository.findAll.mockResolvedValue(parts);

      const result = await partController.getAll();

      expect(result).toEqual(parts);
      expect(result).toHaveLength(2);
      expect(mockPartRepository.findAll).toHaveBeenCalled();
    });

    it("should return an empty array when there are no parts", async () => {
      mockPartRepository.findAll.mockResolvedValue([]);

      const result = await partController.getAll();

      expect(result).toEqual([]);
      expect(mockPartRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("getPartByPartNumber", () => {
    it("should return a part by part number", async () => {
      const part = makePart();
      mockPartRepository.findByPartNumber.mockResolvedValue(part);

      const result = await partController.getPartByPartNumber("EOL-123456");

      expect(result).toEqual(part);
      expect(mockPartRepository.findByPartNumber).toHaveBeenCalledWith(
        "EOL-123456",
      );
    });

    it("should return null when no part matches the part number", async () => {
      mockPartRepository.findByPartNumber.mockResolvedValue(null);

      const result = await partController.getPartByPartNumber("UNKNOWN-000");

      expect(result).toBeNull();
      expect(mockPartRepository.findByPartNumber).toHaveBeenCalledWith(
        "UNKNOWN-000",
      );
    });
  });

  describe("update", () => {
    it("should update and return the part", async () => {
      const existing = makePart();
      const updated = makePart({ name: "Premium Oil Filter", price: 59.99 });

      mockPartRepository.findById.mockResolvedValue(existing);
      mockPartRepository.update.mockResolvedValue(updated);

      const result = await partController.update({
        id: "1",
        name: "Premium Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 59.99,
        stockQuantity: 100,
      });

      expect(result).toEqual(updated);
      expect(mockPartRepository.update).toHaveBeenCalledWith("1", {
        name: "Premium Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 59.99,
        stockQuantity: 100,
      });
    });

    it("should return null when the part to update does not exist", async () => {
      mockPartRepository.findById.mockResolvedValue(null);

      const result = await partController.update({
        id: "non-existent-id",
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 49.99,
        stockQuantity: 100,
      });

      expect(result).toBeNull();
      expect(mockPartRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete an existing part and return true", async () => {
      const part = makePart();
      mockPartRepository.findById.mockResolvedValue(part);
      mockPartRepository.delete.mockResolvedValue(true);

      const result = await partController.delete("1");

      expect(result).toBe(true);
      expect(mockPartRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should throw an error when part is not found", async () => {
      mockPartRepository.findById.mockResolvedValue(null);

      await expect(partController.delete("non-existent-id")).rejects.toThrow(
        "Part not found",
      );

      expect(mockPartRepository.delete).not.toHaveBeenCalled();
    });
  });
});
