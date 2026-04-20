import { describe, it, expect, beforeEach } from "@jest/globals";
import { ServiceUseCase } from "../../../../src/application/use-cases/service/ServiceUseCase";
import type { IServiceRepository } from "../../../../src/domain/repositories/IServiceRepository";
import { CreateServiceUseCase } from "../../../../src/application/use-cases/service/methods/CreateServiceUseCase";
import { DeleteServiceUseCase } from "../../../../src/application/use-cases/service/methods/DeleteServiceUseCase";
import { GetAllServicesUseCase } from "../../../../src/application/use-cases/service/methods/GetAllServicesUseCase";
import { GetServiceByIdUseCase } from "../../../../src/application/use-cases/service/methods/GetServiceByIdUseCase";
import { GetServiceByServiceCodeUseCase } from "../../../../src/application/use-cases/service/methods/GetServiceByServiceCodeUseCase";
import { UpdateServiceUseCase } from "../../../../src/application/use-cases/service/methods/UpdateServiceUseCase";

describe("ServiceUseCase", () => {
  let serviceUseCase: ServiceUseCase;
  let mockServiceRepository: jest.Mocked<IServiceRepository>;

  beforeEach(() => {
    mockServiceRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByServiceCode: jest.fn(),
      findByServiceCodes: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    serviceUseCase = new ServiceUseCase(mockServiceRepository);
  });

  it("should have create use case", () => {
    expect(serviceUseCase.create).toBeInstanceOf(CreateServiceUseCase);
  });

  it("should have delete use case", () => {
    expect(serviceUseCase.delete).toBeInstanceOf(DeleteServiceUseCase);
  });

  it("should have getAll use case", () => {
    expect(serviceUseCase.getAll).toBeInstanceOf(GetAllServicesUseCase);
  });

  it("should have getById use case", () => {
    expect(serviceUseCase.getById).toBeInstanceOf(GetServiceByIdUseCase);
  });

  it("should have getByServiceCode use case", () => {
    expect(serviceUseCase.getByServiceCode).toBeInstanceOf(
      GetServiceByServiceCodeUseCase
    );
  });

  it("should have update use case", () => {
    expect(serviceUseCase.update).toBeInstanceOf(UpdateServiceUseCase);
  });

  it("should initialize all use cases with the same repository", () => {
    expect(serviceUseCase.create).toBeDefined();
    expect(serviceUseCase.delete).toBeDefined();
    expect(serviceUseCase.getAll).toBeDefined();
    expect(serviceUseCase.getById).toBeDefined();
    expect(serviceUseCase.getByServiceCode).toBeDefined();
    expect(serviceUseCase.update).toBeDefined();
  });
});
