import { describe, it, expect, beforeEach } from "@jest/globals";
import { ServiceOrderController } from "../../../src/interface/controllers/ServiceOrderController";
import type { IServiceOrderRepository } from "../../../src/domain/repositories/IServiceOrderRepository";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../src/domain/entities/ServiceOrder";

const makeServiceOrder = (status: ServiceOrderStatus) =>
  new ServiceOrder({
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
    parts: [],
    services: [],
    serviceOrderNumber: 7,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe("ServiceOrderController.applyExecutionEvent", () => {
  let mockRepository: jest.Mocked<IServiceOrderRepository>;
  let controller: ServiceOrderController;

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
    controller = new ServiceOrderController(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sets status to Finalizado on execution.finished", async () => {
    const inExecution = makeServiceOrder(ServiceOrderStatus.inExecution);
    const completed = makeServiceOrder(ServiceOrderStatus.completed);
    mockRepository.findById.mockResolvedValue(inExecution);
    mockRepository.update.mockResolvedValue(completed);

    const result = await controller.applyExecutionEvent("order-1", "execution.finished");

    expect(mockRepository.update).toHaveBeenCalledWith(
      "order-1",
      expect.objectContaining({ status: ServiceOrderStatus.completed }),
      "user-1",
      "vehicle-1",
      undefined,
      undefined,
    );
    expect(result.status).toBe(ServiceOrderStatus.completed);
  });

  it("sets status to Finalizado on execution.failed (saga compensation)", async () => {
    const inExecution = makeServiceOrder(ServiceOrderStatus.inExecution);
    const completed = makeServiceOrder(ServiceOrderStatus.completed);
    mockRepository.findById.mockResolvedValue(inExecution);
    mockRepository.update.mockResolvedValue(completed);

    const result = await controller.applyExecutionEvent("order-1", "execution.failed");

    expect(result.status).toBe(ServiceOrderStatus.completed);
  });

  it("throws for an unknown execution event", async () => {
    await expect(
      controller.applyExecutionEvent("order-1", "execution.mystery"),
    ).rejects.toThrow("Unknown execution event");
  });

  it("throws when the service order is not found", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      controller.applyExecutionEvent("ghost", "execution.finished"),
    ).rejects.toThrow("Service Order not found");
  });
});
