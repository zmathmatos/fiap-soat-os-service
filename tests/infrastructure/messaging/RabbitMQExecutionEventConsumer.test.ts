import type { ConsumeMessage } from "amqplib";

const mockChannel = {
  assertExchange: jest.fn().mockResolvedValue(undefined),
  assertQueue: jest.fn().mockResolvedValue(undefined),
  bindQueue: jest.fn().mockResolvedValue(undefined),
  prefetch: jest.fn().mockResolvedValue(undefined),
  consume: jest.fn(),
  ack: jest.fn(),
  nack: jest.fn(),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockConnection = {
  createChannel: jest.fn().mockResolvedValue(mockChannel),
};

const mockConnect = jest.fn().mockResolvedValue(mockConnection);

jest.mock("amqplib", () => ({
  connect: (...args: unknown[]) => mockConnect(...args),
}));

import { RabbitMQExecutionEventConsumer } from "../../../src/infrastructure/messaging/RabbitMQExecutionEventConsumer";
import type { ServiceOrderController } from "../../../src/interface/controllers/ServiceOrderController";

type ConsumeCallback = (msg: ConsumeMessage) => void;

const makeMessage = (routingKey: string, body: unknown): ConsumeMessage =>
  ({
    fields: { routingKey },
    content: Buffer.from(JSON.stringify(body)),
  }) as ConsumeMessage;

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe("RabbitMQExecutionEventConsumer", () => {
  let applyExecutionEvent: jest.Mock;
  let consumeCallback: ConsumeCallback;

  beforeEach(async () => {
    jest.clearAllMocks();
    applyExecutionEvent = jest.fn().mockResolvedValue(undefined);
    const controller = {
      applyExecutionEvent,
    } as unknown as ServiceOrderController;

    mockChannel.consume.mockImplementation((_queue: string, cb: ConsumeCallback) => {
      consumeCallback = cb;
    });

    const consumer = new RabbitMQExecutionEventConsumer(controller);
    await consumer.start();
  });

  it("declares the execution-events exchange/queue and binds every routing key", () => {
    expect(mockChannel.assertExchange).toHaveBeenCalledWith("execution-events", "topic", {
      durable: true,
    });
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("os-service.execution-events", {
      durable: true,
    });
    for (const routingKey of ["diagnostic.finished", "execution.finished", "execution.failed"]) {
      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        "os-service.execution-events",
        "execution-events",
        routingKey,
      );
    }
  });

  it("forwards the diagnosis (parts and services) on diagnostic.finished", async () => {
    const message = makeMessage("diagnostic.finished", {
      serviceOrderId: "so-1",
      parts: [{ id: "p1", name: "Pastilha", quantity: 2, price: 150 }],
      services: [{ id: "s1", name: "Troca", price: 300 }],
    });

    consumeCallback(message);
    await flushPromises();

    expect(applyExecutionEvent).toHaveBeenCalledWith("so-1", "diagnostic.finished", {
      partsQuantities: [{ partId: "p1", quantity: 2 }],
      serviceIds: ["s1"],
    });
    expect(mockChannel.ack).toHaveBeenCalledWith(message);
  });

  it("applies execution.finished without a diagnosis payload", async () => {
    const message = makeMessage("execution.finished", {
      serviceOrderId: "so-1",
      finishedAt: "2026-07-25T10:00:00.000Z",
    });

    consumeCallback(message);
    await flushPromises();

    expect(applyExecutionEvent).toHaveBeenCalledWith("so-1", "execution.finished", undefined);
    expect(mockChannel.ack).toHaveBeenCalledWith(message);
  });

  it("drops the message (no requeue) when the service order isn't found", async () => {
    applyExecutionEvent.mockRejectedValue(new Error("Service Order not found"));
    const message = makeMessage("execution.failed", { serviceOrderId: "missing" });

    consumeCallback(message);
    await flushPromises();

    expect(mockChannel.nack).toHaveBeenCalledWith(message, false, false);
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });

  it("drops the message (no requeue) when the payload is missing serviceOrderId", async () => {
    const message = makeMessage("execution.finished", {});

    consumeCallback(message);
    await flushPromises();

    expect(applyExecutionEvent).not.toHaveBeenCalled();
    expect(mockChannel.nack).toHaveBeenCalledWith(message, false, false);
  });

  it("requeues the message on a transient error", async () => {
    applyExecutionEvent.mockRejectedValue(new Error("connection reset"));
    const message = makeMessage("execution.finished", { serviceOrderId: "so-1" });

    consumeCallback(message);
    await flushPromises();

    expect(mockChannel.nack).toHaveBeenCalledWith(message, false, true);
  });
});
