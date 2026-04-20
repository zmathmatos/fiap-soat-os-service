import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetPartByPartNumberUseCase } from "../../../../../src/application/use-cases/part/methods/GetPartByPartNumberUseCase";
import type { IPartRepository } from "../../../../../src/domain/repositories/IPartRepository";
import { Part } from "../../../../../src/domain/entities/Part";

describe("GetPartByPartNumberUseCase", () => {
  let getPartByPartNumberUseCase: GetPartByPartNumberUseCase;
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

    getPartByPartNumberUseCase = new GetPartByPartNumberUseCase(
      mockPartRepository
    );
  });

  describe("execute", () => {
    const partNumber = "EOL-123456";
    const mockPart = new Part({
      id: "1",
      name: "Engine Oil Filter",
      partNumber: partNumber,
      brand: "Bosch",
      price: 49.99,
      stockQuantity: 100,
    });

    it("should return part when found by part number", async () => {
      mockPartRepository.findByPartNumber.mockResolvedValue(mockPart);

      const result = await getPartByPartNumberUseCase.execute(partNumber);

      expect(result).toEqual(mockPart);
      expect(mockPartRepository.findByPartNumber).toHaveBeenCalledWith(
        partNumber
      );
      expect(mockPartRepository.findByPartNumber).toHaveBeenCalledTimes(1);
    });

    it("should return null when part is not found", async () => {
      mockPartRepository.findByPartNumber.mockResolvedValue(null);

      const result = await getPartByPartNumberUseCase.execute("NON-EXISTENT");

      expect(result).toBeNull();
      expect(mockPartRepository.findByPartNumber).toHaveBeenCalledWith(
        "NON-EXISTENT"
      );
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database error");
      mockPartRepository.findByPartNumber.mockRejectedValue(error);

      await expect(
        getPartByPartNumberUseCase.execute(partNumber)
      ).rejects.toThrow("Database error");
    });

    it("should handle different part number formats", async () => {
      const formats = ["ABC-123", "XYZ789", "PART-001-A"];

      for (const format of formats) {
        const part = new Part({
          id: format,
          name: "Test Part",
          partNumber: format,
          brand: "TestBrand",
          price: 10.0,
          stockQuantity: 1,
        });

        mockPartRepository.findByPartNumber.mockResolvedValue(part);

        const result = await getPartByPartNumberUseCase.execute(format);

        expect(result).toEqual(part);
        expect(mockPartRepository.findByPartNumber).toHaveBeenCalledWith(
          format
        );
      }
    });
  });
});
