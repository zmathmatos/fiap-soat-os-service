import { describe, it, expect } from "@jest/globals";
import { UserPresenter } from "../../../src/interface/presenters/UserPresenter";
import { User } from "../../../src/domain/entities/User";

const makeUser = (overrides: Partial<ConstructorParameters<typeof User>[0]> = {}): User => {
  return new User({
    id: "user-001",
    name: "John Doe",
    document: "12345678900",
    email: "john@example.com",
    password: "hashed_password",
    role: "customer",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });
};

describe("UserPresenter", () => {
  describe("toResponse", () => {
    it("should return the correct shape for a user", () => {
      const result = UserPresenter.toResponse(makeUser());

      expect(result).toEqual({
        id: "user-001",
        name: "John Doe",
        document: "12345678900",
        email: "john@example.com",
        role: "customer",
      });
    });

    it("should not expose password", () => {
      const result = UserPresenter.toResponse(makeUser());
      expect(result).not.toHaveProperty("password");
    });

    it("should not expose createdAt or updatedAt", () => {
      const result = UserPresenter.toResponse(makeUser());
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
    });


    it("should correctly present an admin user", () => {
      const result = UserPresenter.toResponse(makeUser({ role: "admin" }));
      expect(result.role).toBe("admin");
    });
  });

  describe("toListResponse", () => {
    it("should return an array of presented users", () => {
      const users = [
        makeUser({ id: "user-001", document: "12345678900" }),
        makeUser({ id: "user-002", document: "98765432100" }),
      ];

      const result = UserPresenter.toListResponse(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("user-001");
      expect(result[1].id).toBe("user-002");
    });

    it("should return an empty array when given an empty list", () => {
      const result = UserPresenter.toListResponse([]);
      expect(result).toEqual([]);
    });

    it("should apply toResponse to each item", () => {
      const users = [makeUser()];
      const result = UserPresenter.toListResponse(users);

      expect(result[0]).toEqual(UserPresenter.toResponse(users[0]));
    });
  });
});
