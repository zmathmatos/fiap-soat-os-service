import { describe, it, expect, beforeEach } from "@jest/globals";
import { ServiceOrderUseCase } from "../../../../src/application/use-cases/service-order/ServiceOrderUseCase";
import type { IServiceOrderRepository } from "../../../../src/domain/repositories/IServiceOrderRepository";
import { CreateServiceOrderUseCase } from "../../../../src/application/use-cases/service-order/methods/CreateServiceOrderUseCase";
import { DeleteServiceOrderUseCase } from "../../../../src/application/use-cases/service-order/methods/DeleteServiceOrderUseCase";
import { GetAllServiceOrdersUseCase } from "../../../../src/application/use-cases/service-order/methods/GetAllServiceOrdersUseCase";
import { GetServiceOrderByIdUseCase } from "../../../../src/application/use-cases/service-order/methods/GetServiceOrderByIdUseCase";
import { GetServiceOrderByServiceOrderNumberUseCase } from "../../../../src/application/use-cases/service-order/methods/GetServiceOrderByServiceOrderNumberUseCase";
import { GetServiceOrdersByUserIdUseCase } from "../../../../src/application/use-cases/service-order/methods/GetServiceOrdersByUserIdUseCase";
import { GetServiceOrdersByVehicleIdUseCase } from "../../../../src/application/use-cases/service-order/methods/GetServiceOrdersByVehicleIdUseCase";
import { UpdateServiceOrderUseCase } from "../../../../src/application/use-cases/service-order/methods/UpdateServiceOrderUseCase";
import { GetAverageServiceTimeUseCase } from "../../../../src/application/use-cases/service-order/methods/GetAverageServiceTimeUseCase";

describe("ServiceOrderUseCase", () => {
  let serviceOrderUseCase: ServiceOrderUseCase;
  let mockServiceOrderRepository: jest.Mocked<IServiceOrderRepository>;

  beforeEach(() => {
    mockServiceOrderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByServiceOrderNumber: jest.fn(),
      findByUserId: jest.fn(),
      findByVehicleId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      generateServiceOrderNumber: jest.fn(),
      getAverageServiceTime: jest.fn(),
    };

    serviceOrderUseCase = new ServiceOrderUseCase(mockServiceOrderRepository);
  });

  it("should have create use case", () => {
    expect(serviceOrderUseCase.create).toBeInstanceOf(CreateServiceOrderUseCase);
  });

  it("should have delete use case", () => {
    expect(serviceOrderUseCase.delete).toBeInstanceOf(DeleteServiceOrderUseCase);
  });

  it("should have getAll use case", () => {
    expect(serviceOrderUseCase.getAll).toBeInstanceOf(GetAllServiceOrdersUseCase);
  });

  it("should have getById use case", () => {
    expect(serviceOrderUseCase.getById).toBeInstanceOf(GetServiceOrderByIdUseCase);
  });

  it("should have getByServiceOrderNumber use case", () => {
    expect(serviceOrderUseCase.getByServiceOrderNumber).toBeInstanceOf(
      GetServiceOrderByServiceOrderNumberUseCase
    );
  });

  it("should have getByUserId use case", () => {
    expect(serviceOrderUseCase.getByUserId).toBeInstanceOf(
      GetServiceOrdersByUserIdUseCase
    );
  });

  it("should have getByVehicleId use case", () => {
    expect(serviceOrderUseCase.getByVehicleId).toBeInstanceOf(
      GetServiceOrdersByVehicleIdUseCase
    );
  });

  it("should have update use case", () => {
    expect(serviceOrderUseCase.update).toBeInstanceOf(UpdateServiceOrderUseCase);
  });

  it("should have getAverageServiceTime use case", () => {
    expect(serviceOrderUseCase.getAverageServiceTime).toBeInstanceOf(GetAverageServiceTimeUseCase);
  });
});
