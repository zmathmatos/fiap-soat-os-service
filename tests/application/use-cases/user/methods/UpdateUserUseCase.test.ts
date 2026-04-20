import { describe, it, expect, beforeEach } from "@jest/globals";
import { UpdateUserUseCase } from "../../../../../src/application/use-cases/user/methods/UpdateUserUseCase";
import type { IUserRepository } from "../../../../../src/domain/repositories/IUserRepository";
import { User } from "../../../../../src/domain/entities/User";
import { emit } from "node:cluster";

describe("UpdateUserUseCase", () => {
  let updateUserUseCase: UpdateUserUseCase;
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

    updateUserUseCase = new UpdateUserUseCase(mockUserRepository);
  });

  describe("execute", () => {
    const userId = "1";
    const validDocument = "12345678909";
    const existingUser = new User({
      id: userId,
      name: "John Doe",
      document: validDocument,
      role: "customer",
      email: firstUserEmail,
      password: firstUserPassword,
    });

    it("should update user with valid data", async () => {
      const newName = "Jane Doe";
      const newDocument = "12345678000195";
      const updatedUser = new User({
        id: userId,
        name: newName,
        document: newDocument,
        role: "customer",
        email: firstUserEmail,
        password: firstUserPassword,
      });

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByDocument.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await updateUserUseCase.execute({
        id: userId,
        name: newName,
        document: newDocument,
        email: firstUserEmail,
      });

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findByDocument).toHaveBeenCalledWith(
        newDocument,
      );
      expect(mockUserRepository.findByDocument).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        name: newName,
        document: newDocument,
        email: firstUserEmail,
      });
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should throw error for invalid document", async () => {
      const invalidDocument = "123";

      await expect(
        updateUserUseCase.execute({
          id: userId,
          name: "John Doe",
          document: invalidDocument,
          email: existingUser.email,
        }),
      ).rejects.toThrow("Invalid document");

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when user does not exist", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        updateUserUseCase.execute({
          id: userId,
          name: "Jane Doe",
          document: "12345678000195",
          email: "jane@doe.com",
        }),
      ).rejects.toThrow("User not found");

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when document already exists for another user", async () => {
      const newDocument = "12345678000195";
      const anotherUser = new User({
        id: "2",
        name: "Another User",
        document: newDocument,
        role: "customer",
        email: firstUserEmail,
        password: firstUserPassword,
      });

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByDocument.mockResolvedValue(anotherUser);

      await expect(
        updateUserUseCase.execute({
          id: userId,
          name: "Jane Doe",
          document: newDocument,
          email: "jane@doe.com",
        }),
      ).rejects.toThrow("Another user with this document already exists");

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("should allow updating with same document", async () => {
      const updatedUser = new User({
        id: userId,
        name: "Jane Doe",
        document: existingUser.document,
        role: "customer",
        email: firstUserEmail,
        password: firstUserPassword,
      });

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await updateUserUseCase.execute({
        id: userId,
        name: "Jane Doe",
        document: existingUser.document,
        email: firstUserEmail,
      });

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findByDocument).not.toHaveBeenCalled();
    });

    it("should throw error when update fails", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByDocument.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(null);

      await expect(
        updateUserUseCase.execute({
          id: userId,
          name: "Jane Doe",
          document: "12345678000195",
          email: existingUser.email,
        }),
      ).rejects.toThrow("Failed to update user");
    });

    it("should handle repository errors during update", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByDocument.mockResolvedValue(null);
      const error = new Error("Database error");
      mockUserRepository.update.mockRejectedValue(error);

      await expect(
        updateUserUseCase.execute({
          id: userId,
          name: "Jane Doe",
          document: validDocument,
          email: existingUser.email,
        }),
      ).rejects.toThrow("Database error");
    });
  });
});
