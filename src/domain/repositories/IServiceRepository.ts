import { Service } from "../entities/Service";

export interface IServiceRepository {
  create(
    service: Omit<Service, "id" | "createdAt" | "updatedAt">
  ): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  findAll(): Promise<Service[]>;
  findByServiceCode(serviceCode: string): Promise<Service | null>;
  findByServiceCodes(serviceCodes: string[]): Promise<Service[]>;
  update(
    id: string,
    service: Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>
  ): Promise<Service | null>;
  delete(id: string): Promise<boolean>;
}
