import { describe, it, expect, beforeEach } from "@jest/globals";
import { CreateServiceOrderUseCase } from "../../../../../src/application/use-cases/service-order/methods/CreateServiceOrderUseCase";
import type { IServiceOrderRepository } from "../../../../../src/domain/repositories/IServiceOrderRepository";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../../../src/domain/entities/ServiceOrder";

describe("CreateServiceOrderUseCase", () => {
  let createServiceOrderUseCase: CreateServiceOrderUseCase;
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

    createServiceOrderUseCase = new CreateServiceOrderUseCase(
      mockServiceOrderRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should create a service order with required parameters", async () => {
      const userUUID = "123e4567-e89b-12d3-a456-426614174000";
      const vehicleUUID = "123e4567-e89b-12d3-a456-426614174001";
      const serviceUUIDs = [
        "123e4567-e89b-12d3-a456-426614174002",
        "123e4567-e89b-12d3-a456-426614174003",
      ];

      const mockServiceOrder = new ServiceOrder({
        id: "123e4567-e89b-12d3-a456-426614174999",
        user: {
          id: userUUID,
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: vehicleUUID,
          licensePlate: "ABC-1234",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        parts: [],
        services: [],
        serviceOrderNumber: 1,
        status: ServiceOrderStatus.received,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockServiceOrderRepository.create.mockResolvedValue(mockServiceOrder);

      const result = await createServiceOrderUseCase.execute(
        userUUID,
        vehicleUUID,
        serviceUUIDs,
      );

      expect(mockServiceOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ServiceOrderStatus.received,
        }),
        undefined,
        userUUID,
        vehicleUUID,
        serviceUUIDs,
        undefined,
      );
      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.status).toBe(ServiceOrderStatus.received);
    });

    it("should create a service order with empty service list", async () => {
      const userUUID = "123e4567-e89b-12d3-a456-426614174000";
      const vehicleUUID = "123e4567-e89b-12d3-a456-426614174001";
      const serviceUUIDs: string[] = [];

      const mockServiceOrder = new ServiceOrder({
        id: "123e4567-e89b-12d3-a456-426614174999",
        user: {
          id: userUUID,
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: vehicleUUID,
          licensePlate: "ABC-1234",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        parts: [],
        services: [],
        serviceOrderNumber: 1,
        status: ServiceOrderStatus.received,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockServiceOrderRepository.create.mockResolvedValue(mockServiceOrder);

      const result = await createServiceOrderUseCase.execute(
        userUUID,
        vehicleUUID,
        serviceUUIDs,
      );

      expect(mockServiceOrderRepository.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ServiceOrder);
    });

    it("should create a service order with multiple services", async () => {
      const userUUID = "123e4567-e89b-12d3-a456-426614174000";
      const vehicleUUID = "123e4567-e89b-12d3-a456-426614174001";
      const serviceUUIDs = [
        "123e4567-e89b-12d3-a456-426614174002",
        "123e4567-e89b-12d3-a456-426614174003",
      ];

      const mockServiceOrder = new ServiceOrder({
        id: "123e4567-e89b-12d3-a456-426614174999",
        user: {
          id: userUUID,
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: vehicleUUID,
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
            id: "123e4567-e89b-12d3-a456-426614174002",
            name: "Alinhamento de Suspensão",
            serviceCode: "ALIGN-001",
            price: 150,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "123e4567-e89b-12d3-a456-426614174003",
            name: "Cambagem",
            serviceCode: "CAMB-001",
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

      mockServiceOrderRepository.create.mockResolvedValue(mockServiceOrder);

      const result = await createServiceOrderUseCase.execute(
        userUUID,
        vehicleUUID,
        serviceUUIDs,
      );

      expect(mockServiceOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ServiceOrderStatus.received,
        }),
        undefined,
        userUUID,
        vehicleUUID,
        serviceUUIDs,
        undefined,
      );
      expect(result).toBeInstanceOf(ServiceOrder);
    });

    it("should create a service order with parts", async () => {
      const userUUID = "123e4567-e89b-12d3-a456-426614174000";
      const vehicleUUID = "123e4567-e89b-12d3-a456-426614174001";
      const serviceUUIDs: string[] = [];
      const partUUIDs = [
        "222e58ba-4961-4e8e-851d-af1ca9b99e01",
        "222e58ba-4961-4e8e-851d-af1ca9b99e02",
      ];

      const mockServiceOrder = new ServiceOrder({
        id: "123e4567-e89b-12d3-a456-426614174999",
        user: {
          id: userUUID,
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: vehicleUUID,
          licensePlate: "ABC-1234",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        parts: [
          {
            id: "2b6bb50c-5795-4352-bf49-6bc6bd5d66d1",
            quantity: 1,
            partId: "222e58ba-4961-4e8e-851d-af1ca9b99e01",
            serviceOrderId: "123e4567-e89b-12d3-a456-426614174999",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "2b6bb50c-5795-4352-bf49-6bc6bd5d66d2",
            quantity: 1,
            partId: "222e58ba-4961-4e8e-851d-af1ca9b99e02",
            serviceOrderId: "123e4567-e89b-12d3-a456-426614174999",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ] as any,
        services: [],
        serviceOrderNumber: 1,
        status: ServiceOrderStatus.received,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockServiceOrderRepository.create.mockResolvedValue(mockServiceOrder);

      const result = await createServiceOrderUseCase.execute(
        userUUID,
        vehicleUUID,
        serviceUUIDs,
        partUUIDs,
      );

      expect(mockServiceOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ServiceOrderStatus.received,
        }),
        undefined,
        userUUID,
        vehicleUUID,
        serviceUUIDs,
        partUUIDs,
      );
      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.parts).toHaveLength(2);
    });

    it("should create a service order with parts and services", async () => {
      const userUUID = "123e4567-e89b-12d3-a456-426614174000";
      const vehicleUUID = "123e4567-e89b-12d3-a456-426614174001";
      const serviceUUIDs = ["123e4567-e89b-12d3-a456-426614174002"];
      const partUUIDs = ["222e58ba-4961-4e8e-851d-af1ca9b99e01"];

      const mockServiceOrder = new ServiceOrder({
        id: "123e4567-e89b-12d3-a456-426614174999",
        user: {
          id: userUUID,
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: vehicleUUID,
          licensePlate: "ABC-1234",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        parts: [
          {
            id: "2b6bb50c-5795-4352-bf49-6bc6bd5d66d1",
            quantity: 1,
            partId: "222e58ba-4961-4e8e-851d-af1ca9b99e01",
            serviceOrderId: "123e4567-e89b-12d3-a456-426614174999",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ] as any,
        services: [
          {
            id: "123e4567-e89b-12d3-a456-426614174002",
            name: "Troca de óleo",
            serviceCode: "TROCA-001",
            price: 80,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        serviceOrderNumber: 1,
        status: ServiceOrderStatus.received,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockServiceOrderRepository.create.mockResolvedValue(mockServiceOrder);

      const result = await createServiceOrderUseCase.execute(
        userUUID,
        vehicleUUID,
        serviceUUIDs,
        partUUIDs,
      );

      expect(mockServiceOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ServiceOrderStatus.received,
        }),
        undefined,
        userUUID,
        vehicleUUID,
        serviceUUIDs,
        partUUIDs,
      );
      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.parts).toHaveLength(1);
      expect(result.services).toHaveLength(1);
    });

    it("should create a service order with empty parts list", async () => {
      const userUUID = "123e4567-e89b-12d3-a456-426614174000";
      const vehicleUUID = "123e4567-e89b-12d3-a456-426614174001";
      const serviceUUIDs: string[] = [];
      const partUUIDs: string[] = [];

      const mockServiceOrder = new ServiceOrder({
        id: "123e4567-e89b-12d3-a456-426614174999",
        user: {
          id: userUUID,
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: vehicleUUID,
          licensePlate: "ABC-1234",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        parts: [],
        services: [],
        serviceOrderNumber: 1,
        status: ServiceOrderStatus.received,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockServiceOrderRepository.create.mockResolvedValue(mockServiceOrder);

      const result = await createServiceOrderUseCase.execute(
        userUUID,
        vehicleUUID,
        serviceUUIDs,
        partUUIDs,
      );

      expect(mockServiceOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ServiceOrderStatus.received,
        }),
        undefined,
        userUUID,
        vehicleUUID,
        serviceUUIDs,
        partUUIDs,
      );
      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.parts).toHaveLength(0);
    });

    it("should return a ServiceOrder instance", async () => {
      const userUUID = "123e4567-e89b-12d3-a456-426614174000";
      const vehicleUUID = "123e4567-e89b-12d3-a456-426614174001";
      const serviceUUIDs = [
        "123e4567-e89b-12d3-a456-426614174002",
        "123e4567-e89b-12d3-a456-426614174003",
      ];

      const mockServiceOrder = new ServiceOrder({
        id: "123e4567-e89b-12d3-a456-426614174999",
        user: {
          id: userUUID,
          name: "John Doe",
          document: "12345678900",
          role: "customer",
          email: "user1@email.com",
          password: "user1_password",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        vehicle: {
          id: vehicleUUID,
          licensePlate: "ABC-1234",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        parts: [],
        services: [],
        serviceOrderNumber: 1,
        status: ServiceOrderStatus.received,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockServiceOrderRepository.create.mockResolvedValue(mockServiceOrder);

      const result = await createServiceOrderUseCase.execute(
        userUUID,
        vehicleUUID,
        serviceUUIDs,
      );

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.id).toBeDefined();
      expect(result.serviceOrderNumber).toBeDefined();
    });
  });
});
