import { describe, it, expect, beforeEach } from "@jest/globals";
import { CreatePartUseCase } from "../../../../../src/application/use-cases/part/methods/CreatePartUseCase";
import type { IPartRepository } from "../../../../../src/domain/repositories/IPartRepository";
import { Part } from "../../../../../src/domain/entities/Part";

describe("CreatePartUseCase", () => {
  let createPartUseCase: CreatePartUseCase;
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

    createPartUseCase = new CreatePartUseCase(mockPartRepository);
  });

  describe("execute", () => {
    const validName = "Engine Oil Filter";
    const validPartNumber = "EOL-123456";
    const validBrand = "Bosch";
    const validPrice = 49.99;
    const validStockQuantity = 100;

    it("should create a part with valid data", async () => {
      const mockPart = new Part({
        id: "1",
        name: validName,
        partNumber: validPartNumber,
        brand: validBrand,
        price: validPrice,
        stockQuantity: validStockQuantity,
      });

      mockPartRepository.findByPartNumber.mockResolvedValue(null);
      mockPartRepository.create.mockResolvedValue(mockPart);

      const result = await createPartUseCase.execute(
        validName,
        validPartNumber,
        validBrand,
        validPrice,
        validStockQuantity
      );

      expect(result).toEqual(mockPart);
      expect(mockPartRepository.findByPartNumber).toHaveBeenCalledWith(
        validPartNumber
      );
      expect(mockPartRepository.create).toHaveBeenCalled();
    });

    it("should throw error when name is missing", async () => {
      await expect(
        createPartUseCase.execute(
          "",
          validPartNumber,
          validBrand,
          validPrice,
          validStockQuantity
        )
      ).rejects.toThrow("All fields are required");
    });

    it("should throw error when partNumber is missing", async () => {
      await expect(
        createPartUseCase.execute(
          validName,
          "",
          validBrand,
          validPrice,
          validStockQuantity
        )
      ).rejects.toThrow("All fields are required");
    });

    it("should throw error when brand is missing", async () => {
      await expect(
        createPartUseCase.execute(
          validName,
          validPartNumber,
          "",
          validPrice,
          validStockQuantity
        )
      ).rejects.toThrow("All fields are required");
    });

    it("should throw error when price is undefined", async () => {
      await expect(
        createPartUseCase.execute(
          validName,
          validPartNumber,
          validBrand,
          undefined as any,
          validStockQuantity
        )
      ).rejects.toThrow("All fields are required");
    });

    it("should throw error when stockQuantity is undefined", async () => {
      await expect(
        createPartUseCase.execute(
          validName,
          validPartNumber,
          validBrand,
          validPrice,
          undefined as any
        )
      ).rejects.toThrow("All fields are required");
    });

    it("should throw error when price is negative", async () => {
      await expect(
        createPartUseCase.execute(
          validName,
          validPartNumber,
          validBrand,
          -10,
          validStockQuantity
        )
      ).rejects.toThrow("Price cannot be negative");
    });

    it("should throw error when stockQuantity is negative", async () => {
      await expect(
        createPartUseCase.execute(
          validName,
          validPartNumber,
          validBrand,
          validPrice,
          -5
        )
      ).rejects.toThrow("Stock quantity cannot be negative");
    });

    it("should throw error when part with same part number already exists", async () => {
      const existingPart = new Part({
        id: "1",
        name: "Existing Part",
        partNumber: validPartNumber,
        brand: "OtherBrand",
        price: 99.99,
        stockQuantity: 50,
      });

      mockPartRepository.findByPartNumber.mockResolvedValue(existingPart);

      await expect(
        createPartUseCase.execute(
          validName,
          validPartNumber,
          validBrand,
          validPrice,
          validStockQuantity
        )
      ).rejects.toThrow("Part with this part number already exists");

      expect(mockPartRepository.create).not.toHaveBeenCalled();
    });

    it("should accept zero price", async () => {
      const mockPart = new Part({
        id: "2",
        name: validName,
        partNumber: "FREE-001",
        brand: validBrand,
        price: 0,
        stockQuantity: validStockQuantity,
      });

      mockPartRepository.findByPartNumber.mockResolvedValue(null);
      mockPartRepository.create.mockResolvedValue(mockPart);

      const result = await createPartUseCase.execute(
        validName,
        "FREE-001",
        validBrand,
        0,
        validStockQuantity
      );

      expect(result).toEqual(mockPart);
    });

    it("should accept zero stock quantity", async () => {
      const mockPart = new Part({
        id: "3",
        name: validName,
        partNumber: "OUT-STOCK",
        brand: validBrand,
        price: validPrice,
        stockQuantity: 0,
      });

      mockPartRepository.findByPartNumber.mockResolvedValue(null);
      mockPartRepository.create.mockResolvedValue(mockPart);

      const result = await createPartUseCase.execute(
        validName,
        "OUT-STOCK",
        validBrand,
        validPrice,
        0
      );

      expect(result).toEqual(mockPart);
    });
  });
});
