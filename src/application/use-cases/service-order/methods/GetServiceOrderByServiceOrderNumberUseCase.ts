import { ServiceOrder } from "../../../../domain/entities/ServiceOrder";
import type { IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";

export class GetServiceOrderByServiceOrderNumberUseCase {
  private serviceOrderRepository: IServiceOrderRepository;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
  }

  async execute(serviceOrderNumber: number): Promise<ServiceOrder | null> {
    if (!serviceOrderNumber) {
      throw new Error("Service Order Number is required");
    }

    return this.serviceOrderRepository.findByServiceOrderNumber(serviceOrderNumber);
  }
}
