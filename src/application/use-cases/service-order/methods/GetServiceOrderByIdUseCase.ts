import { ServiceOrder } from "../../../../domain/entities/ServiceOrder";
import type { IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";

export class GetServiceOrderByIdUseCase {
  private serviceOrderRepository: IServiceOrderRepository;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
  }

  async execute(id: string): Promise<ServiceOrder | null> {
    if (!id) {
      throw new Error("Service Order ID is required");
    }

    return this.serviceOrderRepository.findById(id);
  }
}
