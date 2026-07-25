import amqplib, { Channel } from "amqplib";
import type {
  IQuotationEventPublisher,
  QuotationRequestedPayload,
} from "../../application/services/IQuotationEventPublisher";

const EXCHANGE = process.env.RABBITMQ_QUOTATION_EXCHANGE || "quotation-events";
const ROUTING_KEY = "quotation.requested";

export class RabbitMQQuotationEventPublisher implements IQuotationEventPublisher {
  private channelPromise: Promise<Channel> | null = null;

  async connect(): Promise<void> {
    await this.getChannel();
  }

  async publishQuotationRequested(payload: QuotationRequestedPayload): Promise<void> {
    const channel = await this.getChannel();
    channel.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify(payload)), {
      contentType: "application/json",
      persistent: true,
    });
  }

  private getChannel(): Promise<Channel> {
    if (!this.channelPromise) {
      const url = process.env.RABBITMQ_URL;
      if (!url) {
        throw new Error("RABBITMQ_URL environment variable is required");
      }
      this.channelPromise = amqplib.connect(url).then(async (connection) => {
        const channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE, "topic", { durable: true });
        return channel;
      });
    }
    return this.channelPromise;
  }
}

// Shared singleton so the AMQP channel is reused across quotations instead of
// reconnecting on every publish (Utils.generateQuotation is called per status change).
export const rabbitMQQuotationEventPublisher = new RabbitMQQuotationEventPublisher();
