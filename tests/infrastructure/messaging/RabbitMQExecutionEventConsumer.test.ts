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

  it("connects, declares the topic exchange/queue, and binds both routing keys", () => {
    expect(mockConnect).toHaveBeenCalled();
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      "execution-events",
      "topic",
      { durable: true },
    );
    expect(mockChannel.assertQueue).toHaveBeenCalledWith(
      "os-service.execution-events",
      { durable: true },
    );
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      "os-service.execution-events",
      "execution-events",
      "execution.finished",
    );
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      "os-service.execution-events",
      "execution-events",
      "execution.failed",
    );
  });

  it("applies the execution event using the message's routing key and acks on success", async () => {
    const message = makeMessage("execution.finished", { serviceOrderId: "so-1" });

    consumeCallback(message);
    await flushPromises();

    expect(applyExecutionEvent).toHaveBeenCalledWith("so-1", "execution.finished");
    expect(mockChannel.ack).toHaveBeenCalledWith(message);
    expect(mockChannel.nack).not.toHaveBeenCalled();
  });

  it("drops the message (no requeue) when the service order isn't found", async () => {
    applyExecutionEvent.mockRejectedValue(new Error("Service Order not found"));
    const message = makeMessage("execution.finished", { serviceOrderId: "missing" });

    consumeCallback(message);
    await flushPromises();

    expect(mockChannel.nack).toHaveBeenCalledWith(message, false, false);
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });

  it("drops the message (no requeue) when the payload is missing serviceOrderId", async () => {
    const message = makeMessage("execution.failed", {});

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
