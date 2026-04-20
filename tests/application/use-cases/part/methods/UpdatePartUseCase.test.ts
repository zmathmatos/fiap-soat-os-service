import { describe, it, expect, beforeEach } from "@jest/globals";
import { UpdatePartUseCase } from "../../../../../src/application/use-cases/part/methods/UpdatePartUseCase";
import type { IPartRepository } from "../../../../../src/domain/repositories/IPartRepository";
import { Part } from "../../../../../src/domain/entities/Part";

describe("UpdatePartUseCase", () => {
  let updatePartUseCase: UpdatePartUseCase;
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

    updatePartUseCase = new UpdatePartUseCase(mockPartRepository);
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

    it("should update part name successfully", async () => {
      const updatedPart = new Part({
        id: partId,
        name: "Premium Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 49.99,
        stockQuantity: 100,
      });

      mockPartRepository.findById.mockResolvedValue(existingPart);
      mockPartRepository.update.mockResolvedValue(updatedPart);

      const result = await updatePartUseCase.execute(partId, {
        name: "Premium Engine Oil Filter",
      });

      expect(result).toEqual(updatedPart);
      expect(mockPartRepository.findById).toHaveBeenCalledWith(partId);
      expect(mockPartRepository.update).toHaveBeenCalledWith(partId, {
        name: "Premium Engine Oil Filter",
      });
    });

    it("should update part brand successfully", async () => {
      const updatedPart = new Part({
        id: partId,
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Mann",
        price: 49.99,
        stockQuantity: 100,
      });

      mockPartRepository.findById.mockResolvedValue(existingPart);
      mockPartRepository.update.mockResolvedValue(updatedPart);

      const result = await updatePartUseCase.execute(partId, {
        brand: "Mann",
      });

      expect(result).toEqual(updatedPart);
      expect(mockPartRepository.update).toHaveBeenCalled();
    });

    it("should update part price successfully", async () => {
      const updatedPart = new Part({
        id: partId,
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 59.99,
        stockQuantity: 100,
      });

      mockPartRepository.findById.mockResolvedValue(existingPart);
      mockPartRepository.update.mockResolvedValue(updatedPart);

      const result = await updatePartUseCase.execute(partId, {
        price: 59.99,
      });

      expect(result).toEqual(updatedPart);
    });

    it("should update part stock quantity successfully", async () => {
      const updatedPart = new Part({
        id: partId,
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 49.99,
        stockQuantity: 150,
      });

      mockPartRepository.findById.mockResolvedValue(existingPart);
      mockPartRepository.update.mockResolvedValue(updatedPart);

      const result = await updatePartUseCase.execute(partId, {
        stockQuantity: 150,
      });

      expect(result).toEqual(updatedPart);
    });

    it("should return null when part does not exist", async () => {
      mockPartRepository.findById.mockResolvedValue(null);

      const result = await updatePartUseCase.execute(partId, {
        name: "New Name",
      });

      expect(result).toBeNull();
      expect(mockPartRepository.update).not.toHaveBeenCalled();
    });

    it("should update multiple fields at once", async () => {
      const updatedPart = new Part({
        id: partId,
        name: "Premium Oil Filter",
        partNumber: "EOL-123456",
        brand: "Mann",
        price: 69.99,
        stockQuantity: 200,
      });

      mockPartRepository.findById.mockResolvedValue(existingPart);
      mockPartRepository.update.mockResolvedValue(updatedPart);

      const result = await updatePartUseCase.execute(partId, {
        name: "Premium Oil Filter",
        brand: "Mann",
        price: 69.99,
        stockQuantity: 200,
      });

      expect(result).toEqual(updatedPart);
      expect(mockPartRepository.update).toHaveBeenCalledWith(partId, {
        name: "Premium Oil Filter",
        brand: "Mann",
        price: 69.99,
        stockQuantity: 200,
      });
    });

    it("should handle repository errors during update", async () => {
      mockPartRepository.findById.mockResolvedValue(existingPart);
      const error = new Error("Database error");
      mockPartRepository.update.mockRejectedValue(error);

      await expect(
        updatePartUseCase.execute(partId, { price: 99.99 })
      ).rejects.toThrow("Database error");
    });

    it("should allow updating price to zero", async () => {
      const updatedPart = new Part({
        id: partId,
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 0,
        stockQuantity: 100,
      });

      mockPartRepository.findById.mockResolvedValue(existingPart);
      mockPartRepository.update.mockResolvedValue(updatedPart);

      const result = await updatePartUseCase.execute(partId, {
        price: 0,
      });

      expect(result).toEqual(updatedPart);
    });

    it("should allow updating stock quantity to zero", async () => {
      const updatedPart = new Part({
        id: partId,
        name: "Engine Oil Filter",
        partNumber: "EOL-123456",
        brand: "Bosch",
        price: 49.99,
        stockQuantity: 0,
      });

      mockPartRepository.findById.mockResolvedValue(existingPart);
      mockPartRepository.update.mockResolvedValue(updatedPart);

      const result = await updatePartUseCase.execute(partId, {
        stockQuantity: 0,
      });

      expect(result).toEqual(updatedPart);
    });
  });
});
