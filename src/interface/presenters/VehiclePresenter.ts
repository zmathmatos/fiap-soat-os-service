import { Vehicle } from "../../domain/entities/Vehicle";

export class VehiclePresenter {
  static toResponse(vehicle: Vehicle) {
    return {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
    };
  }

  static toListResponse(vehicles: Vehicle[]) {
    return vehicles.map(VehiclePresenter.toResponse);
  }
}
