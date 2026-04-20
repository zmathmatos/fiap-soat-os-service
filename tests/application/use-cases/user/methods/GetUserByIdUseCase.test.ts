import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetUserByIdUseCase } from "../../../../../src/application/use-cases/user/methods/GetUserByIdUseCase";
import type { IUserRepository } from "../../../../../src/domain/repositories/IUserRepository";
import { User } from "../../../../../src/domain/entities/User";

describe("GetUserByIdUseCase", () => {
  let getUserByIdUseCase: GetUserByIdUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  const firstUserEmail = "user1@email.com";
  const firstUserPassword = "user1_password";

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

    getUserByIdUseCase = new GetUserByIdUseCase(mockUserRepository);
  });

  describe("execute", () => {
    it("should return a user by id", async () => {
      const userId = "1";
      const mockUser = new User({
        id: userId,
        name: "John Doe",
        document: "12345678901",
        role: "customer",
        email: firstUserEmail,
        password: firstUserPassword,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await getUserByIdUseCase.execute(userId);

      expect(result).toEqual(mockUser);
      expect(result.id).toBe(userId);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should throw error when user does not exist", async () => {
      const userId = "999";
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(getUserByIdUseCase.execute(userId)).rejects.toThrow(
        "User not found",
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it("should handle repository errors", async () => {
      const userId = "1";
      const error = new Error("Database error");
      mockUserRepository.findById.mockRejectedValue(error);

      await expect(getUserByIdUseCase.execute(userId)).rejects.toThrow(
        "Database error",
      );
    });
  });
});
