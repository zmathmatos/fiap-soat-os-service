import type { Vehicle } from "../../../../domain/entities/Vehicle";
import type { IVehicleRepository } from "../../../../domain/repositories/IVehicleRepository";

export class UpdateVehicleUseCase {
  private vehicleRepository: IVehicleRepository;

  constructor(vehicleRepository: IVehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async execute(
    id: string,
    vehicleData: Partial<Omit<Vehicle, "id" | "createdAt" | "updatedAt">>
  ): Promise<Vehicle | null> {
    const existingVehicle = await this.vehicleRepository.findById(id);

    if (!existingVehicle) {
      return null;
    }

    if (vehicleData.licensePlate && vehicleData.licensePlate !== existingVehicle.licensePlate) {
      const duplicateVehicle = await this.vehicleRepository.findByLicensePlate(
        vehicleData.licensePlate
      );

      if (duplicateVehicle) {
        throw new Error("Vehicle with this license plate already exists");
      }
    }

    return await this.vehicleRepository.update(id, vehicleData);
  }
}
