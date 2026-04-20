import { Request, Response } from "express";
import { VehicleUseCase } from "../../application/use-cases/vehicle/VehicleUseCase";
import { VehicleRepository } from "../../infrastructure/repositories/VehicleRepository";
import { HttpPresenters, VehiclePresenter } from "../presenters";
import { Vehicle } from "../../domain/entities/Vehicle";

export class VehicleController {
  private vehicleRepository: VehicleRepository;
  private vehicleUseCase: VehicleUseCase;

  constructor(vehicleRepository: VehicleRepository = new VehicleRepository()) {
    this.vehicleRepository = vehicleRepository;
    this.vehicleUseCase = new VehicleUseCase(this.vehicleRepository);
  }

  async create(
    licensePlate: string,
    brand: string,
    model: string,
    year: number,
  ): Promise<Vehicle> {
    return this.vehicleUseCase.create.execute(licensePlate, brand, model, year);
  }

  async getById(id: string): Promise<Vehicle | null> {
    return this.vehicleUseCase.getById.execute(id);
  }

  async getAll(): Promise<Vehicle[]> {
    return this.vehicleUseCase.getAll.execute();
  }

  async getVehicleByLicensePlate(
    licensePlate: string,
  ): Promise<Vehicle | null> {
    return this.vehicleUseCase.getByLicensePlate.execute(licensePlate);
  }

  async update({
    id,
    licensePlate,
    brand,
    model,
    year,
  }: Readonly<{
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
  }>): Promise<Vehicle | null> {
    return this.vehicleUseCase.update.execute(id as string, {
      licensePlate,
      brand,
      model,
      year,
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.vehicleUseCase.delete.execute(id);
  }
}
