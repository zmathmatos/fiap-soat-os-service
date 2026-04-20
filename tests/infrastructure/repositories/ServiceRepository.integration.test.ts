import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
} from "@jest/globals";
import sequelize from "../../../src/infrastructure/database/sequelize/config";
import ServiceModel from "../../../src/infrastructure/database/sequelize/models/ServiceModel";
import { ServiceOrderModel } from "../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import { ServiceRepository } from "../../../src/infrastructure/repositories/ServiceRepository";
import { Service } from "../../../src/domain/entities/Service";

describe("ServiceRepository Integration Tests", () => {
  let serviceRepository: ServiceRepository;

  beforeEach(async () => {
    // Sincronize o banco de dados para testes
    await sequelize.sync({ force: true });
    serviceRepository = new ServiceRepository();
  });

  afterEach(async () => {
    // Limpe os dados após cada teste
    await ServiceOrderModel.destroy({ where: {} });
    await ServiceModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a new service in the database", async () => {
      const serviceData = Service.create("Oil Change", "SRV-001", 99.99);

      const createdService = await serviceRepository.create(serviceData);

      expect(createdService).toBeInstanceOf(Service);
      expect(createdService.id).toBeDefined();
      expect(createdService.name).toBe("Oil Change");
      expect(createdService.serviceCode).toBe("SRV-001");
      expect(createdService.price).toBe(99.99);
      expect(createdService.createdAt).toBeDefined();
      expect(createdService.updatedAt).toBeDefined();
    });

    it("should persist service to database", async () => {
      const serviceData = Service.create("Tire Rotation", "SRV-002", 49.99);

      const createdService = await serviceRepository.create(serviceData);

      const savedService = await ServiceModel.findByPk(createdService.id);
      expect(savedService).toBeDefined();
      expect(savedService?.serviceCode).toBe("SRV-002");
    });

    it("should create service with zero price", async () => {
      const serviceData = Service.create("Free Inspection", "SRV-FREE", 0);

      const createdService = await serviceRepository.create(serviceData);

      expect(createdService.price).toBe(0);
    });
  });

  describe("findById", () => {
    it("should find a service by id", async () => {
      const serviceData = Service.create("Brake Service", "SRV-003", 149.99);
      const createdService = await serviceRepository.create(serviceData);

      const foundService = await serviceRepository.findById(createdService.id);

      expect(foundService).toBeInstanceOf(Service);
      expect(foundService?.id).toBe(createdService.id);
      expect(foundService?.serviceCode).toBe("SRV-003");
    });

    it("should return null when service does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const foundService = await serviceRepository.findById(uuid);

      expect(foundService).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return empty array when no services exist", async () => {
      const services = await serviceRepository.findAll();

      expect(services).toEqual([]);
    });

    it("should return all services from database", async () => {
      const service1Data = Service.create("Oil Change", "SRV-001", 99.99);
      const service2Data = Service.create("Tire Rotation", "SRV-002", 49.99);
      const service3Data = Service.create("Brake Service", "SRV-003", 149.99);

      await serviceRepository.create(service1Data);
      await serviceRepository.create(service2Data);
      await serviceRepository.create(service3Data);

      const services = await serviceRepository.findAll();

      expect(services).toHaveLength(3);
      expect(services.every((s) => s instanceof Service)).toBe(true);
      expect(services.map((s) => s.serviceCode)).toContain("SRV-001");
      expect(services.map((s) => s.serviceCode)).toContain("SRV-002");
      expect(services.map((s) => s.serviceCode)).toContain("SRV-003");
    });

    it("should return Service instances", async () => {
      const serviceData = Service.create("Alignment", "SRV-004", 79.99);
      await serviceRepository.create(serviceData);

      const services = await serviceRepository.findAll();

      expect(services[0]).toBeInstanceOf(Service);
    });
  });

  describe("findByServiceCode", () => {
    it("should find a service by service code", async () => {
      const serviceData = Service.create(
        "Battery Replacement",
        "SRV-005",
        199.99
      );
      await serviceRepository.create(serviceData);

      const foundService = await serviceRepository.findByServiceCode("SRV-005");

      expect(foundService).toBeInstanceOf(Service);
      expect(foundService?.serviceCode).toBe("SRV-005");
      expect(foundService?.name).toBe("Battery Replacement");
    });

    it("should return null when service code does not exist", async () => {
      const foundService = await serviceRepository.findByServiceCode(
        "NONEXISTENT"
      );

      expect(foundService).toBeNull();
    });

    it("should be case-sensitive for service code search", async () => {
      const serviceData = Service.create(
        "Transmission Service",
        "SRV-006",
        299.99
      );
      await serviceRepository.create(serviceData);

      const foundService = await serviceRepository.findByServiceCode("srv-006");

      expect(foundService).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a service", async () => {
      const serviceData = Service.create("Basic Oil Change", "SRV-007", 79.99);
      const createdService = await serviceRepository.create(serviceData);

      const updatedService = await serviceRepository.update(createdService.id, {
        name: "Premium Oil Change",
        price: 129.99,
      });

      expect(updatedService).toBeInstanceOf(Service);
      expect(updatedService?.name).toBe("Premium Oil Change");
      expect(updatedService?.price).toBe(129.99);
      expect(updatedService?.serviceCode).toBe("SRV-007"); // Should not change
    });

    it("should update only specified fields", async () => {
      const serviceData = Service.create("Wheel Alignment", "SRV-008", 89.99);
      const createdService = await serviceRepository.create(serviceData);

      const updatedService = await serviceRepository.update(createdService.id, {
        price: 99.99,
      });

      expect(updatedService?.price).toBe(99.99);
      expect(updatedService?.name).toBe("Wheel Alignment");
    });

    it("should return null when service does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const updatedService = await serviceRepository.update(uuid, {
        name: "Updated Service",
      });

      expect(updatedService).toBeNull();
    });

    it("should update service code", async () => {
      const serviceData = Service.create("Diagnostic Check", "SRV-009", 59.99);
      const createdService = await serviceRepository.create(serviceData);

      const updatedService = await serviceRepository.update(createdService.id, {
        serviceCode: "SRV-DIAG",
      });

      expect(updatedService?.serviceCode).toBe("SRV-DIAG");
    });

    it("should persist updates to database", async () => {
      const serviceData = Service.create("Engine Tune-Up", "SRV-010", 249.99);
      const createdService = await serviceRepository.create(serviceData);

      await serviceRepository.update(createdService.id, {
        price: 279.99,
      });

      const savedService = await ServiceModel.findByPk(createdService.id);
      expect(savedService?.price).toBe("279.99");
    });

    it("should update price to zero", async () => {
      const serviceData = Service.create("Paid Service", "SRV-011", 99.99);
      const createdService = await serviceRepository.create(serviceData);

      const updatedService = await serviceRepository.update(createdService.id, {
        price: 0,
      });

      expect(updatedService?.price).toBe(0);
    });
  });

  describe("delete", () => {
    it("should delete a service", async () => {
      const serviceData = Service.create("Coolant Flush", "SRV-012", 89.99);
      const createdService = await serviceRepository.create(serviceData);

      const deleted = await serviceRepository.delete(createdService.id);

      expect(deleted).toBe(true);

      const foundService = await ServiceModel.findByPk(createdService.id);
      expect(foundService).toBeNull();
    });

    it("should return false when service does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const deleted = await serviceRepository.delete(uuid);

      expect(deleted).toBe(false);
    });

    it("should remove service from database", async () => {
      const serviceData = Service.create(
        "Air Filter Replacement",
        "SRV-013",
        39.99
      );
      const createdService = await serviceRepository.create(serviceData);

      await serviceRepository.delete(createdService.id);

      const services = await serviceRepository.findAll();
      expect(services).toHaveLength(0);
    });

    it("should only delete specified service", async () => {
      const service1Data = Service.create("Service 1", "SRV-014", 49.99);
      const service2Data = Service.create("Service 2", "SRV-015", 59.99);
      const service3Data = Service.create("Service 3", "SRV-016", 69.99);

      const createdService1 = await serviceRepository.create(service1Data);
      await serviceRepository.create(service2Data);
      await serviceRepository.create(service3Data);

      await serviceRepository.delete(createdService1.id);

      const services = await serviceRepository.findAll();
      expect(services).toHaveLength(2);
      expect(services.map((s) => s.serviceCode)).not.toContain("SRV-014");
    });
  });

  describe("price conversion", () => {
    it("should properly convert decimal prices from database", async () => {
      const serviceData = Service.create("Premium Service", "SRV-017", 123.45);
      const createdService = await serviceRepository.create(serviceData);

      const foundService = await serviceRepository.findById(createdService.id);

      expect(foundService?.price).toBe(123.45);
      expect(typeof foundService?.price).toBe("number");
    });

    it("should handle large price values", async () => {
      const serviceData = Service.create("Major Service", "SRV-018", 9999.99);
      const createdService = await serviceRepository.create(serviceData);

      expect(createdService.price).toBe(9999.99);
    });
  });

  describe("timestamps", () => {
    it("should have createdAt and updatedAt timestamps", async () => {
      const serviceData = Service.create("Test Service", "SRV-019", 49.99);
      const createdService = await serviceRepository.create(serviceData);

      expect(createdService.createdAt).toBeInstanceOf(Date);
      expect(createdService.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt timestamp when service is updated", async () => {
      const serviceData = Service.create("Updatable Service", "SRV-020", 59.99);
      const createdService = await serviceRepository.create(serviceData);
      const originalUpdatedAt = createdService.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedService = await serviceRepository.update(createdService.id, {
        price: 69.99,
      });

      expect(updatedService?.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});
