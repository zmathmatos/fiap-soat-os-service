import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetServiceOrdersByUserIdUseCase } from "../../../../../src/application/use-cases/service-order/methods/GetServiceOrdersByUserIdUseCase";
import type { IServiceOrderRepository } from "../../../../../src/domain/repositories/IServiceOrderRepository";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../../../src/domain/entities/ServiceOrder";

describe("GetServiceOrdersByUserIdUseCase", () => {
  let getServiceOrdersByUserIdUseCase: GetServiceOrdersByUserIdUseCase;
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

    getServiceOrdersByUserIdUseCase = new GetServiceOrdersByUserIdUseCase(
      mockServiceOrderRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const userId = "user-123";
    const mockServiceOrders = [
      new ServiceOrder({
        id: "so-123",
        user: {
          id: userId,
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
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
      }),
      new ServiceOrder({
        id: "so-124",
        user: {
          id: userId,
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user2@email.com",
          password: "user2_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: "vehicle-457",
          licensePlate: "XYZ-5678",
          brand: "Honda",
          model: "Civic",
          year: 2021,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        parts: [],
        services: [
          {
            id: "service-790",
            name: "Tire Rotation",
            serviceCode: "TR-001",
            price: 75,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        serviceOrderNumber: 2,
        status: ServiceOrderStatus.inExecution,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];

    it("should get all service orders for a user", async () => {
      mockServiceOrderRepository.findByUserId.mockResolvedValue(
        mockServiceOrders,
      );

      const result = await getServiceOrdersByUserIdUseCase.execute(userId);

      expect(mockServiceOrderRepository.findByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toHaveLength(2);
      expect(result.every((so) => so.user.id === userId)).toBe(true);
    });

    it("should return empty array when user has no service orders", async () => {
      const userWithNoOrders = "user-with-no-orders";

      mockServiceOrderRepository.findByUserId.mockResolvedValue([]);

      const result =
        await getServiceOrdersByUserIdUseCase.execute(userWithNoOrders);

      expect(mockServiceOrderRepository.findByUserId).toHaveBeenCalledWith(
        userWithNoOrders,
      );
      expect(result).toEqual([]);
    });

    it("should return service orders with different statuses", async () => {
      mockServiceOrderRepository.findByUserId.mockResolvedValue(
        mockServiceOrders,
      );

      const result = await getServiceOrdersByUserIdUseCase.execute(userId);

      expect(result[0].status).toBe(ServiceOrderStatus.received);
      expect(result[1].status).toBe(ServiceOrderStatus.inExecution);
    });

    it("should return complete service order data for user", async () => {
      mockServiceOrderRepository.findByUserId.mockResolvedValue(
        mockServiceOrders,
      );

      const result = await getServiceOrdersByUserIdUseCase.execute(userId);

      expect(result).toHaveLength(2);
      expect(result[0].user.name).toBe("John Doe");
      expect(result[0].vehicle.licensePlate).toBe("ABC-1234");
      expect(result[1].vehicle.licensePlate).toBe("XYZ-5678");
      expect(result[0].services).toHaveLength(1);
    });
  });
});
