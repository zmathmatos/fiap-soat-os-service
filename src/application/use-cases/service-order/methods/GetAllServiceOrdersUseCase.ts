import { ServiceOrder } from "../../../../domain/entities/ServiceOrder";
import type { IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";

export class GetAllServiceOrdersUseCase {
  private serviceOrderRepository: IServiceOrderRepository;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
  }

  async execute(includeFinished?: boolean, orderByStatus?: boolean): Promise<ServiceOrder[]> {
    return this.serviceOrderRepository.findAll(includeFinished, orderByStatus);
  }
}
