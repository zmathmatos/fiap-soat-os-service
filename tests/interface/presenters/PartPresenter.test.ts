import { describe, it, expect } from "@jest/globals";
import { PartPresenter } from "../../../src/interface/presenters/PartPresenter";
import { Part } from "../../../src/domain/entities/Part";

const makePart = (overrides: Partial<ConstructorParameters<typeof Part>[0]> = {}): Part => {
  return new Part({
    id: "part-001",
    name: "Oil Filter",
    partNumber: "OF-001",
    brand: "Bosch",
    price: 25.0,
    stockQuantity: 10,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });
};

describe("PartPresenter", () => {
  describe("toResponse", () => {
    it("should return the correct shape for a part", () => {
      const result = PartPresenter.toResponse(makePart());

      expect(result).toEqual({
        id: "part-001",
        name: "Oil Filter",
        partNumber: "OF-001",
        brand: "Bosch",
        price: 25.0,
        stockQuantity: 10,
      });
    });

    it("should not expose createdAt or updatedAt", () => {
      const result = PartPresenter.toResponse(makePart());
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
    });

    it("should not expose serviceQuantity", () => {
      const result = PartPresenter.toResponse(makePart({ serviceQuantity: 3 }));
      expect(result).not.toHaveProperty("serviceQuantity");
    });
  });

  describe("toListResponse", () => {
    it("should return an array of presented parts", () => {
      const parts = [
        makePart({ id: "part-001", partNumber: "OF-001" }),
        makePart({ id: "part-002", partNumber: "OF-002" }),
      ];

      const result = PartPresenter.toListResponse(parts);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("part-001");
      expect(result[1].id).toBe("part-002");
    });

    it("should return an empty array when given an empty list", () => {
      const result = PartPresenter.toListResponse([]);
      expect(result).toEqual([]);
    });

    it("should apply toResponse to each item", () => {
      const parts = [makePart()];
      const result = PartPresenter.toListResponse(parts);

      expect(result[0]).toEqual(PartPresenter.toResponse(parts[0]));
    });
  });
});
