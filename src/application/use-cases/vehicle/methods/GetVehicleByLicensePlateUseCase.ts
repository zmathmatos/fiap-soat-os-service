import type { Vehicle } from "../../../../domain/entities/Vehicle";
import type { IVehicleRepository } from "../../../../domain/repositories/IVehicleRepository";

export class GetVehicleByLicensePlateUseCase {
  private vehicleRepository: IVehicleRepository;

  constructor(vehicleRepository: IVehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(licensePlate: string): Promise<Vehicle | null> {
    return await this.vehicleRepository.findByLicensePlate(licensePlate);
  }
}
