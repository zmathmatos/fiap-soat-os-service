import { describe, it, expect } from "@jest/globals";
import { ServicePresenter } from "../../../src/interface/presenters/ServicePresenter";
import { Service } from "../../../src/domain/entities/Service";

const makeService = (overrides: Partial<ConstructorParameters<typeof Service>[0]> = {}): Service => {
  return new Service({
    id: "service-001",
    name: "Oil Change",
    serviceCode: "OC-001",
    price: 50.0,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });
};

describe("ServicePresenter", () => {
  describe("toResponse", () => {
    it("should return the correct shape for a service", () => {
      const result = ServicePresenter.toResponse(makeService());

      expect(result).toEqual({
        id: "service-001",
        name: "Oil Change",
        serviceCode: "OC-001",
        price: 50.0,
      });
    });

    it("should not expose createdAt or updatedAt", () => {
      const result = ServicePresenter.toResponse(makeService());
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
    });
  });

  describe("toListResponse", () => {
    it("should return an array of presented services", () => {
      const services = [
        makeService({ id: "service-001", serviceCode: "OC-001" }),
        makeService({ id: "service-002", serviceCode: "OC-002" }),
      ];

      const result = ServicePresenter.toListResponse(services);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("service-001");
      expect(result[1].id).toBe("service-002");
    });

    it("should return an empty array when given an empty list", () => {
      const result = ServicePresenter.toListResponse([]);
      expect(result).toEqual([]);
    });

    it("should apply toResponse to each item", () => {
      const services = [makeService()];
      const result = ServicePresenter.toListResponse(services);

      expect(result[0]).toEqual(ServicePresenter.toResponse(services[0]));
    });
  });
});
