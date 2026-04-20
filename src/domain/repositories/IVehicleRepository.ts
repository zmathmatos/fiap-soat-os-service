import { Vehicle } from "../entities/Vehicle";

export interface IVehicleRepository {
  create(vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt">): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findAll(): Promise<Vehicle[]>;
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  update(id: string, vehicle: Partial<Omit<Vehicle, "id" | "createdAt" | "updatedAt">>): Promise<Vehicle | null>;
  delete(id: string): Promise<boolean>;
}