import { describe, it, expect } from "@jest/globals";
import { ServiceOrderPresenter } from "../../../src/interface/presenters/ServiceOrderPresenter";
import { ServiceOrder, ServiceOrderStatus } from "../../../src/domain/entities/ServiceOrder";

const makeServiceOrder = (overrides: Partial<ConstructorParameters<typeof ServiceOrder>[0]> = {}): ServiceOrder => {
  return new ServiceOrder({
    id: "so-001",
    serviceOrderNumber: 1,
    status: ServiceOrderStatus.received,
    user: {
      id: "user-001",
      name: "John Doe",
      document: "12345678900",
      email: "john@example.com",
      password: "hashed_password",
      role: "customer",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    vehicle: {
      id: "vehicle-001",
      licensePlate: "ABC-1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    parts: [
      {
        id: "part-001",
        name: "Oil Filter",
        partNumber: "OF-001",
        brand: "Bosch",
        price: 25.0,
        stockQuantity: 10,
        serviceQuantity: 2,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ],
    services: [
      {
        id: "service-001",
        name: "Oil Change",
        serviceCode: "OC-001",
        price: 50.0,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ],
    startedServiceAt: undefined,
    endedServiceAt: undefined,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });
};

describe("ServiceOrderPresenter", () => {
  describe("toResponse", () => {
    it("should return the correct shape for a service order", () => {
      const serviceOrder = makeServiceOrder();
      const result = ServiceOrderPresenter.toResponse(serviceOrder);

      expect(result).toEqual({
        id: "so-001",
        serviceOrderNumber: 1,
        status: ServiceOrderStatus.received,
        user: {
          id: "user-001",
          name: "John Doe",
          document: "12345678900",
          email: "john@example.com",
        },
        vehicle: {
          id: "vehicle-001",
          licensePlate: "ABC-1234",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
        },
        parts: [
          {
            id: "part-001",
            name: "Oil Filter",
            partNumber: "OF-001",
            brand: "Bosch",
            price: 25.0,
            quantity: 2,
          },
        ],
        services: [
          {
            id: "service-001",
            name: "Oil Change",
            serviceCode: "OC-001",
            price: 50.0,
          },
        ],
        startedServiceAt: null,
        endedServiceAt: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
    });

    it("should not expose user password or role", () => {
      const result = ServiceOrderPresenter.toResponse(makeServiceOrder());
      expect(result.user).not.toHaveProperty("password");
      expect(result.user).not.toHaveProperty("role");
    });

    it("should map part serviceQuantity to quantity", () => {
      const serviceOrder = makeServiceOrder();
      const result = ServiceOrderPresenter.toResponse(serviceOrder);
      expect(result.parts[0].quantity).toBe(2);
    });

    it("should return null for startedServiceAt when undefined", () => {
      const result = ServiceOrderPresenter.toResponse(makeServiceOrder({ startedServiceAt: undefined }));
      expect(result.startedServiceAt).toBeNull();
    });

    it("should return null for endedServiceAt when undefined", () => {
      const result = ServiceOrderPresenter.toResponse(makeServiceOrder({ endedServiceAt: undefined }));
      expect(result.endedServiceAt).toBeNull();
    });

    it("should return the date for startedServiceAt when set", () => {
      const date = new Date("2024-06-01");
      const result = ServiceOrderPresenter.toResponse(makeServiceOrder({ startedServiceAt: date }));
      expect(result.startedServiceAt).toEqual(date);
    });

    it("should return the date for endedServiceAt when set", () => {
      const date = new Date("2024-06-15");
      const result = ServiceOrderPresenter.toResponse(makeServiceOrder({ endedServiceAt: date }));
      expect(result.endedServiceAt).toEqual(date);
    });

    it("should return empty arrays when parts and services are empty", () => {
      const result = ServiceOrderPresenter.toResponse(makeServiceOrder({ parts: [], services: [] }));
      expect(result.parts).toEqual([]);
      expect(result.services).toEqual([]);
    });
  });

  describe("toListResponse", () => {
    it("should return an array of presented service orders", () => {
      const serviceOrders = [
        makeServiceOrder({ id: "so-001", serviceOrderNumber: 1 }),
        makeServiceOrder({ id: "so-002", serviceOrderNumber: 2 }),
      ];

      const result = ServiceOrderPresenter.toListResponse(serviceOrders);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("so-001");
      expect(result[1].id).toBe("so-002");
    });

    it("should return an empty array when given an empty list", () => {
      const result = ServiceOrderPresenter.toListResponse([]);
      expect(result).toEqual([]);
    });

    it("should apply toResponse to each item", () => {
      const serviceOrders = [makeServiceOrder()];
      const result = ServiceOrderPresenter.toListResponse(serviceOrders);

      expect(result[0]).toEqual(ServiceOrderPresenter.toResponse(serviceOrders[0]));
    });
  });
});
