import { ServiceOrder } from "../../../../domain/entities/ServiceOrder";
import type { IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";
import type { IServiceOrderEventPublisher } from "../../../../domain/events/IServiceOrderEventPublisher";

export class CreateServiceOrderUseCase {
  private serviceOrderRepository: IServiceOrderRepository;
  private eventPublisher?: IServiceOrderEventPublisher;

  constructor(
    serviceOrderRepository: IServiceOrderRepository,
    eventPublisher?: IServiceOrderEventPublisher,
  ) {
    this.serviceOrderRepository = serviceOrderRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute(
    userId: string,
    vehicleId: string,
    serviceIds?: string[],
    partIds?: string[]
  ): Promise<ServiceOrder> {
    if (!userId || !vehicleId) {
      throw new Error("User ID and Vehicle ID are required");
    }

    const orderNumber = await this.serviceOrderRepository.generateServiceOrderNumber();

    const serviceOrder = ServiceOrder.create();

    const created = await this.serviceOrderRepository.create(
      serviceOrder,
      orderNumber,
      userId,
      vehicleId,
      serviceIds,
      partIds
    );

    await this.eventPublisher?.publishOrderReceived({
      serviceOrderId: created.id,
      serviceOrderNumber: created.serviceOrderNumber,
    });

    return created;
  }
}
