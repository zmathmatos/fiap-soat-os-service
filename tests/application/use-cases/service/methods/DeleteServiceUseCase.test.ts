import { describe, it, expect, beforeEach } from "@jest/globals";
import { DeleteServiceUseCase } from "../../../../../src/application/use-cases/service/methods/DeleteServiceUseCase";
import type { IServiceRepository } from "../../../../../src/domain/repositories/IServiceRepository";
import { Service } from "../../../../../src/domain/entities/Service";

describe("DeleteServiceUseCase", () => {
  let deleteServiceUseCase: DeleteServiceUseCase;
  let mockServiceRepository: jest.Mocked<IServiceRepository>;

  beforeEach(() => {
    mockServiceRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByServiceCode: jest.fn(),
      findByServiceCodes: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    deleteServiceUseCase = new DeleteServiceUseCase(mockServiceRepository);
  });

  describe("execute", () => {
    it("should delete a service when it exists", async () => {
      const mockService = new Service({
        id: "1",
        name: "Oil Change",
        serviceCode: "SRV-001",
        price: 99.99,
      });

      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockServiceRepository.delete.mockResolvedValue(true);

      const result = await deleteServiceUseCase.execute("1");

      expect(result).toBe(true);
      expect(mockServiceRepository.findById).toHaveBeenCalledWith("1");
      expect(mockServiceRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should throw error when service ID is missing", async () => {
      await expect(deleteServiceUseCase.execute("")).rejects.toThrow(
        "Service ID is required"
      );
    });

    it("should throw error when service is not found", async () => {
      mockServiceRepository.findById.mockResolvedValue(null);

      await expect(deleteServiceUseCase.execute("999")).rejects.toThrow(
        "Service not found"
      );
    });

    it("should return false when delete operation fails", async () => {
      const mockService = new Service({
        id: "1",
        name: "Oil Change",
        serviceCode: "SRV-001",
        price: 99.99,
      });

      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockServiceRepository.delete.mockResolvedValue(false);

      const result = await deleteServiceUseCase.execute("1");

      expect(result).toBe(false);
    });
  });
});
