import { describe, it, expect, beforeEach } from "@jest/globals";
import { UpdateServiceUseCase } from "../../../../../src/application/use-cases/service/methods/UpdateServiceUseCase";
import type { IServiceRepository } from "../../../../../src/domain/repositories/IServiceRepository";
import { Service } from "../../../../../src/domain/entities/Service";

describe("UpdateServiceUseCase", () => {
  let updateServiceUseCase: UpdateServiceUseCase;
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

    updateServiceUseCase = new UpdateServiceUseCase(mockServiceRepository);
  });

  describe("execute", () => {
    const existingService = new Service({
      id: "1",
      name: "Oil Change",
      serviceCode: "SRV-001",
      price: 99.99,
    });

    it("should update a service with valid data", async () => {
      const updatedService = new Service({
        id: "1",
        name: "Premium Oil Change",
        serviceCode: "SRV-001",
        price: 129.99,
      });

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.findByServiceCode.mockResolvedValue(null);
      mockServiceRepository.update.mockResolvedValue(updatedService);

      const result = await updateServiceUseCase.execute("1", {
        name: "Premium Oil Change",
        price: 129.99,
      });

      expect(result).toEqual(updatedService);
      expect(mockServiceRepository.update).toHaveBeenCalledWith("1", {
        name: "Premium Oil Change",
        price: 129.99,
      });
    });

    it("should throw error when service ID is missing", async () => {
      await expect(
        updateServiceUseCase.execute("", { name: "New Name" })
      ).rejects.toThrow("Service ID is required");
    });

    it("should throw error when price is negative", async () => {
      mockServiceRepository.findById.mockResolvedValue(existingService);

      await expect(
        updateServiceUseCase.execute("1", { price: -10 })
      ).rejects.toThrow("Price cannot be negative");
    });

    it("should throw error when service is not found", async () => {
      mockServiceRepository.findById.mockResolvedValue(null);

      await expect(
        updateServiceUseCase.execute("999", { name: "New Name" })
      ).rejects.toThrow("Service not found");
    });

    it("should throw error when service code already exists for another service", async () => {
      const anotherService = new Service({
        id: "2",
        name: "Another Service",
        serviceCode: "SRV-002",
        price: 50,
      });

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.findByServiceCode.mockResolvedValue(anotherService);

      await expect(
        updateServiceUseCase.execute("1", { serviceCode: "SRV-002" })
      ).rejects.toThrow("Service with this service code already exists");
    });

    it("should allow updating to the same service code", async () => {
      const updatedService = new Service({
        id: "1",
        name: "Updated Service",
        serviceCode: "SRV-001",
        price: 99.99,
      });

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.findByServiceCode.mockResolvedValue(
        existingService
      );
      mockServiceRepository.update.mockResolvedValue(updatedService);

      const result = await updateServiceUseCase.execute("1", {
        name: "Updated Service",
        serviceCode: "SRV-001",
      });

      expect(result).toEqual(updatedService);
    });

    it("should accept price as zero", async () => {
      const updatedService = new Service({
        id: "1",
        name: "Free Service",
        serviceCode: "SRV-001",
        price: 0,
      });

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.update.mockResolvedValue(updatedService);

      const result = await updateServiceUseCase.execute("1", {
        name: "Free Service",
        price: 0,
      });

      expect(result).toEqual(updatedService);
      expect(result?.price).toBe(0);
    });

    it("should return null when update operation fails", async () => {
      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.update.mockResolvedValue(null);

      const result = await updateServiceUseCase.execute("1", {
        name: "Updated Name",
      });

      expect(result).toBeNull();
    });
  });
});
