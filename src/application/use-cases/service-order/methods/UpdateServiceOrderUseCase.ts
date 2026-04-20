import { ServiceOrder, ServiceOrderStatus } from "../../../../domain/entities/ServiceOrder";
import type { IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";

export class UpdateServiceOrderUseCase {
  private serviceOrderRepository: IServiceOrderRepository;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
  }

  async execute(
    id: string,
    userId: string,
    vehicleId: string,
    partsQuantities?: {partId: string, quantity: number}[],
    serviceIds?: string[],
    status?: ServiceOrderStatus
  ): Promise<ServiceOrder> {
    if (!id) {
      throw new Error("Service Order ID is required");
    }

    const existingServiceOrder = await this.serviceOrderRepository.findById(id);

    if (!existingServiceOrder) {
      throw new Error("Service Order not found");
    }

    const updatedServiceOrder = new ServiceOrder({
      ...existingServiceOrder,
      status: status || existingServiceOrder.status,
    });

    return this.serviceOrderRepository.update(
      id,
      updatedServiceOrder,
      userId,
      vehicleId,
      serviceIds,
      partsQuantities,
    );
  }
}
