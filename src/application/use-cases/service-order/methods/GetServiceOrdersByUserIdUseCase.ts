import { ServiceOrder } from "../../../../domain/entities/ServiceOrder";
import type { IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";

export class GetServiceOrdersByUserIdUseCase {
  private serviceOrderRepository: IServiceOrderRepository;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
  }

  async execute(userId: string): Promise<ServiceOrder[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    return this.serviceOrderRepository.findByUserId(userId);
  }
}
