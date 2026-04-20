import type { IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";

export class DeleteServiceOrderUseCase {
  private serviceOrderRepository: IServiceOrderRepository;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
  }

  async execute(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("Service Order ID is required");
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) {
      throw new Error("Service Order not found");
    }

    return this.serviceOrderRepository.delete(id);
  }
}
