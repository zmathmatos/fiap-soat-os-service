import amqplib, { Channel } from "amqplib";
import { randomUUID } from "crypto";
import type {
  IServiceOrderEventPublisher,
  OrderReceivedEvent,
} from "../../domain/events/IServiceOrderEventPublisher";
import Logger from "../database/sequelize/utils/Logger";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE = process.env.RABBITMQ_SERVICE_ORDER_EXCHANGE || "service-order-events";

export class RabbitMQServiceOrderEventPublisher implements IServiceOrderEventPublisher {
  private channel: Channel | null = null;

  async publishOrderReceived(event: OrderReceivedEvent): Promise<void> {
    await this.publish("order.received", event);
  }

  private async publish(routingKey: string, payload: object): Promise<void> {
    try {
      const channel = await this.getChannel();
      await channel.assertExchange(EXCHANGE, "topic", { durable: true });
      channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
        messageId: randomUUID(),
        contentType: "application/json",
      });
      Logger.info(`Published "${routingKey}" event`, {
        event: "rabbitmq.publisher.published",
        routingKey,
      });
    } catch (error) {
      this.channel = null;
      Logger.error(`Failed to publish "${routingKey}" event — continuing without it`, {
        err: error,
        event: "rabbitmq.publisher.error",
        routingKey,
      });
    }
  }

  private async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    const connection = await amqplib.connect(RABBITMQ_URL);
    connection.on("close", () => {
      this.channel = null;
    });
    connection.on("error", () => {
      this.channel = null;
    });
    this.channel = await connection.createChannel();
    return this.channel;
  }
}
