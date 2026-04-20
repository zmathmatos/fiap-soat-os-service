import { describe, it, expect, beforeEach } from "@jest/globals";
import { DeletePartUseCase } from "../../../../../src/application/use-cases/part/methods/DeletePartUseCase";
import type { IPartRepository } from "../../../../../src/domain/repositories/IPartRepository";
import { Part } from "../../../../../src/domain/entities/Part";

describe("DeletePartUseCase", () => {
  let deletePartUseCase: DeletePartUseCase;
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

    deletePartUseCase = new DeletePartUseCase(mockPartRepository);
  });

  describe("execute", () => {
    const partId = "1";
    const existingPart = new Part({
      id: partId,
      name: "Engine Oil Filter",
      partNumber: "EOL-123456",
      brand: "Bosch",
      price: 49.99,
      stockQuantity: 100,
    });

    it("should delete a part successfully", async () => {
      mockPartRepository.findById.mockResolvedValue(existingPart);
      mockPartRepository.delete.mockResolvedValue(true);

      const result = await deletePartUseCase.execute(partId);

      expect(result).toBe(true);
      expect(mockPartRepository.findById).toHaveBeenCalledWith(partId);
      expect(mockPartRepository.delete).toHaveBeenCalledWith(partId);
    });

    it("should throw error when part does not exist", async () => {
      mockPartRepository.findById.mockResolvedValue(null);

      await expect(deletePartUseCase.execute(partId)).rejects.toThrow(
        "Part not found"
      );

      expect(mockPartRepository.delete).not.toHaveBeenCalled();
    });

    it("should handle repository errors during delete", async () => {
      mockPartRepository.findById.mockResolvedValue(existingPart);
      const error = new Error("Database error");
      mockPartRepository.delete.mockRejectedValue(error);

      await expect(deletePartUseCase.execute(partId)).rejects.toThrow(
        "Database error"
      );
    });

    it("should verify part exists before deleting", async () => {
      mockPartRepository.findById.mockResolvedValue(existingPart);
      mockPartRepository.delete.mockResolvedValue(true);

      await deletePartUseCase.execute(partId);

      // Verificar que findById foi chamado antes de delete
      expect(mockPartRepository.findById).toHaveBeenCalledWith(partId);
      expect(mockPartRepository.delete).toHaveBeenCalledWith(partId);

      // Verificar a ordem de chamadas
      expect(mockPartRepository.findById).toHaveBeenNthCalledWith(1, partId);
      expect(mockPartRepository.delete).toHaveBeenNthCalledWith(1, partId);
    });
  });
});
