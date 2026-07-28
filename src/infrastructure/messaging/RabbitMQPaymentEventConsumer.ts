import { ServiceOrderController } from "../../interface/controllers/ServiceOrderController";
import { RabbitMQEventConsumer } from "./RabbitMQEventConsumer";

const EXCHANGE = process.env.RABBITMQ_EXCHANGE || "payment-events";
const QUEUE = process.env.RABBITMQ_QUEUE || "os-service.payment-events";
const ROUTING_KEYS = ["payment.approved", "payment.failed", "quotation.rejected"];

type PaymentEventPayload = { serviceOrderId?: string };

const PERMANENT_FAILURE = /not found|Unknown billing event|Missing serviceOrderId/i;

export class RabbitMQPaymentEventConsumer extends RabbitMQEventConsumer<PaymentEventPayload> {
  constructor(private readonly serviceOrderController: ServiceOrderController) {
    super({
      exchange: EXCHANGE,
      queue: QUEUE,
      routingKeys: ROUTING_KEYS,
      permanentFailure: PERMANENT_FAILURE,
    });
  }

  protected async applyEvent(serviceOrderId: string, routingKey: string): Promise<void> {
    await this.serviceOrderController.applyBillingEvent(serviceOrderId, routingKey);
  }
}
