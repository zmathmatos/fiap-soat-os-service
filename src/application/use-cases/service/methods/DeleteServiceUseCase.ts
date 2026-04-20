import type { IServiceRepository } from "../../../../domain/repositories/IServiceRepository";

export class DeleteServiceUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("Service ID is required");
    }

    const service = await this.serviceRepository.findById(id);

    if (!service) {
      throw new Error("Service not found");
    }

    return await this.serviceRepository.delete(id);
  }
}
