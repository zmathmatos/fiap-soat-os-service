import { ServiceOrder } from "../../../../domain/entities/ServiceOrder";
import type { IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";

export class CreateServiceOrderUseCase {
  private serviceOrderRepository: IServiceOrderRepository;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
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

    return this.serviceOrderRepository.create(
      serviceOrder,
      orderNumber,
      userId,
      vehicleId,
      serviceIds,
      partIds
    );
  }
}
