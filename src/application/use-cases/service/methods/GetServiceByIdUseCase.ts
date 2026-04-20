import { Service } from "../../../../domain/entities/Service";
import type { IServiceRepository } from "../../../../domain/repositories/IServiceRepository";

export class GetServiceByIdUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(id: string): Promise<Service | null> {
    if (!id) {
      throw new Error("Service ID is required");
    }

    return await this.serviceRepository.findById(id);
  }
}
