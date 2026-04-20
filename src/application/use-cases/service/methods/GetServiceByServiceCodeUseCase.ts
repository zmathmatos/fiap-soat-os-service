import { Service } from "../../../../domain/entities/Service";
import type { IServiceRepository } from "../../../../domain/repositories/IServiceRepository";

export class GetServiceByServiceCodeUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(serviceCode: string): Promise<Service | null> {
    if (!serviceCode) {
      throw new Error("Service code is required");
    }

    return await this.serviceRepository.findByServiceCode(serviceCode);
  }
}
