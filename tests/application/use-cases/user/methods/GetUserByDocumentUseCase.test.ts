import { describe, it, expect, beforeEach } from "@jest/globals";
import { GetUserByDocumentUseCase } from "../../../../../src/application/use-cases/user/methods/GetUserByDocumentUseCase";
import type { IUserRepository } from "../../../../../src/domain/repositories/IUserRepository";
import { User } from "../../../../../src/domain/entities/User";

describe("GetUserByDocumentUseCase", () => {
  let getUserByDocumentUseCase: GetUserByDocumentUseCase;
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

    getUserByDocumentUseCase = new GetUserByDocumentUseCase(mockUserRepository);
  });

  describe("execute", () => {
    const validDocument = "12345678901";

    it("should return a user by document", async () => {
      const mockUser = new User({
        id: "1",
        name: "John Doe",
        document: validDocument,
        role: "customer",
        email: firstUserEmail,
        password: firstUserPassword,
      });

      mockUserRepository.findByDocument.mockResolvedValue(mockUser);

      const result = await getUserByDocumentUseCase.execute(validDocument);

      expect(result).toEqual(mockUser);
      expect(result.document).toBe(validDocument);
      expect(mockUserRepository.findByDocument).toHaveBeenCalledWith(
        validDocument,
      );
      expect(mockUserRepository.findByDocument).toHaveBeenCalledTimes(1);
    });

    it("should throw error when user does not exist", async () => {
      mockUserRepository.findByDocument.mockResolvedValue(null);

      await expect(
        getUserByDocumentUseCase.execute(validDocument),
      ).rejects.toThrow("User not found");

      expect(mockUserRepository.findByDocument).toHaveBeenCalledWith(
        validDocument,
      );
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database error");
      mockUserRepository.findByDocument.mockRejectedValue(error);

      await expect(
        getUserByDocumentUseCase.execute(validDocument),
      ).rejects.toThrow("Database error");
    });
  });
});
