import { ServiceOrder, ServiceOrderStatus } from "../../src/domain/entities/ServiceOrder";
import type {
  AverageServiceTimeResult,
  IServiceOrderRepository,
} from "../../src/domain/repositories/IServiceOrderRepository";

/**
 * In-memory implementation of IServiceOrderRepository used by the BDD suite
 * (and available to unit tests). It keeps the saga's status transitions honest
 * without needing Postgres/Sequelize.
 */
export class InMemoryServiceOrderRepository implements IServiceOrderRepository {
  private orders = new Map<string, ServiceOrder>();
  private nextNumber = 1;
  private nextId = 1;

  async create(
    serviceOrder: Omit<
      ServiceOrder,
      "id" | "serviceOrderNumber" | "user" | "vehicle" | "parts" | "services" | "createdAt" | "updatedAt"
    >,
    orderNumber: number,
    userId: string,
    vehicleId: string,
  ): Promise<ServiceOrder> {
    const id = `so-${this.nextId++}`;
    const now = new Date();

    const created = new ServiceOrder({
      id,
      user: { id: userId } as ServiceOrder["user"],
      vehicle: { id: vehicleId } as ServiceOrder["vehicle"],
      parts: [],
      services: [],
      serviceOrderNumber: orderNumber ?? this.nextNumber++,
      status: serviceOrder.status ?? ServiceOrderStatus.received,
      createdAt: now,
      updatedAt: now,
    });

    this.orders.set(id, created);
    return created;
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    return this.orders.get(id) ?? null;
  }

  async findByServiceOrderNumber(serviceOrderNumber: number): Promise<ServiceOrder | null> {
    for (const order of this.orders.values()) {
      if (order.serviceOrderNumber === serviceOrderNumber) return order;
    }
    return null;
  }

  async findAll(): Promise<ServiceOrder[]> {
    return Array.from(this.orders.values());
  }

  async findByUserId(userId: string): Promise<ServiceOrder[]> {
    return Array.from(this.orders.values()).filter((o) => o.user.id === userId);
  }

  async findByVehicleId(vehicleId: string): Promise<ServiceOrder[]> {
    return Array.from(this.orders.values()).filter((o) => o.vehicle.id === vehicleId);
  }

  async update(id: string, serviceOrder: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const existing = this.orders.get(id);
    if (!existing) throw new Error("Service Order not found");

    const updated = new ServiceOrder({
      ...existing,
      ...serviceOrder,
      id: existing.id,
      serviceOrderNumber: existing.serviceOrderNumber,
      updatedAt: new Date(),
    });

    this.orders.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }

  async generateServiceOrderNumber(): Promise<number> {
    return this.nextNumber++;
  }

  async getAverageServiceTime(): Promise<AverageServiceTimeResult> {
    return { averageTimeInHours: 0, completedOrders: 0, totalOrders: this.orders.size };
  }
}
