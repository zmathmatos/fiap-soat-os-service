import { Service } from "../../../../domain/entities/Service";
import type { IServiceRepository } from "../../../../domain/repositories/IServiceRepository";

export class GetServicesByServiceCodeUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(serviceCodes: string[]): Promise<Service[]> {
    if (!serviceCodes || serviceCodes.length === 0) {
      throw new Error("Service codes are required");
    }

    return await this.serviceRepository.findByServiceCodes(serviceCodes);
  }
}
