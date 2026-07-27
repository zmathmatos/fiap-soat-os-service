import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

// Mock the OutboxEventModel before importing OutboxPublisher
jest.mock("../../../src/infrastructure/database/sequelize/models/OutboxEventModel", () => ({
  OutboxEventModel: {
    findAll: jest.fn(),
  },
}));

// Mock Utils
jest.mock("../../../src/infrastructure/database/sequelize/utils/Utils", () => ({
  __esModule: true,
  default: {
    generateQuotation: jest.fn(),
    updateInventory: jest.fn(),
  },
}));

// Mock Logger
jest.mock("../../../src/infrastructure/database/sequelize/utils/Logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { OutboxPublisher } from "../../../src/infrastructure/messaging/OutboxPublisher";
import { OutboxEventModel } from "../../../src/infrastructure/database/sequelize/models/OutboxEventModel";
import Utils from "../../../src/infrastructure/database/sequelize/utils/Utils";

const mockFindAll = OutboxEventModel.findAll as jest.MockedFunction<typeof OutboxEventModel.findAll>;
const mockGenerateQuotation = Utils.generateQuotation as jest.MockedFunction<typeof Utils.generateQuotation>;

function makeMockEvent(overrides: Partial<{ id: string; eventType: string; payload: Record<string, unknown> }> = {}) {
  return {
    id: overrides.id ?? "event-uuid-1",
    eventType: overrides.eventType ?? "quotation.requested",
    payload: overrides.payload ?? { serviceOrderId: "so-uuid-1" },
    update: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
}

describe("OutboxPublisher", () => {
  let publisher: OutboxPublisher;

  beforeEach(() => {
    jest.useFakeTimers();
    publisher = new OutboxPublisher();
    mockFindAll.mockResolvedValue([]);
    mockGenerateQuotation.mockResolvedValue(undefined);
  });

  afterEach(() => {
    publisher.stop();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("starts polling on start()", async () => {
    publisher.start();
    jest.advanceTimersByTime(5000);
    await Promise.resolve(); // flush microtasks
    expect(mockFindAll).toHaveBeenCalledTimes(1);
  });

  it("publishes a quotation.requested event and marks it published", async () => {
    const event = makeMockEvent();
    mockFindAll.mockResolvedValueOnce([event as any]);

    publisher.start();
    jest.advanceTimersByTime(5000);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockGenerateQuotation).toHaveBeenCalledWith("so-uuid-1");
    expect(event.update).toHaveBeenCalledWith(
      expect.objectContaining({ publishedAt: expect.any(Date) }),
    );
  });

  it("does not mark event as published when generateQuotation throws", async () => {
    const event = makeMockEvent();
    mockFindAll.mockResolvedValueOnce([event as any]);
    mockGenerateQuotation.mockRejectedValueOnce(new Error("broker down"));

    publisher.start();
    jest.advanceTimersByTime(5000);
    await Promise.resolve();
    await Promise.resolve();

    expect(event.update).not.toHaveBeenCalled();
  });

  it("skips events with unknown event type without crashing", async () => {
    const event = makeMockEvent({ eventType: "unknown.event" });
    mockFindAll.mockResolvedValueOnce([event as any]);

    publisher.start();
    jest.advanceTimersByTime(5000);
    await Promise.resolve();
    await Promise.resolve();

    // generateQuotation is not called for unknown event types
    expect(mockGenerateQuotation).not.toHaveBeenCalled();
    // The event is still marked published to prevent infinite retry loops
    expect(event.update).toHaveBeenCalledWith(
      expect.objectContaining({ publishedAt: expect.any(Date) }),
    );
  });

  it("continues polling after a DB error", async () => {
    mockFindAll
      .mockRejectedValueOnce(new Error("db down"))
      .mockResolvedValue([]);

    publisher.start();
    jest.advanceTimersByTime(5000);
    await Promise.resolve();
    jest.advanceTimersByTime(5000);
    await Promise.resolve();

    expect(mockFindAll).toHaveBeenCalledTimes(2);
  });

  it("stops polling after stop()", async () => {
    publisher.start();
    publisher.stop();
    jest.advanceTimersByTime(5000);
    await Promise.resolve();

    expect(mockFindAll).not.toHaveBeenCalled();
  });
});
