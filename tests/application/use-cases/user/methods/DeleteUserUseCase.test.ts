import { describe, it, expect, beforeEach } from "@jest/globals";
import { DeleteUserUseCase } from "../../../../../src/application/use-cases/user/methods/DeleteUserUseCase";
import type { IUserRepository } from "../../../../../src/domain/repositories/IUserRepository";

describe("DeleteUserUseCase", () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

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

    deleteUserUseCase = new DeleteUserUseCase(mockUserRepository);
  });

  describe("execute", () => {
    const userId = "1";

    it("should delete a user successfully", async () => {
      mockUserRepository.delete.mockResolvedValue(true);

      await deleteUserUseCase.execute(userId);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("should return false when delete operation fails", async () => {
      mockUserRepository.delete.mockResolvedValue(false);

      
      expect(await deleteUserUseCase.execute(userId)).toBe(false);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it("should handle repository errors during delete", async () => {
      const error = new Error("Database error");
      mockUserRepository.delete.mockRejectedValue(error);

      await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
