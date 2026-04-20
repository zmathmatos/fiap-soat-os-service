import { Service } from "../../domain/entities/Service";

export class ServicePresenter {
  static toResponse(service: Service) {
    return {
      id: service.id,
      name: service.name,
      serviceCode: service.serviceCode,
      price: service.price,
    };
  }

  static toListResponse(services: Service[]) {
    return services.map(ServicePresenter.toResponse);
  }
}
