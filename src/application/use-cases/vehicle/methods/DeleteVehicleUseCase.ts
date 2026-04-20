import type { IVehicleRepository } from "../../../../domain/repositories/IVehicleRepository";

export class DeleteVehicleUseCase {
  private vehicleRepository: IVehicleRepository;

  constructor(vehicleRepository: IVehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(id: string): Promise<boolean> {
    const existingVehicle = await this.vehicleRepository.findById(id);

    if (!existingVehicle) {
      throw new Error("Vehicle not found");
    }

    return await this.vehicleRepository.delete(id);
  }
}
