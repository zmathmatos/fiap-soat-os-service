import { describe, it, expect, beforeEach } from "@jest/globals";
import { ServiceOrderController } from "../../../src/interface/controllers/ServiceOrderController";
import type { IServiceOrderRepository } from "../../../src/domain/repositories/IServiceOrderRepository";
import type { IServiceOrderEventPublisher } from "../../../src/domain/events/IServiceOrderEventPublisher";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../src/domain/entities/ServiceOrder";
import { Part } from "../../../src/domain/entities/Part";

const serviceOrder = new ServiceOrder({
  id: "order-1",
  user: {
    id: "user-1",
    name: "John",
    document: "12345678900",
    role: "customer",
    email: "j@e.com",
    password: "x",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  vehicle: {
    id: "vehicle-1",
    licensePlate: "ABC-1234",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  parts: [
    new Part({
      id: "part-1",
      name: "Brake pad",
      partNumber: "BP-01",
      brand: "Bosch",
      price: 150,
      stockQuantity: 10,
      serviceQuantity: 2,
    }),
    new Part({
      id: "part-2",
      name: "Oil filter",
      partNumber: "OF-01",
      brand: "Mann",
      price: 45,
      stockQuantity: 5,
    }),
  ],
  services: [
    {
      id: "svc-1",
      name: "Brake replacement",
      serviceCode: "BRK-001",
      price: 300,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  serviceOrderNumber: 7,
  status: ServiceOrderStatus.awaitingApproval,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("ServiceOrderController.notifyDiagnosticFinished", () => {
  let mockRepository: jest.Mocked<IServiceOrderRepository>;
  let mockPublisher: jest.Mocked<IServiceOrderEventPublisher>;

  beforeEach(() => {
    mockRepository = {
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
      publishDiagnosticFinished: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("publishes diagnostic.finished with mapped parts and services", async () => {
    const controller = new ServiceOrderController(mockRepository, mockPublisher);

    await controller.notifyDiagnosticFinished(serviceOrder);

    expect(mockPublisher.publishDiagnosticFinished).toHaveBeenCalledWith({
      serviceOrderId: "order-1",
      parts: [
        { id: "part-1", name: "Brake pad", quantity: 2, price: 150 },
        { id: "part-2", name: "Oil filter", quantity: 1, price: 45 },
      ],
      services: [{ id: "svc-1", name: "Brake replacement", price: 300 }],
    });
  });

  it("is a no-op when no publisher is configured", async () => {
    const controller = new ServiceOrderController(mockRepository);

    await expect(
      controller.notifyDiagnosticFinished(serviceOrder),
    ).resolves.toBeUndefined();
  });
});
