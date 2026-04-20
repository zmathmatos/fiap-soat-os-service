import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetAllServiceOrdersUseCase } from "../../../../../src/application/use-cases/service-order/methods/GetAllServiceOrdersUseCase";
import type { IServiceOrderRepository } from "../../../../../src/domain/repositories/IServiceOrderRepository";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../../../src/domain/entities/ServiceOrder";

describe("GetAllServiceOrdersUseCase", () => {
  let getAllServiceOrdersUseCase: GetAllServiceOrdersUseCase;
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

    getAllServiceOrdersUseCase = new GetAllServiceOrdersUseCase(
      mockServiceOrderRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const mockServiceOrders = [
      new ServiceOrder({
        id: "so-123",
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

    it("should return all service orders", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue(mockServiceOrders);

      const result = await getAllServiceOrdersUseCase.execute();

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ServiceOrder);
      expect(result[1]).toBeInstanceOf(ServiceOrder);
    });

    it("should return empty array when no service orders exist", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue([]);

      const result = await getAllServiceOrdersUseCase.execute();

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should return service orders with correct status", async () => {
      const completedOrders = [
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
          status: ServiceOrderStatus.completed,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      mockServiceOrderRepository.findAll.mockResolvedValue(completedOrders);

      const result = await getAllServiceOrdersUseCase.execute();

      expect(result[0].status).toBe(ServiceOrderStatus.completed);
    });

    it("should return all service orders with complete data", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue(mockServiceOrders);

      const result = await getAllServiceOrdersUseCase.execute();

      expect(result).toHaveLength(2);
      expect(result[0].user.name).toBe("John Doe");
      expect(result[0].vehicle.licensePlate).toBe("ABC-1234");
      expect(result[1].user.name).toBe("Jane Smith");
      expect(result[1].vehicle.licensePlate).toBe("XYZ-5678");
    });

    it("should call findAll without arguments when includeFinished is not provided", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue([]);

      await getAllServiceOrdersUseCase.execute();

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it("should pass includeFinished=false to repository", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue([]);

      await getAllServiceOrdersUseCase.execute(false);

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(false, undefined);
    });

    it("should pass includeFinished=true to repository", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue(mockServiceOrders);

      await getAllServiceOrdersUseCase.execute(true);

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(true, undefined);
    });

    it("should call findAll without orderByStatus when it is not provided", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue([]);

      await getAllServiceOrdersUseCase.execute();

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it("should pass orderByStatus=false to repository", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue(mockServiceOrders);

      await getAllServiceOrdersUseCase.execute(undefined, false);

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(undefined, false);
    });

    it("should pass orderByStatus=true to repository", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue(mockServiceOrders);

      await getAllServiceOrdersUseCase.execute(undefined, true);

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(undefined, true);
    });

    it("should pass both includeFinished and orderByStatus to repository", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue(mockServiceOrders);

      await getAllServiceOrdersUseCase.execute(true, true);

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(true, true);
    });

    it("should return service orders ordered by status when orderByStatus=true", async () => {
      const orderedByStatus = [
        new ServiceOrder({
          id: "so-125",
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
          services: [],
          serviceOrderNumber: 3,
          status: ServiceOrderStatus.received,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new ServiceOrder({
          id: "so-126",
          user: {
            id: "user-124",
            name: "Jane Smith",
            document: "98765432100",
            email: "user2@email.com",
            password: "user2_password",
            role: "customer",
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
          services: [],
          serviceOrderNumber: 4,
          status: ServiceOrderStatus.inExecution,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      mockServiceOrderRepository.findAll.mockResolvedValue(orderedByStatus);

      const result = await getAllServiceOrdersUseCase.execute(undefined, true);

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(undefined, true);
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(ServiceOrderStatus.received);
      expect(result[1].status).toBe(ServiceOrderStatus.inExecution);
    });
  });
});
