import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetPartByIdUseCase } from "../../../../../src/application/use-cases/part/methods/GetPartByIdUseCase";
import type { IPartRepository } from "../../../../../src/domain/repositories/IPartRepository";
import { Part } from "../../../../../src/domain/entities/Part";

describe("GetPartByIdUseCase", () => {
  let getPartByIdUseCase: GetPartByIdUseCase;
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

    getPartByIdUseCase = new GetPartByIdUseCase(mockPartRepository);
  });

  describe("execute", () => {
    const partId = "1";
    const mockPart = new Part({
      id: partId,
      name: "Engine Oil Filter",
      partNumber: "EOL-123456",
      brand: "Bosch",
      price: 49.99,
      stockQuantity: 100,
    });

    it("should return part when found by id", async () => {
      mockPartRepository.findById.mockResolvedValue(mockPart);

      const result = await getPartByIdUseCase.execute(partId);

      expect(result).toEqual(mockPart);
      expect(mockPartRepository.findById).toHaveBeenCalledWith(partId);
      expect(mockPartRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should return null when part is not found", async () => {
      mockPartRepository.findById.mockResolvedValue(null);

      const result = await getPartByIdUseCase.execute("non-existent-id");

      expect(result).toBeNull();
      expect(mockPartRepository.findById).toHaveBeenCalledWith(
        "non-existent-id"
      );
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database error");
      mockPartRepository.findById.mockRejectedValue(error);

      await expect(getPartByIdUseCase.execute(partId)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
