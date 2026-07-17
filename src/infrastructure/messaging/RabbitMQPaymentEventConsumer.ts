import amqplib, { Channel, ConsumeMessage } from "amqplib";
import { ServiceOrderController } from "../../interface/controllers/ServiceOrderController";
import Logger from "../database/sequelize/utils/Logger";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || "payment-events";
const QUEUE = process.env.RABBITMQ_QUEUE || "os-service.payment-events";
const ROUTING_KEYS = ["payment.approved", "payment.failed"];

type PaymentEventPayload = { serviceOrderId?: string };

const PERMANENT_FAILURE = /not found|Unknown billing event|Missing serviceOrderId/i;

export class RabbitMQPaymentEventConsumer {
  private channel: Channel | null = null;

  constructor(private readonly serviceOrderController: ServiceOrderController) {}

  async start(): Promise<void> {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    this.channel = channel;

    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });
    for (const routingKey of ROUTING_KEYS) {
      await channel.bindQueue(QUEUE, EXCHANGE, routingKey);
    }
    await channel.prefetch(10);

    await channel.consume(QUEUE, (message) => {
      if (!message) return;
      void this.handleMessage(message);
    });

    Logger.info(`RabbitMQ consumer listening on queue "${QUEUE}"`, {
      event: "rabbitmq.consumer.started",
    });
  }

  async stop(): Promise<void> {
    await this.channel?.close();
    this.channel = null;
  }

  private async handleMessage(message: ConsumeMessage): Promise<void> {
    const routingKey = message.fields.routingKey;
    const channel = this.channel;
    if (!channel) return;

    try {
      const payload = JSON.parse(message.content.toString()) as PaymentEventPayload;
      if (!payload.serviceOrderId) {
        throw new Error(`Missing serviceOrderId in ${routingKey} event`);
      }

      await this.serviceOrderController.applyBillingEvent(payload.serviceOrderId, routingKey);
      channel.ack(message);
    } catch (error) {
      const isPermanentFailure = error instanceof Error && PERMANENT_FAILURE.test(error.message);
      Logger.error(`Failed to process "${routingKey}" event from RabbitMQ`, {
        err: error,
        event: "rabbitmq.consumer.error",
      });
      // Permanent failures (bad payload, unknown order) would just loop forever on requeue.
      channel.nack(message, false, !isPermanentFailure);
    }
  }
}
