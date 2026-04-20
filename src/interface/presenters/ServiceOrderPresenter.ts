import { ServiceOrder } from "../../domain/entities/ServiceOrder";

export class ServiceOrderPresenter {
  static toResponse(serviceOrder: ServiceOrder) {
    return {
      id: serviceOrder.id,
      serviceOrderNumber: serviceOrder.serviceOrderNumber,
      status: serviceOrder.status,
      user: {
        id: serviceOrder.user.id,
        name: serviceOrder.user.name,
        document: serviceOrder.user.document,
        email: serviceOrder.user.email,
      },
      vehicle: {
        id: serviceOrder.vehicle.id,
        licensePlate: serviceOrder.vehicle.licensePlate,
        brand: serviceOrder.vehicle.brand,
        model: serviceOrder.vehicle.model,
        year: serviceOrder.vehicle.year,
      },
      parts: serviceOrder.parts.map((part) => ({
        id: part.id,
        name: part.name,
        partNumber: part.partNumber,
        brand: part.brand,
        price: part.price,
        quantity: part.serviceQuantity,
      })),
      services: serviceOrder.services.map((service) => ({
        id: service.id,
        name: service.name,
        serviceCode: service.serviceCode,
        price: service.price,
      })),
      startedServiceAt: serviceOrder.startedServiceAt ?? null,
      endedServiceAt: serviceOrder.endedServiceAt ?? null,
      createdAt: serviceOrder.createdAt,
      updatedAt: serviceOrder.updatedAt,
    };
  }

  static toListResponse(serviceOrders: ServiceOrder[]) {
    return serviceOrders.map(ServiceOrderPresenter.toResponse);
  }
}
