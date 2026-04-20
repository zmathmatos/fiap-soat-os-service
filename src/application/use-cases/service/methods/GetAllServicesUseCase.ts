import { Service } from "../../../../domain/entities/Service";
import type { IServiceRepository } from "../../../../domain/repositories/IServiceRepository";

export class GetAllServicesUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(): Promise<Service[]> {
    return await this.serviceRepository.findAll();
  }
}
