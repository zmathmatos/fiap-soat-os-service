import amqplib, { Channel, ConsumeMessage } from "amqplib";
import Logger from "../database/sequelize/utils/Logger";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

export type RabbitMQConsumerOptions = {
  exchange: string;
  queue: string;
  routingKeys: string[];
  permanentFailure: RegExp;
};

type EventPayload = { serviceOrderId?: string };

export abstract class RabbitMQEventConsumer<TPayload extends EventPayload> {
  private channel: Channel | null = null;

  protected constructor(private readonly options: RabbitMQConsumerOptions) {}

  async start(): Promise<void> {
    const { exchange, queue, routingKeys } = this.options;
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    this.channel = channel;

    await channel.assertExchange(exchange, "topic", { durable: true });
    await channel.assertQueue(queue, { durable: true });
    for (const routingKey of routingKeys) {
      await channel.bindQueue(queue, exchange, routingKey);
    }
    await channel.prefetch(10);

    await channel.consume(queue, (message) => {
      if (!message) return;
      void this.handleMessage(message);
    });

    Logger.info(`RabbitMQ consumer listening on queue "${queue}"`, {
      event: "rabbitmq.consumer.started",
    });
  }

  async stop(): Promise<void> {
    await this.channel?.close();
    this.channel = null;
  }

  protected abstract applyEvent(
    serviceOrderId: string,
    routingKey: string,
    payload: TPayload,
  ): Promise<void>;

  private async handleMessage(message: ConsumeMessage): Promise<void> {
    const routingKey = message.fields.routingKey;
    const channel = this.channel;
    if (!channel) return;

    try {
      const payload = JSON.parse(message.content.toString()) as TPayload;
      if (!payload.serviceOrderId) {
        throw new Error(`Missing serviceOrderId in ${routingKey} event`);
      }

      await this.applyEvent(payload.serviceOrderId, routingKey, payload);
      channel.ack(message);
    } catch (error) {
      const isPermanentFailure =
        error instanceof Error && this.options.permanentFailure.test(error.message);
      Logger.error(`Failed to process "${routingKey}" event from RabbitMQ`, {
        err: error,
        event: "rabbitmq.consumer.error",
      });
      // Permanent failures (bad payload, unknown order) would just loop forever on requeue.
      channel.nack(message, false, !isPermanentFailure);
    }
  }
}
