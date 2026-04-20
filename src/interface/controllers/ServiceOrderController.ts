import { ServiceOrderUseCase } from "../../application/use-cases/service-order/ServiceOrderUseCase";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../domain/entities/ServiceOrder";
import {
  AverageServiceTimeResult,
  IServiceOrderRepository,
} from "../../domain/repositories/IServiceOrderRepository";

export class ServiceOrderController {
  private serviceOrderUseCase: ServiceOrderUseCase;

  constructor(serviceOrderRepository: IServiceOrderRepository) {
    this.serviceOrderUseCase = new ServiceOrderUseCase(serviceOrderRepository);
  }

  async create(
    userId: string,
    vehicleId: string,
    serviceIds?: string[],
    partIds?: string[],
  ): Promise<ServiceOrder> {
    return this.serviceOrderUseCase.create.execute(
      userId,
      vehicleId,
      serviceIds,
      partIds,
    );
  }

  async getById(id: string): Promise<ServiceOrder | null> {
    return this.serviceOrderUseCase.getById.execute(id);
  }

  async getByServiceOrderNumber(
    serviceOrderNumber: number,
  ): Promise<ServiceOrder | null> {
    return this.serviceOrderUseCase.getByServiceOrderNumber.execute(
      serviceOrderNumber,
    );
  }

  async getAll(
    includeFinished?: boolean,
    orderByStatus?: boolean,
  ): Promise<ServiceOrder[]> {
    return this.serviceOrderUseCase.getAll.execute(
      includeFinished,
      orderByStatus,
    );
  }

  async getByUserId(userId: string): Promise<ServiceOrder[]> {
    return this.serviceOrderUseCase.getByUserId.execute(userId);
  }

  async getByVehicleId(vehicleId: string): Promise<ServiceOrder[]> {
    return this.serviceOrderUseCase.getByVehicleId.execute(vehicleId);
  }

  async update({
    id,
    userId,
    vehicleId,
    partsQuantities,
    serviceIds,
    status,
  }: Readonly<{
    id: string;
    userId: string;
    vehicleId: string;
    partsQuantities?: Array<{ partId: string; quantity: number }>;
    serviceIds?: string[];
    status?: ServiceOrderStatus;
  }>): Promise<ServiceOrder> {
    return this.serviceOrderUseCase.update.execute(
      id,
      userId,
      vehicleId,
      partsQuantities,
      serviceIds,
      status,
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.serviceOrderUseCase.delete.execute(id);
  }

  async getAverageServiceTime(): Promise<AverageServiceTimeResult> {
    return this.serviceOrderUseCase.getAverageServiceTime.execute();
  }
}
