import { VehicleController } from "../../../src/interface/controllers/VehicleController";
import type { IVehicleRepository } from "../../../src/domain/repositories/IVehicleRepository";
import { Vehicle } from "../../../src/domain/entities/Vehicle";

const makeVehicle = (
  overrides: Partial<ConstructorParameters<typeof Vehicle>[0]> = {},
): Vehicle =>
  new Vehicle({
    id: "1",
    licensePlate: "ABC1D23",
    brand: "Toyota",
    model: "Corolla",
    year: 2023,
    ...overrides,
  });

describe("VehicleController", () => {
  let vehicleController: VehicleController;
  let mockVehicleRepository: jest.Mocked<IVehicleRepository>;

  beforeEach(() => {
    mockVehicleRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByLicensePlate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    vehicleController = new VehicleController(mockVehicleRepository as any);
  });

  describe("create", () => {
    it("should create a vehicle and return it", async () => {
      const vehicle = makeVehicle();

      mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);
      mockVehicleRepository.create.mockResolvedValue(vehicle);

      const result = await vehicleController.create(
        "ABC1D23",
        "Toyota",
        "Corolla",
        2023,
      );

      expect(result).toEqual(vehicle);
      expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(
        "ABC1D23",
      );
      expect(mockVehicleRepository.create).toHaveBeenCalledWith({
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
      });
    });

    it("should throw an error for an invalid license plate", async () => {
      await expect(
        vehicleController.create("INVALID", "Toyota", "Corolla", 2023),
      ).rejects.toThrow("Invalid Brazilian license plate");

      expect(mockVehicleRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when license plate is already in use", async () => {
      const existing = makeVehicle();
      mockVehicleRepository.findByLicensePlate.mockResolvedValue(existing);

      await expect(
        vehicleController.create("ABC1D23", "Honda", "Civic", 2022),
      ).rejects.toThrow("Vehicle with this license plate already exists");

      expect(mockVehicleRepository.create).not.toHaveBeenCalled();
    });

    it("should accept old format license plates (LLLNNNN)", async () => {
      const vehicle = makeVehicle({ licensePlate: "XYZ9876" });

      mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);
      mockVehicleRepository.create.mockResolvedValue(vehicle);

      const result = await vehicleController.create(
        "XYZ9876",
        "Toyota",
        "Corolla",
        2023,
      );

      expect(result).toEqual(vehicle);
      expect(mockVehicleRepository.create).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return a vehicle by id", async () => {
      const vehicle = makeVehicle();
      mockVehicleRepository.findById.mockResolvedValue(vehicle);

      const result = await vehicleController.getById("1");

      expect(result).toEqual(vehicle);
      expect(mockVehicleRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should return null when vehicle is not found", async () => {
      mockVehicleRepository.findById.mockResolvedValue(null);

      const result = await vehicleController.getById("non-existent-id");

      expect(result).toBeNull();
      expect(mockVehicleRepository.findById).toHaveBeenCalledWith(
        "non-existent-id",
      );
    });
  });

  describe("getAll", () => {
    it("should return all vehicles", async () => {
      const vehicles = [
        makeVehicle({ id: "1" }),
        makeVehicle({ id: "2", licensePlate: "XYZ9876" }),
      ];
      mockVehicleRepository.findAll.mockResolvedValue(vehicles);

      const result = await vehicleController.getAll();

      expect(result).toEqual(vehicles);
      expect(result).toHaveLength(2);
      expect(mockVehicleRepository.findAll).toHaveBeenCalled();
    });

    it("should return an empty array when there are no vehicles", async () => {
      mockVehicleRepository.findAll.mockResolvedValue([]);

      const result = await vehicleController.getAll();

      expect(result).toEqual([]);
      expect(mockVehicleRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("getVehicleByLicensePlate", () => {
    it("should return a vehicle by license plate", async () => {
      const vehicle = makeVehicle();
      mockVehicleRepository.findByLicensePlate.mockResolvedValue(vehicle);

      const result =
        await vehicleController.getVehicleByLicensePlate("ABC1D23");

      expect(result).toEqual(vehicle);
      expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(
        "ABC1D23",
      );
    });

    it("should return null when no vehicle matches the license plate", async () => {
      mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);

      const result =
        await vehicleController.getVehicleByLicensePlate("ZZZ0000");

      expect(result).toBeNull();
      expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(
        "ZZZ0000",
      );
    });
  });

  describe("update", () => {
    it("should update and return the vehicle", async () => {
      const existing = makeVehicle();
      const updated = makeVehicle({ brand: "Honda", model: "Civic" });

      mockVehicleRepository.findById.mockResolvedValue(existing);
      mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);
      mockVehicleRepository.update.mockResolvedValue(updated);

      const result = await vehicleController.update({
        id: "1",
        licensePlate: "ABC1D23",
        brand: "Honda",
        model: "Civic",
        year: 2023,
      });

      expect(result).toEqual(updated);
      expect(mockVehicleRepository.update).toHaveBeenCalledWith("1", {
        licensePlate: "ABC1D23",
        brand: "Honda",
        model: "Civic",
        year: 2023,
      });
    });

    it("should return null when the vehicle to update does not exist", async () => {
      mockVehicleRepository.findById.mockResolvedValue(null);

      const result = await vehicleController.update({
        id: "non-existent-id",
        licensePlate: "ABC1D23",
        brand: "Toyota",
        model: "Corolla",
        year: 2023,
      });

      expect(result).toBeNull();
      expect(mockVehicleRepository.update).not.toHaveBeenCalled();
    });

    it("should throw an error when the new license plate is already taken by another vehicle", async () => {
      const existing = makeVehicle({ id: "1", licensePlate: "ABC1D23" });
      const conflicting = makeVehicle({ id: "2", licensePlate: "XYZ9876" });

      mockVehicleRepository.findById.mockResolvedValue(existing);
      mockVehicleRepository.findByLicensePlate.mockResolvedValue(conflicting);

      await expect(
        vehicleController.update({
          id: "1",
          licensePlate: "XYZ9876",
          brand: "Toyota",
          model: "Corolla",
          year: 2023,
        }),
      ).rejects.toThrow("Vehicle with this license plate already exists");

      expect(mockVehicleRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete an existing vehicle and return true", async () => {
      const vehicle = makeVehicle();
      mockVehicleRepository.findById.mockResolvedValue(vehicle);
      mockVehicleRepository.delete.mockResolvedValue(true);

      const result = await vehicleController.delete("1");

      expect(result).toBe(true);
      expect(mockVehicleRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should throw an error when vehicle is not found", async () => {
      mockVehicleRepository.findById.mockResolvedValue(null);

      await expect(vehicleController.delete("non-existent-id")).rejects.toThrow(
        "Vehicle not found",
      );

      expect(mockVehicleRepository.delete).not.toHaveBeenCalled();
    });
  });
});
