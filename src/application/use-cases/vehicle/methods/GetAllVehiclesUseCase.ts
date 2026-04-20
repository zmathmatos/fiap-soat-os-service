import type { Vehicle } from "../../../../domain/entities/Vehicle";
import type { IVehicleRepository } from "../../../../domain/repositories/IVehicleRepository";

export class GetAllVehiclesUseCase {
  private vehicleRepository: IVehicleRepository;

  constructor(vehicleRepository: IVehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(): Promise<Vehicle[]> {
    return await this.vehicleRepository.findAll();
  }
}
