import { CreateServiceOrderUseCase } from "./methods/CreateServiceOrderUseCase";
import { DeleteServiceOrderUseCase } from "./methods/DeleteServiceOrderUseCase";
import { GetAllServiceOrdersUseCase } from "./methods/GetAllServiceOrdersUseCase";
import { GetServiceOrderByIdUseCase } from "./methods/GetServiceOrderByIdUseCase";
import { GetServiceOrderByServiceOrderNumberUseCase } from "./methods/GetServiceOrderByServiceOrderNumberUseCase";
import { GetServiceOrdersByUserIdUseCase } from "./methods/GetServiceOrdersByUserIdUseCase";
import { GetServiceOrdersByVehicleIdUseCase } from "./methods/GetServiceOrdersByVehicleIdUseCase";
import { UpdateServiceOrderUseCase } from "./methods/UpdateServiceOrderUseCase";
import { GetAverageServiceTimeUseCase } from "./methods/GetAverageServiceTimeUseCase";
import type { IServiceOrderRepository } from "../../../domain/repositories/IServiceOrderRepository";
import type { IServiceOrderEventPublisher } from "../../../domain/events/IServiceOrderEventPublisher";

export class ServiceOrderUseCase {
  readonly create: CreateServiceOrderUseCase;
  readonly delete: DeleteServiceOrderUseCase;
  readonly getAll: GetAllServiceOrdersUseCase;
  readonly getById: GetServiceOrderByIdUseCase;
  readonly getByServiceOrderNumber: GetServiceOrderByServiceOrderNumberUseCase;
  readonly getByUserId: GetServiceOrdersByUserIdUseCase;
  readonly getByVehicleId: GetServiceOrdersByVehicleIdUseCase;
  readonly update: UpdateServiceOrderUseCase;
  readonly getAverageServiceTime: GetAverageServiceTimeUseCase;

  private serviceOrderRepository: IServiceOrderRepository;
  private eventPublisher?: IServiceOrderEventPublisher;

  constructor(
    serviceOrderRepository: IServiceOrderRepository,
    eventPublisher?: IServiceOrderEventPublisher,
  ) {
    this.serviceOrderRepository = serviceOrderRepository;
    this.eventPublisher = eventPublisher;

    this.create = this.buildCreateServiceOrderUseCase();
    this.delete = this.buildDeleteServiceOrderUseCase();
    this.getAll = this.buildGetAllServiceOrdersUseCase();
    this.getById = this.buildGetServiceOrderByIdUseCase();
    this.getByServiceOrderNumber = this.buildGetServiceOrderByServiceOrderNumberUseCase();
    this.getByUserId = this.buildGetServiceOrdersByUserIdUseCase();
    this.getByVehicleId = this.buildGetServiceOrdersByVehicleIdUseCase();
    this.update = this.buildUpdateServiceOrderUseCase();
    this.getAverageServiceTime = this.buildGetAverageServiceTimeUseCase();
  }

  buildCreateServiceOrderUseCase(): CreateServiceOrderUseCase {
    return new CreateServiceOrderUseCase(this.serviceOrderRepository, this.eventPublisher);
  }

  buildDeleteServiceOrderUseCase(): DeleteServiceOrderUseCase {
    return new DeleteServiceOrderUseCase(this.serviceOrderRepository);
  }

  buildGetAllServiceOrdersUseCase(): GetAllServiceOrdersUseCase {
    return new GetAllServiceOrdersUseCase(this.serviceOrderRepository);
  }

  buildGetServiceOrderByIdUseCase(): GetServiceOrderByIdUseCase {
    return new GetServiceOrderByIdUseCase(this.serviceOrderRepository);
  }

  buildGetServiceOrderByServiceOrderNumberUseCase(): GetServiceOrderByServiceOrderNumberUseCase {
    return new GetServiceOrderByServiceOrderNumberUseCase(this.serviceOrderRepository);
  }

  buildGetServiceOrdersByUserIdUseCase(): GetServiceOrdersByUserIdUseCase {
    return new GetServiceOrdersByUserIdUseCase(this.serviceOrderRepository);
  }

  buildGetServiceOrdersByVehicleIdUseCase(): GetServiceOrdersByVehicleIdUseCase {
    return new GetServiceOrdersByVehicleIdUseCase(this.serviceOrderRepository);
  }

  buildUpdateServiceOrderUseCase(): UpdateServiceOrderUseCase {
    return new UpdateServiceOrderUseCase(this.serviceOrderRepository);
  }

  buildGetAverageServiceTimeUseCase(): GetAverageServiceTimeUseCase {
    return new GetAverageServiceTimeUseCase(this.serviceOrderRepository);
  }
}
