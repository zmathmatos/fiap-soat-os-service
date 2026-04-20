import { describe, it, expect } from "@jest/globals";
import { VehiclePresenter } from "../../../src/interface/presenters/VehiclePresenter";
import { Vehicle } from "../../../src/domain/entities/Vehicle";

const makeVehicle = (overrides: Partial<ConstructorParameters<typeof Vehicle>[0]> = {}): Vehicle => {
  return new Vehicle({
    id: "vehicle-001",
    licensePlate: "ABC-1234",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });
};

describe("VehiclePresenter", () => {
  describe("toResponse", () => {
    it("should return the correct shape for a vehicle", () => {
      const result = VehiclePresenter.toResponse(makeVehicle());

      expect(result).toEqual({
        id: "vehicle-001",
        licensePlate: "ABC-1234",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
      });
    });

    it("should not expose createdAt or updatedAt", () => {
      const result = VehiclePresenter.toResponse(makeVehicle());
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
    });
  });

  describe("toListResponse", () => {
    it("should return an array of presented vehicles", () => {
      const vehicles = [
        makeVehicle({ id: "vehicle-001", licensePlate: "ABC-1234" }),
        makeVehicle({ id: "vehicle-002", licensePlate: "XYZ-5678" }),
      ];

      const result = VehiclePresenter.toListResponse(vehicles);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("vehicle-001");
      expect(result[1].id).toBe("vehicle-002");
    });

    it("should return an empty array when given an empty list", () => {
      const result = VehiclePresenter.toListResponse([]);
      expect(result).toEqual([]);
    });

    it("should apply toResponse to each item", () => {
      const vehicles = [makeVehicle()];
      const result = VehiclePresenter.toListResponse(vehicles);

      expect(result[0]).toEqual(VehiclePresenter.toResponse(vehicles[0]));
    });
  });
});
