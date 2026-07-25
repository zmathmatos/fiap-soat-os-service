const mockChannel = {
  assertExchange: jest.fn().mockResolvedValue(undefined),
  publish: jest.fn(),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockConnection = {
  createChannel: jest.fn().mockResolvedValue(mockChannel),
};

const mockConnect = jest.fn().mockResolvedValue(mockConnection);

jest.mock("amqplib", () => ({
  connect: (...args: unknown[]) => mockConnect(...args),
}));

import { RabbitMQQuotationEventPublisher } from "../../../src/infrastructure/messaging/RabbitMQQuotationEventPublisher";
import type { QuotationRequestedPayload } from "../../../src/application/services/IQuotationEventPublisher";

const payload: QuotationRequestedPayload = {
  serviceOrderId: "so-1",
  serviceOrderNumber: 1001,
  customerId: "c-1",
  customerEmail: "test@example.com",
  description: "Troca de óleo",
  amount: 350,
};

describe("RabbitMQQuotationEventPublisher", () => {
  const originalUrl = process.env.RABBITMQ_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
  });

  afterEach(() => {
    process.env.RABBITMQ_URL = originalUrl;
  });

  it("throws when RABBITMQ_URL is not set", async () => {
    delete process.env.RABBITMQ_URL;
    const publisher = new RabbitMQQuotationEventPublisher();

    await expect(publisher.publishQuotationRequested(payload)).rejects.toThrow(
      "RABBITMQ_URL environment variable is required",
    );
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("connects and declares the topic exchange before publishing", async () => {
    const publisher = new RabbitMQQuotationEventPublisher();

    await publisher.publishQuotationRequested(payload);

    expect(mockConnect).toHaveBeenCalledWith("amqp://guest:guest@localhost:5672");
    expect(mockChannel.assertExchange).toHaveBeenCalledWith("quotation-events", "topic", {
      durable: true,
    });
    expect(mockChannel.publish).toHaveBeenCalledWith(
      "quotation-events",
      "quotation.requested",
      Buffer.from(JSON.stringify(payload)),
      { contentType: "application/json", persistent: true },
    );
  });

  it("reuses the cached channel on subsequent publishes instead of reconnecting", async () => {
    const publisher = new RabbitMQQuotationEventPublisher();

    await publisher.publishQuotationRequested(payload);
    await publisher.publishQuotationRequested(payload);

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockChannel.publish).toHaveBeenCalledTimes(2);
  });

  it("connect() warms up the channel without publishing anything", async () => {
    const publisher = new RabbitMQQuotationEventPublisher();

    await publisher.connect();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockChannel.publish).not.toHaveBeenCalled();
  });
});
