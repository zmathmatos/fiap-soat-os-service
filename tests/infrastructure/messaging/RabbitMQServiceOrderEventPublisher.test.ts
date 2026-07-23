import { describe, it, expect, beforeEach } from "@jest/globals";
import amqplib from "amqplib";
import { RabbitMQServiceOrderEventPublisher } from "../../../src/infrastructure/messaging/RabbitMQServiceOrderEventPublisher";

jest.mock("amqplib");

const mockedAmqplib = amqplib as jest.Mocked<typeof amqplib>;

describe("RabbitMQServiceOrderEventPublisher", () => {
  let mockChannel: {
    assertExchange: jest.Mock;
    publish: jest.Mock;
  };
  let mockConnection: {
    createChannel: jest.Mock;
    on: jest.Mock;
  };

  beforeEach(() => {
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockReturnValue(true),
    };
    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      on: jest.fn(),
    };
    (mockedAmqplib.connect as jest.Mock).mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("publishes order.received to the service-order-events exchange", async () => {
    const publisher = new RabbitMQServiceOrderEventPublisher();

    await publisher.publishOrderReceived({
      serviceOrderId: "order-1",
      serviceOrderNumber: 42,
    });

    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      "service-order-events",
      "topic",
      { durable: true },
    );
    expect(mockChannel.publish).toHaveBeenCalledWith(
      "service-order-events",
      "order.received",
      expect.any(Buffer),
      expect.objectContaining({ persistent: true, messageId: expect.any(String) }),
    );
    const body = JSON.parse(mockChannel.publish.mock.calls[0][2].toString());
    expect(body).toEqual({ serviceOrderId: "order-1", serviceOrderNumber: 42 });
  });

  it("publishes diagnostic.finished with parts and services", async () => {
    const publisher = new RabbitMQServiceOrderEventPublisher();

    await publisher.publishDiagnosticFinished({
      serviceOrderId: "order-1",
      parts: [{ id: "p1", name: "Brake pad", quantity: 2, price: 150 }],
      services: [{ id: "s1", name: "Brake replacement", price: 300 }],
    });

    expect(mockChannel.publish).toHaveBeenCalledWith(
      "service-order-events",
      "diagnostic.finished",
      expect.any(Buffer),
      expect.objectContaining({ persistent: true }),
    );
    const body = JSON.parse(mockChannel.publish.mock.calls[0][2].toString());
    expect(body.parts).toHaveLength(1);
    expect(body.services).toHaveLength(1);
  });

  it("reuses the same connection across publishes", async () => {
    const publisher = new RabbitMQServiceOrderEventPublisher();

    await publisher.publishOrderReceived({ serviceOrderId: "a", serviceOrderNumber: 1 });
    await publisher.publishOrderReceived({ serviceOrderId: "b", serviceOrderNumber: 2 });

    expect(mockedAmqplib.connect).toHaveBeenCalledTimes(1);
    expect(mockChannel.publish).toHaveBeenCalledTimes(2);
  });

  it("is fail-soft: broker outage does not throw", async () => {
    (mockedAmqplib.connect as jest.Mock).mockRejectedValue(new Error("ECONNREFUSED"));
    const publisher = new RabbitMQServiceOrderEventPublisher();

    await expect(
      publisher.publishOrderReceived({ serviceOrderId: "x", serviceOrderNumber: 9 }),
    ).resolves.toBeUndefined();
  });

  it("retries the connection on the next publish after a failure", async () => {
    (mockedAmqplib.connect as jest.Mock)
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockResolvedValueOnce(mockConnection);
    const publisher = new RabbitMQServiceOrderEventPublisher();

    await publisher.publishOrderReceived({ serviceOrderId: "x", serviceOrderNumber: 9 });
    await publisher.publishOrderReceived({ serviceOrderId: "y", serviceOrderNumber: 10 });

    expect(mockChannel.publish).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockChannel.publish.mock.calls[0][2].toString());
    expect(body.serviceOrderId).toBe("y");
  });
});
