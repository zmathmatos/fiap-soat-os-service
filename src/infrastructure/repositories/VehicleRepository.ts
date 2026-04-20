import { Vehicle } from "../../domain/entities/Vehicle";
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { VehicleModel } from "../database/sequelize/models/VehicleModel";

export class VehicleRepository implements IVehicleRepository {
  async create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const createdVehicle = await VehicleModel.create({
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year
    });

    return new Vehicle(createdVehicle.toJSON());
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await VehicleModel.findByPk(id);

    if (!vehicle) {
      return null;
    }

    return new Vehicle(vehicle.toJSON());
  }

  async findAll(): Promise<Vehicle[]> {
    const vehicles = await VehicleModel.findAll();

    return vehicles.map(
      (vehicle) =>
        new Vehicle(vehicle.toJSON())
    );
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const vehicle = await VehicleModel.findOne({
      where: { licensePlate },
      include: ["serviceOrders"],
    });

    if (!vehicle) {
      return null;
    }

    return new Vehicle(vehicle.toJSON());
  }

  async update(id: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Vehicle | null> {
    const vehicle = await VehicleModel.findByPk(id, {
      include: ["serviceOrders"],
    });

    if (!vehicle) {
      return null;
    }

    await vehicle.update(vehicleData);

    return new Vehicle(vehicle.toJSON());
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await VehicleModel.destroy({
      where: { id },
    });

    return deleted > 0;
  }
}