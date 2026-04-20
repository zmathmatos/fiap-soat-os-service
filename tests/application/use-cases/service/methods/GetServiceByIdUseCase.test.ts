import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetServiceByIdUseCase } from "../../../../../src/application/use-cases/service/methods/GetServiceByIdUseCase";
import type { IServiceRepository } from "../../../../../src/domain/repositories/IServiceRepository";
import { Service } from "../../../../../src/domain/entities/Service";

describe("GetServiceByIdUseCase", () => {
  let getServiceByIdUseCase: GetServiceByIdUseCase;
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

    getServiceByIdUseCase = new GetServiceByIdUseCase(mockServiceRepository);
  });

  describe("execute", () => {
    it("should return a service when found by id", async () => {
      const mockService = new Service({
        id: "1",
        name: "Oil Change",
        serviceCode: "SRV-001",
        price: 99.99,
      });

      mockServiceRepository.findById.mockResolvedValue(mockService);

      const result = await getServiceByIdUseCase.execute("1");

      expect(result).toEqual(mockService);
      expect(mockServiceRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should return null when service is not found", async () => {
      mockServiceRepository.findById.mockResolvedValue(null);

      const result = await getServiceByIdUseCase.execute("999");

      expect(result).toBeNull();
      expect(mockServiceRepository.findById).toHaveBeenCalledWith("999");
    });

    it("should throw error when service ID is missing", async () => {
      await expect(getServiceByIdUseCase.execute("")).rejects.toThrow(
        "Service ID is required"
      );
    });
  });
});
