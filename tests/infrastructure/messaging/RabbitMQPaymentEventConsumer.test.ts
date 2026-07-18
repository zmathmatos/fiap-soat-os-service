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

import { RabbitMQPaymentEventConsumer } from "../../../src/infrastructure/messaging/RabbitMQPaymentEventConsumer";
import type { ServiceOrderController } from "../../../src/interface/controllers/ServiceOrderController";

type ConsumeCallback = (msg: ConsumeMessage) => void;

const makeMessage = (routingKey: string, body: unknown): ConsumeMessage =>
  ({
    fields: { routingKey },
    content: Buffer.from(JSON.stringify(body)),
  }) as ConsumeMessage;

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe("RabbitMQPaymentEventConsumer", () => {
  let applyBillingEvent: jest.Mock;
  let consumeCallback: ConsumeCallback;

  beforeEach(async () => {
    jest.clearAllMocks();
    applyBillingEvent = jest.fn().mockResolvedValue(undefined);
    const controller = {
      applyBillingEvent,
    } as unknown as ServiceOrderController;

    mockChannel.consume.mockImplementation((_queue: string, cb: ConsumeCallback) => {
      consumeCallback = cb;
    });

    const consumer = new RabbitMQPaymentEventConsumer(controller);
    await consumer.start();
  });

  it("connects, declares the topic exchange/queue, and binds both routing keys", () => {
    expect(mockConnect).toHaveBeenCalled();
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      "payment-events",
      "topic",
      { durable: true },
    );
    expect(mockChannel.assertQueue).toHaveBeenCalledWith(
      "os-service.payment-events",
      { durable: true },
    );
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      "os-service.payment-events",
      "payment-events",
      "payment.approved",
    );
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      "os-service.payment-events",
      "payment-events",
      "payment.failed",
    );
  });

  it("applies the billing event using the message's routing key and acks on success", async () => {
    const message = makeMessage("payment.approved", { serviceOrderId: "so-1" });

    consumeCallback(message);
    await flushPromises();

    expect(applyBillingEvent).toHaveBeenCalledWith("so-1", "payment.approved");
    expect(mockChannel.ack).toHaveBeenCalledWith(message);
    expect(mockChannel.nack).not.toHaveBeenCalled();
  });

  it("drops the message (ack, no requeue) when the service order isn't found", async () => {
    applyBillingEvent.mockRejectedValue(new Error("Service Order not found"));
    const message = makeMessage("payment.approved", { serviceOrderId: "missing" });

    consumeCallback(message);
    await flushPromises();

    expect(mockChannel.nack).toHaveBeenCalledWith(message, false, false);
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });

  it("drops the message (ack, no requeue) when the payload is missing serviceOrderId", async () => {
    const message = makeMessage("payment.failed", {});

    consumeCallback(message);
    await flushPromises();

    expect(applyBillingEvent).not.toHaveBeenCalled();
    expect(mockChannel.nack).toHaveBeenCalledWith(message, false, false);
  });

  it("requeues the message on a transient error", async () => {
    applyBillingEvent.mockRejectedValue(new Error("connection reset"));
    const message = makeMessage("payment.approved", { serviceOrderId: "so-1" });

    consumeCallback(message);
    await flushPromises();

    expect(mockChannel.nack).toHaveBeenCalledWith(message, false, true);
  });
});
