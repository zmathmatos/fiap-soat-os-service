import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetServiceByServiceCodeUseCase } from "../../../../../src/application/use-cases/service/methods/GetServiceByServiceCodeUseCase";
import type { IServiceRepository } from "../../../../../src/domain/repositories/IServiceRepository";
import { Service } from "../../../../../src/domain/entities/Service";

describe("GetServiceByServiceCodeUseCase", () => {
  let getServiceByServiceCodeUseCase: GetServiceByServiceCodeUseCase;
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

    getServiceByServiceCodeUseCase = new GetServiceByServiceCodeUseCase(
      mockServiceRepository
    );
  });

  describe("execute", () => {
    it("should return a service when found by service code", async () => {
      const mockService = new Service({
        id: "1",
        name: "Oil Change",
        serviceCode: "SRV-001",
        price: 99.99,
      });

      mockServiceRepository.findByServiceCode.mockResolvedValue(mockService);

      const result = await getServiceByServiceCodeUseCase.execute("SRV-001");

      expect(result).toEqual(mockService);
      expect(mockServiceRepository.findByServiceCode).toHaveBeenCalledWith(
        "SRV-001"
      );
    });

    it("should return null when service is not found", async () => {
      mockServiceRepository.findByServiceCode.mockResolvedValue(null);

      const result = await getServiceByServiceCodeUseCase.execute("SRV-999");

      expect(result).toBeNull();
      expect(mockServiceRepository.findByServiceCode).toHaveBeenCalledWith(
        "SRV-999"
      );
    });

    it("should throw error when service code is missing", async () => {
      await expect(getServiceByServiceCodeUseCase.execute("")).rejects.toThrow(
        "Service code is required"
      );
    });
  });
});
