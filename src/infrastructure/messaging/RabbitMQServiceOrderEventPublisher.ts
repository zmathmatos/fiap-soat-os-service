import amqplib, { Channel, ChannelModel } from "amqplib";
import { randomUUID } from "crypto";
import type {
  IServiceOrderEventPublisher,
  OrderReceivedEvent,
} from "../../application/services/IServiceOrderEventPublisher";
import Logger from "../database/sequelize/utils/Logger";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE = process.env.RABBITMQ_SERVICE_ORDER_EXCHANGE || "service-order-events";

export class RabbitMQServiceOrderEventPublisher implements IServiceOrderEventPublisher {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  async publishOrderReceived(event: OrderReceivedEvent): Promise<void> {
    await this.publish("order.received", event);
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    this.channel = null;
    this.connection = null;
  }

  private async publish(routingKey: string, payload: object): Promise<void> {
    const channel = await this.getChannel();
    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      messageId: randomUUID(),
      contentType: "application/json",
    });
    Logger.info(`Published "${routingKey}" to exchange "${EXCHANGE}"`, {
      event: "rabbitmq.publisher.published",
      routingKey,
    });
  }

  private async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;

    const connection = await amqplib.connect(RABBITMQ_URL);
    connection.on("close", () => {
      this.connection = null;
      this.channel = null;
    });
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    this.connection = connection;
    this.channel = channel;
    return channel;
  }
}
