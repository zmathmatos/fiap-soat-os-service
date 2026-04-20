import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetServiceOrderByServiceOrderNumberUseCase } from "../../../../../src/application/use-cases/service-order/methods/GetServiceOrderByServiceOrderNumberUseCase";
import type { IServiceOrderRepository } from "../../../../../src/domain/repositories/IServiceOrderRepository";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../../../src/domain/entities/ServiceOrder";

describe("GetServiceOrderByServiceOrderNumberUseCase", () => {
  let getServiceOrderByServiceOrderNumberUseCase: GetServiceOrderByServiceOrderNumberUseCase;
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

    getServiceOrderByServiceOrderNumberUseCase =
      new GetServiceOrderByServiceOrderNumberUseCase(
        mockServiceOrderRepository,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const mockServiceOrder = new ServiceOrder({
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
      status: ServiceOrderStatus.received,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it("should get a service order by service order number", async () => {
      const serviceOrderNumber = 1;

      mockServiceOrderRepository.findByServiceOrderNumber.mockResolvedValue(
        mockServiceOrder,
      );

      const result =
        await getServiceOrderByServiceOrderNumberUseCase.execute(
          serviceOrderNumber,
        );

      expect(
        mockServiceOrderRepository.findByServiceOrderNumber,
      ).toHaveBeenCalledWith(serviceOrderNumber);
      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result?.serviceOrderNumber).toBe(serviceOrderNumber);
    });

    it("should return null when service order number does not exist", async () => {
      const serviceOrderNumber = 999;

      mockServiceOrderRepository.findByServiceOrderNumber.mockResolvedValue(
        null,
      );

      const result =
        await getServiceOrderByServiceOrderNumberUseCase.execute(
          serviceOrderNumber,
        );

      expect(
        mockServiceOrderRepository.findByServiceOrderNumber,
      ).toHaveBeenCalledWith(serviceOrderNumber);
      expect(result).toBeNull();
    });

    it("should return service order with correct order number and status", async () => {
      const serviceOrderNumber = 5;
      const mockServiceOrderWithNumber = new ServiceOrder({
        id: "so-456",
        user: {
          id: "user-456",
          name: "Jane Smith",
          document: "98765432100",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: "vehicle-789",
          licensePlate: "XYZ-5678",
          brand: "Honda",
          model: "Civic",
          year: 2021,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        parts: [],
        services: [],
        serviceOrderNumber,
        status: ServiceOrderStatus.inExecution,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockServiceOrderRepository.findByServiceOrderNumber.mockResolvedValue(
        mockServiceOrderWithNumber,
      );

      const result =
        await getServiceOrderByServiceOrderNumberUseCase.execute(
          serviceOrderNumber,
        );

      expect(result?.serviceOrderNumber).toBe(5);
      expect(result?.status).toBe(ServiceOrderStatus.inExecution);
    });

    it("should return complete service order data", async () => {
      const serviceOrderNumber = 1;

      mockServiceOrderRepository.findByServiceOrderNumber.mockResolvedValue(
        mockServiceOrder,
      );

      const result =
        await getServiceOrderByServiceOrderNumberUseCase.execute(
          serviceOrderNumber,
        );

      expect(result?.id).toBe("so-123");
      expect(result?.user.name).toBe("John Doe");
      expect(result?.vehicle.licensePlate).toBe("ABC-1234");
      expect(result?.services).toHaveLength(1);
    });
  });
});
