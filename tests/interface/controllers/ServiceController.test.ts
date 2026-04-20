import { ServiceController } from "../../../src/interface/controllers/ServiceController";
import type { IServiceRepository } from "../../../src/domain/repositories/IServiceRepository";
import { Service } from "../../../src/domain/entities/Service";

const makeService = (
  overrides: Partial<ConstructorParameters<typeof Service>[0]> = {},
): Service =>
  new Service({
    id: "1",
    name: "Oil Change",
    serviceCode: "SRV-001",
    price: 99.99,
    ...overrides,
  });

describe("ServiceController", () => {
  let serviceController: ServiceController;
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

    serviceController = new ServiceController(mockServiceRepository);
  });

  describe("create", () => {
    it("should create a service and return it", async () => {
      const service = makeService();

      mockServiceRepository.findByServiceCode.mockResolvedValue(null);
      mockServiceRepository.create.mockResolvedValue(service);

      const result = await serviceController.create(
        "Oil Change",
        "SRV-001",
        99.99,
      );

      expect(result).toEqual(service);
      expect(mockServiceRepository.findByServiceCode).toHaveBeenCalledWith(
        "SRV-001",
      );
      expect(mockServiceRepository.create).toHaveBeenCalledWith({
        name: service.name,
        serviceCode: service.serviceCode,
        price: service.price,
      });
    });

    it("should throw an error when name is missing", async () => {
      await expect(
        serviceController.create("", "SRV-001", 99.99),
      ).rejects.toThrow("All fields are required");

      expect(mockServiceRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when serviceCode is missing", async () => {
      await expect(
        serviceController.create("Oil Change", "", 99.99),
      ).rejects.toThrow("All fields are required");

      expect(mockServiceRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when price is negative", async () => {
      await expect(
        serviceController.create("Oil Change", "SRV-001", -10),
      ).rejects.toThrow("Price cannot be negative");

      expect(mockServiceRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when service code is already in use", async () => {
      const existing = makeService();
      mockServiceRepository.findByServiceCode.mockResolvedValue(existing);

      await expect(
        serviceController.create("Another Service", "SRV-001", 49.99),
      ).rejects.toThrow("Service with this service code already exists");

      expect(mockServiceRepository.create).not.toHaveBeenCalled();
    });

    it("should accept zero price", async () => {
      const service = makeService({ price: 0 });

      mockServiceRepository.findByServiceCode.mockResolvedValue(null);
      mockServiceRepository.create.mockResolvedValue(service);

      const result = await serviceController.create("Oil Change", "SRV-001", 0);

      expect(result).toEqual(service);
      expect(result.price).toBe(0);
    });
  });

  describe("getById", () => {
    it("should return a service by id", async () => {
      const service = makeService();
      mockServiceRepository.findById.mockResolvedValue(service);

      const result = await serviceController.getById("1");

      expect(result).toEqual(service);
      expect(mockServiceRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should return null when service is not found", async () => {
      mockServiceRepository.findById.mockResolvedValue(null);

      const result = await serviceController.getById("non-existent-id");

      expect(result).toBeNull();
      expect(mockServiceRepository.findById).toHaveBeenCalledWith(
        "non-existent-id",
      );
    });
  });

  describe("getAll", () => {
    it("should return all services", async () => {
      const services = [
        makeService({ id: "1" }),
        makeService({ id: "2", serviceCode: "SRV-002" }),
      ];
      mockServiceRepository.findAll.mockResolvedValue(services);

      const result = await serviceController.getAll();

      expect(result).toEqual(services);
      expect(result).toHaveLength(2);
      expect(mockServiceRepository.findAll).toHaveBeenCalled();
    });

    it("should return an empty array when there are no services", async () => {
      mockServiceRepository.findAll.mockResolvedValue([]);

      const result = await serviceController.getAll();

      expect(result).toEqual([]);
      expect(mockServiceRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("getServiceByServiceCode", () => {
    it("should return a service by service code", async () => {
      const service = makeService();
      mockServiceRepository.findByServiceCode.mockResolvedValue(service);

      const result = await serviceController.getServiceByServiceCode("SRV-001");

      expect(result).toEqual(service);
      expect(mockServiceRepository.findByServiceCode).toHaveBeenCalledWith(
        "SRV-001",
      );
    });

    it("should return null when no service matches the code", async () => {
      mockServiceRepository.findByServiceCode.mockResolvedValue(null);

      const result = await serviceController.getServiceByServiceCode("SRV-999");

      expect(result).toBeNull();
      expect(mockServiceRepository.findByServiceCode).toHaveBeenCalledWith(
        "SRV-999",
      );
    });

    it("should throw an error when service code is empty", async () => {
      await expect(
        serviceController.getServiceByServiceCode(""),
      ).rejects.toThrow("Service code is required");
    });
  });

  describe("getServiceByServiceCodes", () => {
    it("should return services matching the given codes", async () => {
      const services = [
        makeService({ id: "1", serviceCode: "SRV-001" }),
        makeService({ id: "2", serviceCode: "SRV-002" }),
      ];
      mockServiceRepository.findByServiceCodes.mockResolvedValue(services);

      const result = await serviceController.getServiceByServiceCodes([
        "SRV-001",
        "SRV-002",
      ]);

      expect(result).toEqual(services);
      expect(mockServiceRepository.findByServiceCodes).toHaveBeenCalledWith([
        "SRV-001",
        "SRV-002",
      ]);
    });

    it("should return an empty array when no codes match", async () => {
      mockServiceRepository.findByServiceCodes.mockResolvedValue([]);

      const result = await serviceController.getServiceByServiceCodes([
        "UNKNOWN-001",
      ]);

      expect(result).toEqual([]);
      expect(mockServiceRepository.findByServiceCodes).toHaveBeenCalledWith([
        "UNKNOWN-001",
      ]);
    });
  });

  describe("update", () => {
    it("should update and return the service", async () => {
      const existing = makeService();
      const updated = makeService({
        name: "Premium Oil Change",
        price: 149.99,
      });

      mockServiceRepository.findById.mockResolvedValue(existing);
      mockServiceRepository.update.mockResolvedValue(updated);

      const result = await serviceController.update({
        id: "1",
        name: "Premium Oil Change",
        serviceCode: "SRV-001",
        price: 149.99,
      });

      expect(result).toEqual(updated);
      expect(mockServiceRepository.update).toHaveBeenCalledWith("1", {
        name: "Premium Oil Change",
        serviceCode: "SRV-001",
        price: 149.99,
      });
    });

    it("should throw an error when the service to update does not exist", async () => {
      mockServiceRepository.findById.mockResolvedValue(null);
      mockServiceRepository.update.mockResolvedValue(null);
      await expect(
        serviceController.update({
        id: "non-existent-id",
        name: "Oil Change",
        serviceCode: "SRV-001",
        price: 99.99,
      }),
      ).rejects.toThrow("Service not found");
    });
  });

  describe("delete", () => {
    it("should delete an existing service and return true", async () => {
      const service = makeService();
      mockServiceRepository.findById.mockResolvedValue(service);
      mockServiceRepository.delete.mockResolvedValue(true);

      const result = await serviceController.delete("1");

      expect(result).toBe(true);
      expect(mockServiceRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should throw an error when service id is empty", async () => {
      await expect(serviceController.delete("")).rejects.toThrow(
        "Service ID is required",
      );

      expect(mockServiceRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw an error when service is not found", async () => {
      mockServiceRepository.findById.mockResolvedValue(null);

      await expect(serviceController.delete("non-existent-id")).rejects.toThrow(
        "Service not found",
      );

      expect(mockServiceRepository.delete).not.toHaveBeenCalled();
    });

    it("should return false when the delete operation fails", async () => {
      const service = makeService();
      mockServiceRepository.findById.mockResolvedValue(service);
      mockServiceRepository.delete.mockResolvedValue(false);

      const result = await serviceController.delete("1");

      expect(result).toBe(false);
    });
  });
});
