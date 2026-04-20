import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetAllUsersUseCase } from "../../../../../src/application/use-cases/user/methods/GetAllUsersUseCase";
import type { IUserRepository } from "../../../../../src/domain/repositories/IUserRepository";
import { User } from "../../../../../src/domain/entities/User";

describe("GetAllUsersUseCase", () => {
  let getAllUsersUseCase: GetAllUsersUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  const firstUserEmail = "user1@email.com";
  const firstUserPassword = "user1_password";
  const secondUserEmail = "user1@email.com";
  const secondUserPassword = "user1_password";

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByDocument: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    getAllUsersUseCase = new GetAllUsersUseCase(mockUserRepository);
  });

  describe("execute", () => {
    it("should return all users", async () => {
      const mockUsers = [
        new User({
          id: "1",
          name: "John Doe",
          document: "12345678901",
          role: "customer",
          email: firstUserEmail,
          password: firstUserPassword,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        }),
        new User({
          id: "2",
          name: "Jane Smith",
          document: "98765432109",
          role: "customer",
          email: secondUserEmail,
          password: secondUserPassword,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        }),
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await getAllUsersUseCase.execute();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no users exist", async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await getAllUsersUseCase.execute();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database error");
      mockUserRepository.findAll.mockRejectedValue(error);

      await expect(getAllUsersUseCase.execute()).rejects.toThrow(
        "Database error",
      );
    });
  });
});
