import { ServiceOrder } from "../../../../domain/entities/ServiceOrder";
import type { IServiceOrderRepository } from "../../../../domain/repositories/IServiceOrderRepository";

export class GetServiceOrdersByVehicleIdUseCase {
  private serviceOrderRepository: IServiceOrderRepository;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
  }

  async execute(vehicleId: string): Promise<ServiceOrder[]> {
    if (!vehicleId) {
      throw new Error("Vehicle ID is required");
    }

    return this.serviceOrderRepository.findByVehicleId(vehicleId);
  }
}
