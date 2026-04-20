import { describe, it, expect, beforeEach } from "@jest/globals";
import { CreateServiceUseCase } from "../../../../../src/application/use-cases/service/methods/CreateServiceUseCase";
import type { IServiceRepository } from "../../../../../src/domain/repositories/IServiceRepository";
import { Service } from "../../../../../src/domain/entities/Service";

describe("CreateServiceUseCase", () => {
  let createServiceUseCase: CreateServiceUseCase;
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

    createServiceUseCase = new CreateServiceUseCase(mockServiceRepository);
  });

  describe("execute", () => {
    const validName = "Oil Change";
    const validServiceCode = "SRV-001";
    const validPrice = 99.99;

    it("should create a service with valid data", async () => {
      const mockService = new Service({
        id: "1",
        name: validName,
        serviceCode: validServiceCode,
        price: validPrice,
      });

      mockServiceRepository.findByServiceCode.mockResolvedValue(null);
      mockServiceRepository.create.mockResolvedValue(mockService);

      const result = await createServiceUseCase.execute(
        validName,
        validServiceCode,
        validPrice
      );

      expect(result).toEqual(mockService);
      expect(mockServiceRepository.findByServiceCode).toHaveBeenCalledWith(
        validServiceCode
      );
      expect(mockServiceRepository.create).toHaveBeenCalled();
    });

    it("should throw error when name is missing", async () => {
      await expect(
        createServiceUseCase.execute("", validServiceCode, validPrice)
      ).rejects.toThrow("All fields are required");
    });

    it("should throw error when serviceCode is missing", async () => {
      await expect(
        createServiceUseCase.execute(validName, "", validPrice)
      ).rejects.toThrow("All fields are required");
    });

    it("should throw error when price is undefined", async () => {
      await expect(
        createServiceUseCase.execute(
          validName,
          validServiceCode,
          undefined as any
        )
      ).rejects.toThrow("All fields are required");
    });

    it("should throw error when price is negative", async () => {
      await expect(
        createServiceUseCase.execute(validName, validServiceCode, -10)
      ).rejects.toThrow("Price cannot be negative");
    });

    it("should throw error when service code already exists", async () => {
      const existingService = new Service({
        id: "2",
        name: "Existing Service",
        serviceCode: validServiceCode,
        price: 50,
      });

      mockServiceRepository.findByServiceCode.mockResolvedValue(
        existingService
      );

      await expect(
        createServiceUseCase.execute(validName, validServiceCode, validPrice)
      ).rejects.toThrow("Service with this service code already exists");
    });

    it("should accept price as zero", async () => {
      const mockService = new Service({
        id: "1",
        name: validName,
        serviceCode: validServiceCode,
        price: 0,
      });

      mockServiceRepository.findByServiceCode.mockResolvedValue(null);
      mockServiceRepository.create.mockResolvedValue(mockService);

      const result = await createServiceUseCase.execute(
        validName,
        validServiceCode,
        0
      );

      expect(result).toEqual(mockService);
      expect(result.price).toBe(0);
    });
  });
});
