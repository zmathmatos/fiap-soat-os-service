import { describe, it, expect, beforeEach } from "@jest/globals";
import { UpdateServiceOrderUseCase } from "../../../../../src/application/use-cases/service-order/methods/UpdateServiceOrderUseCase";
import type { IServiceOrderRepository } from "../../../../../src/domain/repositories/IServiceOrderRepository";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../../../src/domain/entities/ServiceOrder";

describe("UpdateServiceOrderUseCase", () => {
  let updateServiceOrderUseCase: UpdateServiceOrderUseCase;
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

    updateServiceOrderUseCase = new UpdateServiceOrderUseCase(
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
      serviceOrderNumber: 1,
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
      parts: [
        {
          id: "part-1",
          name: "Engine Oil",
          partNumber: "ENG-001",
          brand: "BrandA",
          stockQuantity: 100,
          price: 50,
          serviceQuantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
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
      status: ServiceOrderStatus.received,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = "user-123";
    const vehicleId = "vehicle-456";
    const partsQuantities = [{partId: "part-1", quantity: 1}];
    const serviceIds = ["service-789"];

    it("should update a service order to inExecution status", async () => {
      const updatedServiceOrder = new ServiceOrder({
        ...mockServiceOrder,
        status: ServiceOrderStatus.inExecution,
        updatedAt: new Date(),
      });

      mockServiceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
      mockServiceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

      const result = await updateServiceOrderUseCase.execute(
        serviceOrderId,
        userId,
        vehicleId,
        undefined,
        undefined,
        ServiceOrderStatus.inExecution,
      );

      expect(mockServiceOrderRepository.findById).toHaveBeenCalledWith(
        serviceOrderId,
      );
      expect(mockServiceOrderRepository.update).toHaveBeenCalled();
      expect(result.status).toBe(ServiceOrderStatus.inExecution);
    });

    it("should throw error when service order does not exist", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(null);

      await expect(
        updateServiceOrderUseCase.execute(
          "non-existent-id",
          userId,
          vehicleId,
          partsQuantities,
          serviceIds,
          ServiceOrderStatus.completed,
        ),
      ).rejects.toThrow("Service Order not found");

      expect(mockServiceOrderRepository.findById).toHaveBeenCalled();
      expect(mockServiceOrderRepository.update).not.toHaveBeenCalled();
    });

    it("should update service order to completed status", async () => {
      const completedServiceOrder = new ServiceOrder({
        ...mockServiceOrder,
        status: ServiceOrderStatus.completed,
        updatedAt: new Date(),
      });

      mockServiceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
      mockServiceOrderRepository.update.mockResolvedValue(
        completedServiceOrder,
      );

      const result = await updateServiceOrderUseCase.execute(
        serviceOrderId,
        userId,
        vehicleId,
        undefined,
        undefined,
        ServiceOrderStatus.completed,
      );

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.id).toBe(serviceOrderId);
      expect(result.status).toBe(ServiceOrderStatus.completed);
    });

    it("should verify service order exists before updating", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
      mockServiceOrderRepository.update.mockResolvedValue(mockServiceOrder);

      await updateServiceOrderUseCase.execute(
        serviceOrderId,
        userId,
        vehicleId,
        partsQuantities,
        serviceIds,
        ServiceOrderStatus.inExecution,
      );

      expect(mockServiceOrderRepository.findById).toHaveBeenNthCalledWith(
        1,
        serviceOrderId,
      );
      expect(mockServiceOrderRepository.update).toHaveBeenCalled();
    });
  });
});
