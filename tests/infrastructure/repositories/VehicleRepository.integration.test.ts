import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import sequelize from "../../../src/infrastructure/database/sequelize/config";
import VehicleModel from "../../../src/infrastructure/database/sequelize/models/VehicleModel";
import ServiceOrderModel from "../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import { VehicleRepository } from "../../../src/infrastructure/repositories/VehicleRepository";
import { Vehicle } from "../../../src/domain/entities/Vehicle";

describe("VehicleRepository Integration Tests", () => {
  let vehicleRepository: VehicleRepository;

  beforeEach(async () => {
    // Sincronize o banco de dados para testes
    await sequelize.sync({ force: true });
    vehicleRepository = new VehicleRepository();
  });

  afterEach(async () => {
    // Limpe os dados após cada teste
    await ServiceOrderModel.destroy({ where: {} });
    await VehicleModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a new vehicle in the database", async () => {
      const vehicleData = Vehicle.create("ABC1234", "Toyota", "Camry", 2023);

      const createdVehicle = await vehicleRepository.create(vehicleData);

      expect(createdVehicle).toBeInstanceOf(Vehicle);
      expect(createdVehicle.id).toBeDefined();
      expect(createdVehicle.licensePlate).toBe("ABC1234");
      expect(createdVehicle.brand).toBe("Toyota");
      expect(createdVehicle.model).toBe("Camry");
      expect(createdVehicle.year).toBe(2023);
      expect(createdVehicle.createdAt).toBeDefined();
      expect(createdVehicle.updatedAt).toBeDefined();
    });

    it("should persist vehicle to database", async () => {
      const vehicleData = Vehicle.create("XYZ9876", "Honda", "Civic", 2022);

      const createdVehicle = await vehicleRepository.create(vehicleData);

      const savedVehicle = await VehicleModel.findByPk(createdVehicle.id);
      expect(savedVehicle).toBeDefined();
      expect(savedVehicle?.licensePlate).toBe("XYZ9876");
    });
  });

  describe("findById", () => {
    it("should find a vehicle by id", async () => {
      const vehicleData = Vehicle.create("DEF5678", "Ford", "Mustang", 2021);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      const foundVehicle = await vehicleRepository.findById(createdVehicle.id);

      expect(foundVehicle).toBeInstanceOf(Vehicle);
      expect(foundVehicle?.id).toBe(createdVehicle.id);
      expect(foundVehicle?.licensePlate).toBe("DEF5678");
    });

    it("should return null when vehicle does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const foundVehicle = await vehicleRepository.findById(uuid);

      expect(foundVehicle).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return empty array when no vehicles exist", async () => {
      const vehicles = await vehicleRepository.findAll();

      expect(vehicles).toEqual([]);
    });

    it("should return all vehicles from database", async () => {
      const vehicle1Data = Vehicle.create("AAA1111", "BMW", "X5", 2023);
      const vehicle2Data = Vehicle.create("BBB2222", "Audi", "A4", 2022);
      const vehicle3Data = Vehicle.create(
        "CCC3333",
        "Mercedes",
        "C-Class",
        2021
      );

      await vehicleRepository.create(vehicle1Data);
      await vehicleRepository.create(vehicle2Data);
      await vehicleRepository.create(vehicle3Data);

      const vehicles = await vehicleRepository.findAll();

      expect(vehicles).toHaveLength(3);
      expect(vehicles.every((v) => v instanceof Vehicle)).toBe(true);
      expect(vehicles.map((v) => v.licensePlate)).toContain("AAA1111");
      expect(vehicles.map((v) => v.licensePlate)).toContain("BBB2222");
      expect(vehicles.map((v) => v.licensePlate)).toContain("CCC3333");
    });

    it("should return Vehicle instances", async () => {
      const vehicleData = Vehicle.create("VVV1234", "Volvo", "S90", 2023);
      await vehicleRepository.create(vehicleData);

      const vehicles = await vehicleRepository.findAll();

      expect(vehicles[0]).toBeInstanceOf(Vehicle);
    });
  });

  describe("findByLicensePlate", () => {
    it("should find a vehicle by license plate", async () => {
      const vehicleData = Vehicle.create("GHI9012", "Chevrolet", "Cruze", 2020);
      await vehicleRepository.create(vehicleData);

      const foundVehicle = await vehicleRepository.findByLicensePlate(
        "GHI9012"
      );

      expect(foundVehicle).toBeInstanceOf(Vehicle);
      expect(foundVehicle?.licensePlate).toBe("GHI9012");
      expect(foundVehicle?.brand).toBe("Chevrolet");
    });

    it("should return null when license plate does not exist", async () => {
      const foundVehicle = await vehicleRepository.findByLicensePlate(
        "NONEXISTENT"
      );

      expect(foundVehicle).toBeNull();
    });

    it("should be case-sensitive for license plate search", async () => {
      const vehicleData = Vehicle.create("JKL3456", "Nissan", "Altima", 2021);
      await vehicleRepository.create(vehicleData);

      const foundVehicle = await vehicleRepository.findByLicensePlate(
        "jkl3456"
      );

      expect(foundVehicle).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a vehicle", async () => {
      const vehicleData = Vehicle.create("MNO7890", "Subaru", "Outback", 2019);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      const updatedVehicle = await vehicleRepository.update(createdVehicle.id, {
        brand: "Subaru Updated",
        model: "Outback Premium",
        year: 2024,
      });

      expect(updatedVehicle).toBeInstanceOf(Vehicle);
      expect(updatedVehicle?.brand).toBe("Subaru Updated");
      expect(updatedVehicle?.model).toBe("Outback Premium");
      expect(updatedVehicle?.year).toBe(2024);
      expect(updatedVehicle?.licensePlate).toBe("MNO7890"); // Should not change
    });

    it("should update only specified fields", async () => {
      const vehicleData = Vehicle.create("PQR4567", "Mazda", "CX-5", 2022);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      const updatedVehicle = await vehicleRepository.update(createdVehicle.id, {
        year: 2025,
      });

      expect(updatedVehicle?.year).toBe(2025);
      expect(updatedVehicle?.brand).toBe("Mazda");
      expect(updatedVehicle?.model).toBe("CX-5");
    });

    it("should persist updates to database", async () => {
      const vehicleData = Vehicle.create("STU8901", "Kia", "Sorento", 2021);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      await vehicleRepository.update(createdVehicle.id, {
        brand: "Kia Updated",
      });

      const vehicleInDb = await VehicleModel.findByPk(createdVehicle.id);
      expect(vehicleInDb?.brand).toBe("Kia Updated");
    });

    it("should return null when vehicle does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const result = await vehicleRepository.update(uuid, {
        brand: "New Brand",
      });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a vehicle", async () => {
      const vehicleData = Vehicle.create("VWX2345", "Hyundai", "Elantra", 2023);
      const createdVehicle = await vehicleRepository.create(vehicleData);

      const deleted = await vehicleRepository.delete(createdVehicle.id);

      expect(deleted).toBe(true);
    });

    it("should remove vehicle from database", async () => {
      const vehicleData = Vehicle.create(
        "YZA6789",
        "Volkswagen",
        "Jetta",
        2020
      );
      const createdVehicle = await vehicleRepository.create(vehicleData);

      await vehicleRepository.delete(createdVehicle.id);

      const vehicleInDb = await VehicleModel.findByPk(createdVehicle.id);
      expect(vehicleInDb).toBeNull();
    });

    it("should return false when vehicle does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const deleted = await vehicleRepository.delete(uuid);

      expect(deleted).toBe(false);
    });

    it("should not affect other vehicles when deleting", async () => {
      const vehicle1Data = Vehicle.create("DDD0001", "Fiat", "Strada", 2023);
      const vehicle2Data = Vehicle.create("EEE0002", "Renault", "Duster", 2022);

      const createdVehicle1 = await vehicleRepository.create(vehicle1Data);
      await vehicleRepository.create(vehicle2Data);

      await vehicleRepository.delete(createdVehicle1.id);

      const vehicles = await vehicleRepository.findAll();
      expect(vehicles).toHaveLength(1);
      expect(vehicles[0].licensePlate).toBe("EEE0002");
    });
  });

  describe("complex scenarios", () => {
    it("should handle CRUD operations in sequence", async () => {
      // Create
      const vehicleData = Vehicle.create("FFF0003", "Peugeot", "208", 2021);
      const created = await vehicleRepository.create(vehicleData);
      expect(created.id).toBeDefined();

      // Read
      let found = await vehicleRepository.findById(created.id);
      expect(found?.licensePlate).toBe("FFF0003");

      // Update
      const updated = await vehicleRepository.update(created.id, {
        brand: "Peugeot Sport",
      });
      expect(updated?.brand).toBe("Peugeot Sport");

      // Verify update
      found = await vehicleRepository.findById(created.id);
      expect(found?.brand).toBe("Peugeot Sport");

      // Delete
      const deleted = await vehicleRepository.delete(created.id);
      expect(deleted).toBe(true);

      // Verify deletion
      found = await vehicleRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it("should maintain data integrity with concurrent operations", async () => {
      const vehicle1Data = Vehicle.create("GGG0004", "Citroën", "C3", 2022);
      const vehicle2Data = Vehicle.create("HHH0005", "Tata", "Nexon", 2023);

      const [created1, created2] = await Promise.all([
        vehicleRepository.create(vehicle1Data),
        vehicleRepository.create(vehicle2Data),
      ]);

      expect(created1.id).not.toBe(created2.id);

      const all = await vehicleRepository.findAll();
      expect(all).toHaveLength(2);
    });
  });
});
