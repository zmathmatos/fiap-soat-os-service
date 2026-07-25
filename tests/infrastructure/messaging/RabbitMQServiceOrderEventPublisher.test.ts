const mockChannel = {
  assertExchange: jest.fn().mockResolvedValue(undefined),
  publish: jest.fn().mockReturnValue(true),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockConnection = {
  createChannel: jest.fn().mockResolvedValue(mockChannel),
  on: jest.fn(),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockConnect = jest.fn().mockResolvedValue(mockConnection);

jest.mock("amqplib", () => ({
  connect: (...args: unknown[]) => mockConnect(...args),
}));

import { RabbitMQServiceOrderEventPublisher } from "../../../src/infrastructure/messaging/RabbitMQServiceOrderEventPublisher";

describe("RabbitMQServiceOrderEventPublisher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("publishes order.received to the service-order-events topic exchange", async () => {
    const publisher = new RabbitMQServiceOrderEventPublisher();

    await publisher.publishOrderReceived({ serviceOrderId: "so-1", serviceOrderNumber: 7 });

    expect(mockChannel.assertExchange).toHaveBeenCalledWith("service-order-events", "topic", {
      durable: true,
    });
    expect(mockChannel.publish).toHaveBeenCalledWith(
      "service-order-events",
      "order.received",
      expect.any(Buffer),
      expect.objectContaining({ persistent: true, messageId: expect.any(String) }),
    );
    const body = JSON.parse((mockChannel.publish.mock.calls[0][2] as Buffer).toString());
    expect(body).toEqual({ serviceOrderId: "so-1", serviceOrderNumber: 7 });
  });

  it("reuses the channel across publishes", async () => {
    const publisher = new RabbitMQServiceOrderEventPublisher();

    await publisher.publishOrderReceived({ serviceOrderId: "so-1", serviceOrderNumber: 1 });
    await publisher.publishOrderReceived({ serviceOrderId: "so-2", serviceOrderNumber: 2 });

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockChannel.publish).toHaveBeenCalledTimes(2);
  });

  it("closes the channel and the connection", async () => {
    const publisher = new RabbitMQServiceOrderEventPublisher();
    await publisher.publishOrderReceived({ serviceOrderId: "so-1", serviceOrderNumber: 1 });

    await publisher.close();

    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
  });
});
