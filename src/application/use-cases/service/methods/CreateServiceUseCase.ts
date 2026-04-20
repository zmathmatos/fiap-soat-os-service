import { Service } from "../../../../domain/entities/Service";
import type { IServiceRepository } from "../../../../domain/repositories/IServiceRepository";

export class CreateServiceUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(
    name: string,
    serviceCode: string,
    price: number
  ): Promise<Service> {
    if (!name || !serviceCode || price === undefined) {
      throw new Error("All fields are required");
    }

    if (price < 0) {
      throw new Error("Price cannot be negative");
    }

    const existingService = await this.serviceRepository.findByServiceCode(
      serviceCode
    );

    if (existingService) {
      throw new Error("Service with this service code already exists");
    }

    const serviceData = Service.create(name, serviceCode, price);
    return await this.serviceRepository.create(serviceData);
  }
}
