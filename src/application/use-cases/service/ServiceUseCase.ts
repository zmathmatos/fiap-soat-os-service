import { CreateServiceUseCase } from "./methods/CreateServiceUseCase";
import { DeleteServiceUseCase } from "./methods/DeleteServiceUseCase";
import { GetAllServicesUseCase } from "./methods/GetAllServicesUseCase";
import { GetServiceByIdUseCase } from "./methods/GetServiceByIdUseCase";
import { GetServiceByServiceCodeUseCase } from "./methods/GetServiceByServiceCodeUseCase";
import { GetServicesByServiceCodeUseCase } from "./methods/GetServicesByServiceCodeUseCase";
import { UpdateServiceUseCase } from "./methods/UpdateServiceUseCase";
import type { IServiceRepository } from "../../../domain/repositories/IServiceRepository";

export class ServiceUseCase {
  readonly create: CreateServiceUseCase;
  readonly delete: DeleteServiceUseCase;
  readonly getAll: GetAllServicesUseCase;
  readonly getById: GetServiceByIdUseCase;
  readonly getByServiceCode: GetServiceByServiceCodeUseCase;
  readonly getByServiceCodes: GetServicesByServiceCodeUseCase;
  readonly update: UpdateServiceUseCase;

  private serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;

    this.create = this.buildCreateServiceUseCase();
    this.delete = this.buildDeleteServiceUseCase();
    this.getAll = this.buildGetAllServicesUseCase();
    this.getById = this.buildGetServiceByIdUseCase();
    this.getByServiceCode = this.buildGetServiceByServiceCodeUseCase();
    this.getByServiceCodes = this.buildGetServicesByServiceCodeUseCase();
    this.update = this.buildUpdateServiceUseCase();
  }

  buildCreateServiceUseCase(): CreateServiceUseCase {
    return new CreateServiceUseCase(this.serviceRepository);
  }

  buildDeleteServiceUseCase(): DeleteServiceUseCase {
    return new DeleteServiceUseCase(this.serviceRepository);
  }

  buildGetAllServicesUseCase(): GetAllServicesUseCase {
    return new GetAllServicesUseCase(this.serviceRepository);
  }

  buildGetServiceByIdUseCase(): GetServiceByIdUseCase {
    return new GetServiceByIdUseCase(this.serviceRepository);
  }

  buildGetServiceByServiceCodeUseCase(): GetServiceByServiceCodeUseCase {
    return new GetServiceByServiceCodeUseCase(this.serviceRepository);
  }

  buildGetServicesByServiceCodeUseCase(): GetServicesByServiceCodeUseCase {
    return new GetServicesByServiceCodeUseCase(this.serviceRepository);
  }

  buildUpdateServiceUseCase(): UpdateServiceUseCase {
    return new UpdateServiceUseCase(this.serviceRepository);
  }
}
