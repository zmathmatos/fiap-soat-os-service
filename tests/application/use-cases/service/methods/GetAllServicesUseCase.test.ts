import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetAllServicesUseCase } from "../../../../../src/application/use-cases/service/methods/GetAllServicesUseCase";
import type { IServiceRepository } from "../../../../../src/domain/repositories/IServiceRepository";
import { Service } from "../../../../../src/domain/entities/Service";

describe("GetAllServicesUseCase", () => {
  let getAllServicesUseCase: GetAllServicesUseCase;
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

    getAllServicesUseCase = new GetAllServicesUseCase(mockServiceRepository);
  });

  describe("execute", () => {
    it("should return all services", async () => {
      const mockServices = [
        new Service({
          id: "1",
          name: "Oil Change",
          serviceCode: "SRV-001",
          price: 99.99,
        }),
        new Service({
          id: "2",
          name: "Tire Rotation",
          serviceCode: "SRV-002",
          price: 49.99,
        }),
      ];

      mockServiceRepository.findAll.mockResolvedValue(mockServices);

      const result = await getAllServicesUseCase.execute();

      expect(result).toEqual(mockServices);
      expect(result.length).toBe(2);
      expect(mockServiceRepository.findAll).toHaveBeenCalled();
    });

    it("should return an empty array when no services exist", async () => {
      mockServiceRepository.findAll.mockResolvedValue([]);

      const result = await getAllServicesUseCase.execute();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});
