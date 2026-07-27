import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Must be mocked before the module under test is imported
jest.mock("../../../src/infrastructure/database/sequelize/models/OutboxEventModel", () => ({
  OutboxEventModel: {},
  insertOutboxEvent: jest.fn(),
}));

jest.mock("../../../src/infrastructure/database/sequelize/models/ServiceOrderModel", () => {
  const mockOrder = {
    id: "so-uuid-1",
    toJSON: () => ({
      id: "so-uuid-1",
      serviceOrderNumber: 1001,
      status: "Aguardando aprovação",
      userId: "user-1",
      vehicleId: "vehicle-1",
      parts: [],
      services: [],
      user: { id: "user-1", name: "Test", document: "12345678909", email: "t@t.com", password: "x", role: "customer", createdAt: new Date(), updatedAt: new Date() },
      vehicle: { id: "vehicle-1", licensePlate: "ABC1D23", brand: "T", model: "M", year: 2020, createdAt: new Date(), updatedAt: new Date() },
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };

  return {
    ServiceOrderModel: {
      update: jest.fn<() => Promise<[number]>>().mockResolvedValue([1]),
      findByPk: jest.fn<() => Promise<typeof mockOrder>>().mockResolvedValue(mockOrder),
    },
    ServiceOrderModelPart: {
      findOne: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      create: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      bulkCreate: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    },
    ServiceOrderModelService: {
      findAll: jest.fn<() => Promise<[]>>().mockResolvedValue([]),
    },
  };
});

jest.mock("../../../src/infrastructure/database/sequelize/init", () => ({
  sequelize: {
    transaction: jest.fn(<T>(fn: (t: unknown) => Promise<T>) => fn({})),
  },
}));

import { ServiceOrderRepository } from "../../../src/infrastructure/repositories/ServiceOrderRepository";
import { insertOutboxEvent } from "../../../src/infrastructure/database/sequelize/models/OutboxEventModel";
import { ServiceOrderStatus } from "../../../src/domain/entities/ServiceOrder";

const mockInsertOutboxEvent = insertOutboxEvent as jest.MockedFunction<typeof insertOutboxEvent>;

describe("ServiceOrderRepository.update — outbox integration", () => {
  let repo: ServiceOrderRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ServiceOrderRepository();
  });

  it("inserts an outbox event when status transitions to awaitingApproval", async () => {
    await repo.update(
      "so-uuid-1",
      { status: ServiceOrderStatus.awaitingApproval },
      "user-1",
      "vehicle-1",
    );

    expect(mockInsertOutboxEvent).toHaveBeenCalledWith(
      "quotation.requested",
      { serviceOrderId: "so-uuid-1" },
      expect.anything(), // transaction
    );
  });

  it("does NOT insert an outbox event for other status transitions", async () => {
    for (const status of [
      ServiceOrderStatus.received,
      ServiceOrderStatus.inDiagnostic,
      ServiceOrderStatus.inExecution,
      ServiceOrderStatus.completed,
      ServiceOrderStatus.delivered,
    ] as ServiceOrderStatus[]) {
      jest.clearAllMocks();
      await repo.update("so-uuid-1", { status }, "user-1", "vehicle-1");
      expect(mockInsertOutboxEvent).not.toHaveBeenCalled();
    }
  });
});
