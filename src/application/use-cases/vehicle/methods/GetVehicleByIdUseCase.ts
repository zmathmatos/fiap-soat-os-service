import type { Vehicle } from "../../../../domain/entities/Vehicle";
import type { IVehicleRepository } from "../../../../domain/repositories/IVehicleRepository";

export class GetVehicleByIdUseCase {
  private vehicleRepository: IVehicleRepository;

  constructor(vehicleRepository: IVehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(id: string): Promise<Vehicle | null> {
    return await this.vehicleRepository.findById(id);
  }
}
