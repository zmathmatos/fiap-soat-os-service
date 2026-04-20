import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetServiceOrdersByVehicleIdUseCase } from "../../../../../src/application/use-cases/service-order/methods/GetServiceOrdersByVehicleIdUseCase";
import type { IServiceOrderRepository } from "../../../../../src/domain/repositories/IServiceOrderRepository";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../../../src/domain/entities/ServiceOrder";

describe("GetServiceOrdersByVehicleIdUseCase", () => {
  let getServiceOrdersByVehicleIdUseCase: GetServiceOrdersByVehicleIdUseCase;
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

    getServiceOrdersByVehicleIdUseCase = new GetServiceOrdersByVehicleIdUseCase(
      mockServiceOrderRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const vehicleId = "vehicle-456";
    const mockServiceOrders = [
      new ServiceOrder({
        id: "so-123",
        user: {
          id: "user-123",
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: vehicleId,
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
          id: "user-124",
          name: "Jane Smith",
          document: "98765432100",
          role: "customer",
          email: "user2@email.com",
          password: "user2_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: vehicleId,
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

    it("should get all service orders for a vehicle", async () => {
      mockServiceOrderRepository.findByVehicleId.mockResolvedValue(
        mockServiceOrders,
      );

      const result =
        await getServiceOrdersByVehicleIdUseCase.execute(vehicleId);

      expect(mockServiceOrderRepository.findByVehicleId).toHaveBeenCalledWith(
        vehicleId,
      );
      expect(result).toHaveLength(2);
      expect(result.every((so) => so.vehicle.id === vehicleId)).toBe(true);
    });

    it("should return empty array when vehicle has no service orders", async () => {
      const vehicleWithNoOrders = "vehicle-with-no-orders";

      mockServiceOrderRepository.findByVehicleId.mockResolvedValue([]);

      const result =
        await getServiceOrdersByVehicleIdUseCase.execute(vehicleWithNoOrders);

      expect(mockServiceOrderRepository.findByVehicleId).toHaveBeenCalledWith(
        vehicleWithNoOrders,
      );
      expect(result).toEqual([]);
    });

    it("should return service orders for a specific vehicle only", async () => {
      mockServiceOrderRepository.findByVehicleId.mockResolvedValue([
        mockServiceOrders[0],
      ]);

      const result =
        await getServiceOrdersByVehicleIdUseCase.execute(vehicleId);

      expect(result).toHaveLength(1);
      expect(result[0].vehicle.id).toBe(vehicleId);
    });

    it("should return complete service order data for vehicle", async () => {
      mockServiceOrderRepository.findByVehicleId.mockResolvedValue(
        mockServiceOrders,
      );

      const result =
        await getServiceOrdersByVehicleIdUseCase.execute(vehicleId);

      expect(result).toHaveLength(2);
      expect(result[0].user.name).toBe("John Doe");
      expect(result[1].user.name).toBe("Jane Smith");
      expect(result[0].vehicle.licensePlate).toBe("ABC-1234");
      expect(result[0].status).toBe(ServiceOrderStatus.received);
      expect(result[1].status).toBe(ServiceOrderStatus.inExecution);
    });
  });
});
