import { describe, it, expect, beforeEach } from "@jest/globals";
import { CreateUserUseCase } from "../../../../../src/application/use-cases/user/methods/CreateUserUseCase";
import type { IUserRepository } from "../../../../../src/domain/repositories/IUserRepository";
import { User } from "../../../../../src/domain/entities/User";

// jest.mock("../../../../../src/application/services/AuthService");

describe("CreateUserUseCase", () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  const userEmail = "user1@email.com";
  const userPassword = "user1_password";

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

    createUserUseCase = new CreateUserUseCase(mockUserRepository);
  });

  describe("execute", () => {
    const validName = "John Doe";
    const validDocument = "12345678909";

    it("should create a user with valid data", async () => {
      const mockUser = new User({
        id: "1",
        name: validName,
        document: validDocument,
        email: userEmail,
        password: userPassword,
        role: "customer",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });

      mockUserRepository.findByDocument.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await createUserUseCase.execute(
        validName,
        validDocument,
        userEmail,
        userPassword,
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByDocument).toHaveBeenCalledWith(
        validDocument,
      );
      expect(mockUserRepository.create).toBeCalledTimes(1);
    });

    it("should throw error for invalid document", async () => {
      const invalidDocument = "123";

      await expect(
        createUserUseCase.execute(
          validName,
          invalidDocument,
          userEmail,
          userPassword,
        ),
      ).rejects.toThrow("Invalid document");

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when user with same document already exists", async () => {
      const existingUser = new User({
        id: "1",
        name: "Jane Doe",
        document: validDocument,
        email: userEmail,
        password: userPassword,
        role: "customer",
      });

      mockUserRepository.findByDocument.mockResolvedValue(existingUser);

      await expect(
        createUserUseCase.execute(
          validName,
          validDocument,
          userEmail,
          userPassword,
        ),
      ).rejects.toThrow("User with this document already exists");

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should handle repository errors during creation", async () => {
      mockUserRepository.findByDocument.mockResolvedValue(null);
      const error = new Error("Database error");
      mockUserRepository.create.mockRejectedValue(error);

      await expect(
        createUserUseCase.execute(
          validName,
          validDocument,
          userEmail,
          userPassword,
        ),
      ).rejects.toThrow("Database error");
    });
  });
});
