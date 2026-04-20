import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { GetAverageServiceTimeUseCase } from "../../../../../src/application/use-cases/service-order/methods/GetAverageServiceTimeUseCase";
import type { IServiceOrderRepository, AverageServiceTimeResult } from "../../../../../src/domain/repositories/IServiceOrderRepository";

describe("GetAverageServiceTimeUseCase", () => {
  let getAverageServiceTimeUseCase: GetAverageServiceTimeUseCase;
  let mockServiceOrderRepository: jest.Mocked<IServiceOrderRepository>;

  beforeEach(() => {
    mockServiceOrderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByServiceOrderNumber: jest.fn(),
      findByUserId: jest.fn(),
      findByVehicleId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      generateServiceOrderNumber: jest.fn(),
      getAverageServiceTime: jest.fn(),
    };

    getAverageServiceTimeUseCase = new GetAverageServiceTimeUseCase(
      mockServiceOrderRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return average service time with correct properties", async () => {
      const mockResult: AverageServiceTimeResult = {
        averageTimeInHours: 3.5,
        completedOrders: 10,
        totalOrders: 15,
      };

      mockServiceOrderRepository.getAverageServiceTime.mockResolvedValue(mockResult);

      const result = await getAverageServiceTimeUseCase.execute();

      expect(result).toEqual(mockResult);
      expect(result.averageTimeInHours).toBe(3.5);
      expect(result.completedOrders).toBe(10);
      expect(result.totalOrders).toBe(15);
      expect(mockServiceOrderRepository.getAverageServiceTime).toHaveBeenCalledTimes(1);
    });

    it("should return zero average when no completed orders exist", async () => {
      const mockResult: AverageServiceTimeResult = {
        averageTimeInHours: 0,
        completedOrders: 0,
        totalOrders: 0,
      };

      mockServiceOrderRepository.getAverageServiceTime.mockResolvedValue(mockResult);

      const result = await getAverageServiceTimeUseCase.execute();

      expect(result.averageTimeInHours).toBe(0);
      expect(result.completedOrders).toBe(0);
      expect(result.totalOrders).toBe(0);
      expect(mockServiceOrderRepository.getAverageServiceTime).toHaveBeenCalledTimes(1);
    });

    it("should have correct decimal precision for average time", async () => {
      const mockResult: AverageServiceTimeResult = {
        averageTimeInHours: 2.75,
        completedOrders: 4,
        totalOrders: 8,
      };

      mockServiceOrderRepository.getAverageServiceTime.mockResolvedValue(mockResult);

      const result = await getAverageServiceTimeUseCase.execute();

      expect(result.averageTimeInHours).toBeCloseTo(2.75, 2);
      expect(result.completedOrders).toBe(4);
      expect(result.totalOrders).toBe(8);
      expect(mockServiceOrderRepository.getAverageServiceTime).toHaveBeenCalledTimes(1);
    });

    it("should handle large average time values", async () => {
      const mockResult: AverageServiceTimeResult = {
        averageTimeInHours: 8.5,
        completedOrders: 20,
        totalOrders: 25,
      };

      mockServiceOrderRepository.getAverageServiceTime.mockResolvedValue(mockResult);

      const result = await getAverageServiceTimeUseCase.execute();

      expect(result.averageTimeInHours).toBe(8.5);
      expect(result.completedOrders).toBe(20);
      expect(result.totalOrders).toBe(25);
      expect(mockServiceOrderRepository.getAverageServiceTime).toHaveBeenCalledTimes(1);
    });

    it("should call repository getAverageServiceTime method", async () => {
      const mockResult: AverageServiceTimeResult = {
        averageTimeInHours: 4.2,
        completedOrders: 5,
        totalOrders: 10,
      };

      mockServiceOrderRepository.getAverageServiceTime.mockResolvedValue(mockResult);

      await getAverageServiceTimeUseCase.execute();

      expect(mockServiceOrderRepository.getAverageServiceTime).toHaveBeenCalledTimes(1);
      expect(mockServiceOrderRepository.getAverageServiceTime).toHaveBeenCalledWith();
    });

    it("should return same result on multiple calls", async () => {
      const mockResult: AverageServiceTimeResult = {
        averageTimeInHours: 3.0,
        completedOrders: 6,
        totalOrders: 12,
      };

      mockServiceOrderRepository.getAverageServiceTime.mockResolvedValue(mockResult);

      const result1 = await getAverageServiceTimeUseCase.execute();
      const result2 = await getAverageServiceTimeUseCase.execute();

      expect(result1).toEqual(result2);
      expect(mockServiceOrderRepository.getAverageServiceTime).toHaveBeenCalledTimes(2);
    });

    it("should handle minimum average time", async () => {
      const mockResult: AverageServiceTimeResult = {
        averageTimeInHours: 0.5,
        completedOrders: 1,
        totalOrders: 5,
      };

      mockServiceOrderRepository.getAverageServiceTime.mockResolvedValue(mockResult);

      const result = await getAverageServiceTimeUseCase.execute();

      expect(result.averageTimeInHours).toBe(0.5);
      expect(result.completedOrders).toBe(1);
    });
  });
});
