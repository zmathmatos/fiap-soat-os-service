import { ServiceOrder } from "../entities/ServiceOrder";

export interface AverageServiceTimeResult {
  averageTimeInHours: number;
  completedOrders: number;
  totalOrders: number;
}

export interface IServiceOrderRepository {
  create(
    serviceOrder: Omit<ServiceOrder, "id" | "serviceOrderNumber" | "user" | "vehicle" | "parts" | "services" | "createdAt" | "updatedAt">,
    orderNumber: number,
    userId: string,
    vehicleId: string,
    serviceIds?: string[],
    partIds?: string[]): Promise<ServiceOrder>;
  findById(id: string): Promise<ServiceOrder | null>;
  findByServiceOrderNumber(serviceOrderNumber: number): Promise<ServiceOrder | null>;
  findAll(includeFinished?: boolean, orderByStatus?: boolean): Promise<ServiceOrder[]>;
  findByUserId(userId: string): Promise<ServiceOrder[]>;
  findByVehicleId(vehicleId: string): Promise<ServiceOrder[]>;
  update(
    id: string,
    serviceOrder: Partial<ServiceOrder>,
    userId: string,
    vehicleId: string,
    serviceIds?: string[],
    partsQuantities?: {partId: string, quantity: number}[]
  ): Promise<ServiceOrder>;
  delete(id: string): Promise<boolean>;
  generateServiceOrderNumber(): Promise<number>;
  getAverageServiceTime(): Promise<AverageServiceTimeResult>;
}
