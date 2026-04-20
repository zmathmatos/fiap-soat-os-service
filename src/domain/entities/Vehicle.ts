import { ServiceOrder } from "./ServiceOrder";

interface VehicleParams {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  serviceOrders?: ServiceOrder[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Vehicle {
  public readonly id: VehicleParams["id"];
  public readonly licensePlate: VehicleParams["licensePlate"];
  public readonly brand: VehicleParams["brand"];
  public readonly model: VehicleParams["model"];
  public readonly year: VehicleParams["year"];
  public readonly serviceOrders?: VehicleParams["serviceOrders"];
  public readonly createdAt: VehicleParams["createdAt"];
  public readonly updatedAt: VehicleParams["updatedAt"];

  constructor({
    id,
    serviceOrders,
    licensePlate,
    brand,
    model,
    year,
    createdAt,
    updatedAt
  }: VehicleParams) {
    this.id = id;
    this.serviceOrders = serviceOrders;
    this.licensePlate = licensePlate;
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    licensePlate: string,
    brand: string,
    model: string,
    year: number
  ): Omit<Vehicle, "id" | "serviceOrders" | "createdAt" | "updatedAt"> {
    return {
      licensePlate,
      brand,
      model,
      year,
    };
  }
}