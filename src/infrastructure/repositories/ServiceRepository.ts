import { Service } from "../../domain/entities/Service";
import { IServiceRepository } from "../../domain/repositories/IServiceRepository";
import { ServiceModel } from "../database/sequelize/models/ServiceModel";

export class ServiceRepository implements IServiceRepository {
  private convertToEntity(serviceModel: ServiceModel): Service {
    return new Service({
      ...serviceModel.dataValues,
      price: Number.parseFloat(serviceModel.dataValues.price as any),
    });
  }

  async create(
    service: Omit<Service, "id" | "createdAt" | "updatedAt">
  ): Promise<Service> {
    const createdService = await ServiceModel.create({
      name: service.name,
      serviceCode: service.serviceCode,
      price: service.price,
    });

    return this.convertToEntity(createdService);
  }

  async findById(id: string): Promise<Service | null> {
    const service = await ServiceModel.findByPk(id);

    if (!service) {
      return null;
    }

    return this.convertToEntity(service);
  }

  async findAll(): Promise<Service[]> {
    const services = await ServiceModel.findAll();

    return services.map((service) => this.convertToEntity(service));
  }

  async findByServiceCode(serviceCode: string): Promise<Service | null> {
    const service = await ServiceModel.findOne({
      where: { serviceCode }
    });

    if (!service) {
      return null;
    }

    return this.convertToEntity(service);
  }

  async findByServiceCodes(serviceCodes: string[]): Promise<Service[]> {
    const services = await ServiceModel.findAll({
      where: { serviceCode: serviceCodes }
    });

    return services.map((service) => this.convertToEntity(service));
  }

  async update(
    id: string,
    serviceData: Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>
  ): Promise<Service | null> {
    const service = await ServiceModel.findByPk(id);

    if (!service) {
      return null;
    }

    await service.update(serviceData);

    return this.convertToEntity(service);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await ServiceModel.destroy({
      where: { id },
    });

    return deleted > 0;
  }
}
