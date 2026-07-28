import { ServiceOrderController } from "../../interface/controllers/ServiceOrderController";
import { RabbitMQEventConsumer } from "./RabbitMQEventConsumer";

const EXCHANGE = process.env.RABBITMQ_EXECUTION_EXCHANGE || "execution-events";
const QUEUE = process.env.RABBITMQ_EXECUTION_QUEUE || "os-service.execution-events";
const ROUTING_KEYS = ["diagnostic.finished", "execution.finished", "execution.failed"];

type DiagnosticPart = { id?: string; quantity?: number };
type DiagnosticService = { id?: string };
type ExecutionEventPayload = {
  serviceOrderId?: string;
  parts?: DiagnosticPart[];
  services?: DiagnosticService[];
};

const PERMANENT_FAILURE =
  /not found|Unknown execution event|Missing serviceOrderId|violates foreign key constraint/i;

export class RabbitMQExecutionEventConsumer extends RabbitMQEventConsumer<ExecutionEventPayload> {
  constructor(private readonly serviceOrderController: ServiceOrderController) {
    super({
      exchange: EXCHANGE,
      queue: QUEUE,
      routingKeys: ROUTING_KEYS,
      permanentFailure: PERMANENT_FAILURE,
    });
  }

  protected async applyEvent(
    serviceOrderId: string,
    routingKey: string,
    payload: ExecutionEventPayload,
  ): Promise<void> {
    await this.serviceOrderController.applyExecutionEvent(
      serviceOrderId,
      routingKey,
      routingKey === "diagnostic.finished" ? toDiagnosis(payload) : undefined,
    );
  }
}

function toDiagnosis(payload: ExecutionEventPayload) {
  return {
    partsQuantities: (payload.parts ?? [])
      .filter((part): part is { id: string; quantity?: number } => Boolean(part.id))
      .map((part) => ({ partId: part.id, quantity: part.quantity ?? 1 })),
    serviceIds: (payload.services ?? [])
      .map((service) => service.id)
      .filter((id): id is string => Boolean(id)),
  };
}
