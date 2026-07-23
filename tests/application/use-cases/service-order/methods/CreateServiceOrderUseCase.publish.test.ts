import { describe, it, expect, beforeEach } from "@jest/globals";
import { CreateServiceOrderUseCase } from "../../../../../src/application/use-cases/service-order/methods/CreateServiceOrderUseCase";
import type { IServiceOrderRepository } from "../../../../../src/domain/repositories/IServiceOrderRepository";
import type { IServiceOrderEventPublisher } from "../../../../../src/domain/events/IServiceOrderEventPublisher";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../../../src/domain/entities/ServiceOrder";

const mockServiceOrder = new ServiceOrder({
  id: "123e4567-e89b-12d3-a456-426614174999",
  user: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "John Doe",
    document: "12345678900",
    role: "customer",
    email: "user1@email.com",
    password: "user1_password",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  vehicle: {
    id: "123e4567-e89b-12d3-a456-426614174001",
    licensePlate: "ABC-1234",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  parts: [],
  services: [],
  serviceOrderNumber: 42,
  status: ServiceOrderStatus.received,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("CreateServiceOrderUseCase - order.received publication", () => {
  let mockServiceOrderRepository: jest.Mocked<IServiceOrderRepository>;
  let mockPublisher: jest.Mocked<IServiceOrderEventPublisher>;

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
    mockPublisher = {
      publishOrderReceived: jest.fn(),
    };
    mockServiceOrderRepository.create.mockResolvedValue(mockServiceOrder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("publishes order.received with id and number after creating the order", async () => {
    const useCase = new CreateServiceOrderUseCase(
      mockServiceOrderRepository,
      mockPublisher,
    );

    await useCase.execute(
      "123e4567-e89b-12d3-a456-426614174000",
      "123e4567-e89b-12d3-a456-426614174001",
    );

    expect(mockPublisher.publishOrderReceived).toHaveBeenCalledWith({
      serviceOrderId: mockServiceOrder.id,
      serviceOrderNumber: mockServiceOrder.serviceOrderNumber,
    });
  });

  it("does not publish when no publisher is provided (backwards compatible)", async () => {
    const useCase = new CreateServiceOrderUseCase(mockServiceOrderRepository);

    const result = await useCase.execute(
      "123e4567-e89b-12d3-a456-426614174000",
      "123e4567-e89b-12d3-a456-426614174001",
    );

    expect(result).toBeInstanceOf(ServiceOrder);
    expect(mockPublisher.publishOrderReceived).not.toHaveBeenCalled();
  });

  it("does not publish when the repository create fails", async () => {
    mockServiceOrderRepository.create.mockRejectedValue(new Error("db down"));
    const useCase = new CreateServiceOrderUseCase(
      mockServiceOrderRepository,
      mockPublisher,
    );

    await expect(
      useCase.execute(
        "123e4567-e89b-12d3-a456-426614174000",
        "123e4567-e89b-12d3-a456-426614174001",
      ),
    ).rejects.toThrow("db down");

    expect(mockPublisher.publishOrderReceived).not.toHaveBeenCalled();
  });
});
