import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetServiceOrderByIdUseCase } from "../../../../../src/application/use-cases/service-order/methods/GetServiceOrderByIdUseCase";
import type { IServiceOrderRepository } from "../../../../../src/domain/repositories/IServiceOrderRepository";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../../../src/domain/entities/ServiceOrder";

describe("GetServiceOrderByIdUseCase", () => {
  let getServiceOrderByIdUseCase: GetServiceOrderByIdUseCase;
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

    getServiceOrderByIdUseCase = new GetServiceOrderByIdUseCase(
      mockServiceOrderRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const serviceOrderId = "so-123";
    const mockServiceOrder = new ServiceOrder({
      id: serviceOrderId,
      user: {
        id: "user-123",
        name: "John Doe",
        document: "12345678900",
        email: "user1@email.com",
        password: "user1_password",
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      vehicle: {
        id: "vehicle-456",
        licensePlate: "ABC-1234",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      parts: [],
      services: [
        {
          id: "service-789",
          name: "Oil Change",
          serviceCode: "OC-001",
          price: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      serviceOrderNumber: 1,
      status: ServiceOrderStatus.received,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it("should get a service order by id", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(mockServiceOrder);

      const result = await getServiceOrderByIdUseCase.execute(serviceOrderId);

      expect(mockServiceOrderRepository.findById).toHaveBeenCalledWith(
        serviceOrderId,
      );
      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result?.id).toBe(serviceOrderId);
    });

    it("should return null when service order does not exist", async () => {
      const nonExistentId = "non-existent-id";

      mockServiceOrderRepository.findById.mockResolvedValue(null);

      const result = await getServiceOrderByIdUseCase.execute(nonExistentId);

      expect(mockServiceOrderRepository.findById).toHaveBeenCalledWith(
        nonExistentId,
      );
      expect(result).toBeNull();
    });

    it("should return service order with all data", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(mockServiceOrder);

      const result = await getServiceOrderByIdUseCase.execute(serviceOrderId);

      expect(result?.id).toBe(serviceOrderId);
      expect(result?.serviceOrderNumber).toBe(1);
      expect(result?.status).toBe(ServiceOrderStatus.received);
      expect(result?.user.name).toBe("John Doe");
      expect(result?.vehicle.licensePlate).toBe("ABC-1234");
    });

    it("should return service order with services and parts data", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(mockServiceOrder);

      const result = await getServiceOrderByIdUseCase.execute(serviceOrderId);

      expect(result?.services).toHaveLength(1);
      expect(result?.services[0].name).toBe("Oil Change");
      expect(result?.parts).toHaveLength(0);
    });
  });
});
