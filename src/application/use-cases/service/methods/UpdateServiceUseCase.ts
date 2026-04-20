import { Service } from "../../../../domain/entities/Service";
import type { IServiceRepository } from "../../../../domain/repositories/IServiceRepository";

export class UpdateServiceUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(
    id: string,
    serviceData: Partial<{
      name: string;
      serviceCode: string;
      price: number;
    }>
  ): Promise<Service | null> {
    if (!id) {
      throw new Error("Service ID is required");
    }

    if (serviceData.price !== undefined && serviceData.price < 0) {
      throw new Error("Price cannot be negative");
    }

    const service = await this.serviceRepository.findById(id);

    if (!service) {
      throw new Error("Service not found");
    }

    if (serviceData.serviceCode) {
      const existingService = await this.serviceRepository.findByServiceCode(
        serviceData.serviceCode
      );

      if (existingService && existingService.id !== id) {
        throw new Error("Service with this service code already exists");
      }
    }

    return await this.serviceRepository.update(id, serviceData);
  }
}
