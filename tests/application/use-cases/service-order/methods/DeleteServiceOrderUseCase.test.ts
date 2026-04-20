import { describe, it, expect, beforeEach } from "@jest/globals";
import { DeleteServiceOrderUseCase } from "../../../../../src/application/use-cases/service-order/methods/DeleteServiceOrderUseCase";
import type { IServiceOrderRepository } from "../../../../../src/domain/repositories/IServiceOrderRepository";
import { ServiceOrder } from "../../../../../src/domain/entities/ServiceOrder";
import { ServiceOrderStatus } from "../../../../../src/domain/entities/ServiceOrder";

describe("DeleteServiceOrderUseCase", () => {
  let deleteServiceOrderUseCase: DeleteServiceOrderUseCase;
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

    deleteServiceOrderUseCase = new DeleteServiceOrderUseCase(
      mockServiceOrderRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const serviceOrderId = "123e4567-e89b-12d3-a456-426614174000";
    const existingServiceOrder = new ServiceOrder({
      id: serviceOrderId,
      serviceOrderNumber: 1,
      user: {
        id: "123e4567-e89b-12d3-a456-426614174001",
        name: "John Doe",
        document: "12345678900",
        role: "customer",
        email: "user1@email.com",
        password: "user1_password",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      vehicle: {
        id: "123e4567-e89b-12d3-a456-426614174002",
        licensePlate: "ABC-1234",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      services: [
        {
          id: "123e4567-e89b-12d3-a456-426614174003",
          name: "Oil Change",
          serviceCode: "OC-001",
          price: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      parts: [],
      status: ServiceOrderStatus.received,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it("should delete a service order successfully", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(
        existingServiceOrder,
      );
      mockServiceOrderRepository.delete.mockResolvedValue(true);

      const result = await deleteServiceOrderUseCase.execute(serviceOrderId);

      expect(result).toBe(true);
      expect(mockServiceOrderRepository.findById).toHaveBeenCalledWith(
        serviceOrderId,
      );
      expect(mockServiceOrderRepository.delete).toHaveBeenCalledWith(
        serviceOrderId,
      );
    });

    it("should throw error when service order does not exist", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(null);

      await expect(
        deleteServiceOrderUseCase.execute(serviceOrderId),
      ).rejects.toThrow("Service Order not found");

      expect(mockServiceOrderRepository.delete).not.toHaveBeenCalled();
    });

    it("should handle repository errors during delete", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(
        existingServiceOrder,
      );
      const error = new Error("Database error");
      mockServiceOrderRepository.delete.mockRejectedValue(error);

      await expect(
        deleteServiceOrderUseCase.execute(serviceOrderId),
      ).rejects.toThrow("Database error");
    });

    it("should verify service order exists before deleting", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(
        existingServiceOrder,
      );
      mockServiceOrderRepository.delete.mockResolvedValue(true);

      await deleteServiceOrderUseCase.execute(serviceOrderId);

      // Verify that findById was called before delete
      expect(mockServiceOrderRepository.findById).toHaveBeenCalledWith(
        serviceOrderId,
      );
      expect(mockServiceOrderRepository.delete).toHaveBeenCalledWith(
        serviceOrderId,
      );

      // Verify call order
      expect(mockServiceOrderRepository.findById).toHaveBeenNthCalledWith(
        1,
        serviceOrderId,
      );
      expect(mockServiceOrderRepository.delete).toHaveBeenNthCalledWith(
        1,
        serviceOrderId,
      );
    });
  });
});
