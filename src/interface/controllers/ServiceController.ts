import { ServiceUseCase } from "../../application/use-cases/service/ServiceUseCase";
import { Service } from "../../domain/entities/Service";
import { IServiceRepository } from "../../domain/repositories/IServiceRepository";

export class ServiceController {
  private serviceUseCase: ServiceUseCase;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceUseCase = new ServiceUseCase(serviceRepository);
  }

  async create(
    name: string,
    serviceCode: string,
    price: number,
  ): Promise<Service> {
    return this.serviceUseCase.create.execute(name, serviceCode, price);
  }

  async getById(id: string): Promise<Service | null> {
    return this.serviceUseCase.getById.execute(id);
  }

  async getAll(): Promise<Service[]> {
    return this.serviceUseCase.getAll.execute();
  }

  async getServiceByServiceCode(serviceCode: string): Promise<Service | null> {
    return this.serviceUseCase.getByServiceCode.execute(serviceCode);
  }

  async getServiceByServiceCodes(serviceCodes: string[]): Promise<Service[]> {
    return this.serviceUseCase.getByServiceCodes.execute(serviceCodes);
  }

  async update({
    id,
    name,
    serviceCode,
    price,
  }: Readonly<{
    id: string;
    name: string;
    serviceCode: string;
    price: number;
  }>): Promise<Service | null> {
    return this.serviceUseCase.update.execute(id, {
      name,
      serviceCode,
      price,
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.serviceUseCase.delete.execute(id);
  }
}
