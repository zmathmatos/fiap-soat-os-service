import type { AverageServiceTimeResult, IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";

export class GetAverageServiceTimeUseCase {
  private serviceOrderRepository: IServiceOrderRepository;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
  }

  async execute(): Promise<AverageServiceTimeResult> {
    return this.serviceOrderRepository.getAverageServiceTime();
  }
}
