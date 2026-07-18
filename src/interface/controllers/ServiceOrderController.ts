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

  private static readonly STATUS_BY_BILLING_EVENT: Record<string, ServiceOrderStatus> = {
    "quotation.rejected": ServiceOrderStatus.completed,
    "payment.approved": ServiceOrderStatus.inExecution,
    "payment.failed": ServiceOrderStatus.completed,
  };

  async applyBillingEvent(id: string, event?: string): Promise<ServiceOrder> {
    const newStatus = event
      ? ServiceOrderController.STATUS_BY_BILLING_EVENT[event]
      : undefined;
    if (!newStatus) {
      throw new Error(`Unknown billing event: ${event}`);
    }

    const serviceOrder = await this.getById(id);
    if (!serviceOrder) {
      throw new Error("Service Order not found");
    }

    return this.update({
      id: serviceOrder.id,
      userId: serviceOrder.user.id,
      vehicleId: serviceOrder.vehicle.id,
      partsQuantities: undefined,
      serviceIds: undefined,
      status: newStatus,
    });
  }

  async getAverageServiceTime(): Promise<AverageServiceTimeResult> {
    return this.serviceOrderUseCase.getAverageServiceTime.execute();
  }
}
