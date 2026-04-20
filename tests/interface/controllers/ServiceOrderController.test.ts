import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { ServiceOrderController } from "../../../src/interface/controllers/ServiceOrderController";
import type {
  AverageServiceTimeResult,
  IServiceOrderRepository,
} from "../../../src/domain/repositories/IServiceOrderRepository";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../src/domain/entities/ServiceOrder";

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const VEHICLE_ID = "123e4567-e89b-12d3-a456-426614174001";
const ORDER_ID = "123e4567-e89b-12d3-a456-426614174999";
const SERVICE_ID_1 = "123e4567-e89b-12d3-a456-426614174002";
const SERVICE_ID_2 = "123e4567-e89b-12d3-a456-426614174003";
const PART_ID_1 = "222e58ba-4961-4e8e-851d-af1ca9b99e01";

const makeServiceOrder = (
  overrides: Partial<ConstructorParameters<typeof ServiceOrder>[0]> = {},
): ServiceOrder => {
  const date = new Date();
  return new ServiceOrder({
    id: ORDER_ID,
    serviceOrderNumber: 1,
    status: ServiceOrderStatus.received,
    user: {
      id: USER_ID,
      name: "John Doe",
      document: "12345678909",
      email: "john@doe.com",
      password: "secret123",
      role: "customer",
      createdAt: date,
      updatedAt: date,
    },
    vehicle: {
      id: VEHICLE_ID,
      licensePlate: "ABC1D23",
      brand: "Toyota",
      model: "Corolla",
      year: 2023,
      createdAt: date,
      updatedAt: date,
    },
    parts: [],
    services: [],
    ...overrides,
  });
};

