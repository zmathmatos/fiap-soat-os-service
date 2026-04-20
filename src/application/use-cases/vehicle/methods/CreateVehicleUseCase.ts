import { Vehicle } from "../../../../domain/entities/Vehicle";
import type { IVehicleRepository } from "../../../../domain/repositories/IVehicleRepository";
import { LicensePlateValidation } from "../validators/LicensePlateValidation";

export class CreateVehicleUseCase {
  private vehicleRepository: IVehicleRepository;

  constructor(vehicleRepository: IVehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(
    licensePlate: string,
    brand: string,
    model: string,
    year: number
  ): Promise<Vehicle> {
    if (!LicensePlateValidation.isValidBrazilianPlate(licensePlate)) {
      throw new Error("Invalid Brazilian license plate");
    }

    const existingVehicle = await this.vehicleRepository.findByLicensePlate(
      licensePlate
    );

    if (existingVehicle) {
      throw new Error("Vehicle with this license plate already exists");
    }

    const vehicleData = Vehicle.create(licensePlate, brand, model, year);
    return await this.vehicleRepository.create(vehicleData);
  }
}
