import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetAllPartsUseCase } from "../../../../../src/application/use-cases/part/methods/GetAllPartsUseCase";
import type { IPartRepository } from "../../../../../src/domain/repositories/IPartRepository";
import { Part } from "../../../../../src/domain/entities/Part";

describe("GetAllPartsUseCase", () => {
  let getAllPartsUseCase: GetAllPartsUseCase;
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

    getAllPartsUseCase = new GetAllPartsUseCase(mockPartRepository);
  });

  describe("execute", () => {
    it("should return all parts", async () => {
      const mockParts = [
        new Part({
          id: "1",
          name: "Engine Oil Filter",
          partNumber: "EOL-123456",
          brand: "Bosch",
          price: 49.99,
          stockQuantity: 100,
        }),
        new Part({
          id: "2",
          name: "Brake Pad",
          partNumber: "BRK-789012",
          brand: "Brembo",
          price: 89.99,
          stockQuantity: 50,
        }),
        new Part({
          id: "3",
          name: "Air Filter",
          partNumber: "AIR-345678",
          brand: "Mann",
          price: 29.99,
          stockQuantity: 75,
        }),
      ];

      mockPartRepository.findAll.mockResolvedValue(mockParts);

      const result = await getAllPartsUseCase.execute();

      expect(result).toEqual(mockParts);
      expect(result).toHaveLength(3);
      expect(mockPartRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no parts exist", async () => {
      mockPartRepository.findAll.mockResolvedValue([]);

      const result = await getAllPartsUseCase.execute();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockPartRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database connection error");
      mockPartRepository.findAll.mockRejectedValue(error);

      await expect(getAllPartsUseCase.execute()).rejects.toThrow(
        "Database connection error"
      );
    });
  });
});