describe("ServiceOrderController", () => {
  let serviceOrderController: ServiceOrderController;
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

    serviceOrderController = new ServiceOrderController(
      mockServiceOrderRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a service order with userId and vehicleId", async () => {
      const order = makeServiceOrder();
      mockServiceOrderRepository.create.mockResolvedValue(order);

      const result = await serviceOrderController.create(USER_ID, VEHICLE_ID);

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.status).toBe(ServiceOrderStatus.received);
      expect(mockServiceOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: ServiceOrderStatus.received }),
        undefined,
        USER_ID,
        VEHICLE_ID,
        undefined,
        undefined,
      );
    });

    it("should create a service order with service ids", async () => {
      const serviceIds = [SERVICE_ID_1, SERVICE_ID_2];
      const order = makeServiceOrder();
      mockServiceOrderRepository.create.mockResolvedValue(order);

      const result = await serviceOrderController.create(
        USER_ID,
        VEHICLE_ID,
        serviceIds,
      );

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(mockServiceOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: ServiceOrderStatus.received }),
        undefined,
        USER_ID,
        VEHICLE_ID,
        serviceIds,
        undefined,
      );
    });

    it("should create a service order with part ids", async () => {
      const partIds = [PART_ID_1];
      const order = makeServiceOrder();
      mockServiceOrderRepository.create.mockResolvedValue(order);

      const result = await serviceOrderController.create(
        USER_ID,
        VEHICLE_ID,
        [],
        partIds,
      );

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(mockServiceOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: ServiceOrderStatus.received }),
        undefined,
        USER_ID,
        VEHICLE_ID,
        [],
        partIds,
      );
    });

    it("should create a service order with both service and part ids", async () => {
      const serviceIds = [SERVICE_ID_1];
      const partIds = [PART_ID_1];
      const order = makeServiceOrder();
      mockServiceOrderRepository.create.mockResolvedValue(order);

      const result = await serviceOrderController.create(
        USER_ID,
        VEHICLE_ID,
        serviceIds,
        partIds,
      );

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(mockServiceOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: ServiceOrderStatus.received }),
        undefined,
        USER_ID,
        VEHICLE_ID,
        serviceIds,
        partIds,
      );
    });
  });

  describe("getById", () => {
    it("should return a service order by id", async () => {
      const order = makeServiceOrder();
      mockServiceOrderRepository.findById.mockResolvedValue(order);

      const result = await serviceOrderController.getById(ORDER_ID);

      expect(result).toEqual(order);
      expect(mockServiceOrderRepository.findById).toHaveBeenCalledWith(
        ORDER_ID,
      );
    });

    it("should return null when service order is not found", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(null);

      const result = await serviceOrderController.getById("non-existent-id");

      expect(result).toBeNull();
      expect(mockServiceOrderRepository.findById).toHaveBeenCalledWith(
        "non-existent-id",
      );
    });
  });

  describe("getByServiceOrderNumber", () => {
    it("should return a service order by its number", async () => {
      const order = makeServiceOrder();
      mockServiceOrderRepository.findByServiceOrderNumber.mockResolvedValue(
        order,
      );

      const result = await serviceOrderController.getByServiceOrderNumber(1);

      expect(result).toEqual(order);
      expect(
        mockServiceOrderRepository.findByServiceOrderNumber,
      ).toHaveBeenCalledWith(1);
    });

    it("should return null when service order number is not found", async () => {
      mockServiceOrderRepository.findByServiceOrderNumber.mockResolvedValue(
        null,
      );

      const result = await serviceOrderController.getByServiceOrderNumber(9999);

      expect(result).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all service orders", async () => {
      const orders = [
        makeServiceOrder({ id: ORDER_ID, serviceOrderNumber: 1 }),
        makeServiceOrder({ id: "another-id", serviceOrderNumber: 2 }),
      ];
      mockServiceOrderRepository.findAll.mockResolvedValue(orders);

      const result = await serviceOrderController.getAll();

      expect(result).toEqual(orders);
      expect(result).toHaveLength(2);
      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });

    it("should pass includeFinished and orderByStatus flags", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue([]);

      await serviceOrderController.getAll(true, true);

      expect(mockServiceOrderRepository.findAll).toHaveBeenCalledWith(
        true,
        true,
      );
    });

    it("should return an empty array when there are no service orders", async () => {
      mockServiceOrderRepository.findAll.mockResolvedValue([]);

      const result = await serviceOrderController.getAll();

      expect(result).toEqual([]);
    });
  });

  describe("getByUserId", () => {
    it("should return service orders by user id", async () => {
      const orders = [makeServiceOrder()];
      mockServiceOrderRepository.findByUserId.mockResolvedValue(orders);

      const result = await serviceOrderController.getByUserId(USER_ID);

      expect(result).toEqual(orders);
      expect(mockServiceOrderRepository.findByUserId).toHaveBeenCalledWith(
        USER_ID,
      );
    });

    it("should return an empty array when user has no service orders", async () => {
      mockServiceOrderRepository.findByUserId.mockResolvedValue([]);

      const result = await serviceOrderController.getByUserId("user-no-orders");

      expect(result).toEqual([]);
    });
  });

  describe("getByVehicleId", () => {
    it("should return service orders by vehicle id", async () => {
      const orders = [makeServiceOrder()];
      mockServiceOrderRepository.findByVehicleId.mockResolvedValue(orders);

      const result = await serviceOrderController.getByVehicleId(VEHICLE_ID);

      expect(result).toEqual(orders);
      expect(mockServiceOrderRepository.findByVehicleId).toHaveBeenCalledWith(
        VEHICLE_ID,
      );
    });

    it("should return an empty array when vehicle has no service orders", async () => {
      mockServiceOrderRepository.findByVehicleId.mockResolvedValue([]);

      const result =
        await serviceOrderController.getByVehicleId("vehicle-no-orders");

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update and return the service order", async () => {
      const serviceOrder = makeServiceOrder();
      const updated = makeServiceOrder({
        ...serviceOrder,
        status: ServiceOrderStatus.inDiagnostic,
      });
      mockServiceOrderRepository.findById.mockResolvedValue(serviceOrder);
      mockServiceOrderRepository.update.mockResolvedValue(updated);

      const result = await serviceOrderController.update({
        id: ORDER_ID,
        userId: USER_ID,
        vehicleId: VEHICLE_ID,
        status: ServiceOrderStatus.inDiagnostic,
      });

      expect(result).toEqual(updated);
      expect(result.status).toBe(ServiceOrderStatus.inDiagnostic);
      expect(mockServiceOrderRepository.update).toHaveBeenCalledWith(
        ORDER_ID,
        expect.objectContaining({ status: ServiceOrderStatus.inDiagnostic }),
        USER_ID,
        VEHICLE_ID,
        undefined,
        undefined,
      );
    });

    it("should update with new service and part ids", async () => {
      const serviceIds = [SERVICE_ID_1];
      const partsQuantities = [{ partId: PART_ID_1, quantity: 2 }];
      const serviceOrder = makeServiceOrder();
      mockServiceOrderRepository.findById.mockResolvedValue(serviceOrder);
      mockServiceOrderRepository.update.mockResolvedValue(serviceOrder);

      await serviceOrderController.update({
        id: ORDER_ID,
        userId: USER_ID,
        vehicleId: VEHICLE_ID,
        serviceIds,
        partsQuantities,
      });

      expect(mockServiceOrderRepository.update).toHaveBeenCalledWith(
        ORDER_ID,
        expect.any(Object),
        USER_ID,
        VEHICLE_ID,
        serviceIds,
        partsQuantities,
      );
    });
  });

  describe("delete", () => {
    it("should delete an existing service order and return true", async () => {
      const order = makeServiceOrder();
      mockServiceOrderRepository.findById.mockResolvedValue(order);
      mockServiceOrderRepository.delete.mockResolvedValue(true);

      const result = await serviceOrderController.delete(ORDER_ID);

      expect(result).toBe(true);
      expect(mockServiceOrderRepository.delete).toHaveBeenCalledWith(ORDER_ID);
    });

    it("should throw an error when service order is not found", async () => {
      mockServiceOrderRepository.findById.mockResolvedValue(null);

      await expect(
        serviceOrderController.delete("non-existent-id"),
      ).rejects.toThrow("Service Order not found");

      expect(mockServiceOrderRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("getAverageServiceTime", () => {
    it("should return average service time result", async () => {
      const mockResult: AverageServiceTimeResult = {
        averageTimeInHours: 3.5,
        completedOrders: 10,
        totalOrders: 15,
      };
      mockServiceOrderRepository.getAverageServiceTime.mockResolvedValue(
        mockResult,
      );

      const result = await serviceOrderController.getAverageServiceTime();

      expect(result).toEqual(mockResult);
      expect(
        mockServiceOrderRepository.getAverageServiceTime,
      ).toHaveBeenCalled();
    });

    it("should return zeros when there are no completed orders", async () => {
      const mockResult: AverageServiceTimeResult = {
        averageTimeInHours: 0,
        completedOrders: 0,
        totalOrders: 0,
      };
      mockServiceOrderRepository.getAverageServiceTime.mockResolvedValue(
        mockResult,
      );

      const result = await serviceOrderController.getAverageServiceTime();

      expect(result.averageTimeInHours).toBe(0);
      expect(result.completedOrders).toBe(0);
      expect(result.totalOrders).toBe(0);
    });
  });
});
