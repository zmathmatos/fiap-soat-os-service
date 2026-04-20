import { describe, it, expect, beforeEach } from "@jest/globals";
import { LoginUseCase } from "../../../../src/application/use-cases/auth/LoginUseCase";
import type { IUserRepository } from "../../../../src/domain/repositories/IUserRepository";
import { User } from "../../../../src/domain/entities/User";
import { AuthService } from "../../../../src/application/services/AuthService";

jest.mock("../../../../src/application/services/AuthService");

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockAuthService: jest.Mocked<AuthService>;

  const testUser = new User({
    id: "1",
    name: "Test User",
    document: "12345678909",
    email: "test@example.com",
    password: "$2a$10$hashedPassword",
    role: "customer",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  });

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

    loginUseCase = new LoginUseCase(mockUserRepository);
    mockAuthService = (loginUseCase as any).authService as jest.Mocked<AuthService>;
  });

  describe("execute", () => {
    it("should successfully login with valid credentials", async () => {
      const email = "test@example.com";
      const password = "password123";
      const token = "jwt-token-123";

      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockAuthService.comparePassword.mockResolvedValue(true);
      mockAuthService.generateToken.mockReturnValue(token);

      const result = await loginUseCase.execute(email, password);

      expect(result).toEqual({
        token,
        user: {
          id: testUser.id,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
        },
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith(
        password,
        testUser.password
      );
      expect(mockAuthService.generateToken).toHaveBeenCalledWith({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });
    });

    it("should throw error when user is not found", async () => {
      const email = "nonexistent@example.com";
      const password = "password123";

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute(email, password)).rejects.toThrow(
        "Invalid email or password"
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockAuthService.comparePassword).not.toHaveBeenCalled();
      expect(mockAuthService.generateToken).not.toHaveBeenCalled();
    });

    it("should throw error when password is invalid", async () => {
      const email = "test@example.com";
      const password = "wrongpassword";

      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockAuthService.comparePassword.mockResolvedValue(false);

      await expect(loginUseCase.execute(email, password)).rejects.toThrow(
        "Invalid email or password"
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith(
        password,
        testUser.password
      );
      expect(mockAuthService.generateToken).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      const email = "test@example.com";
      const password = "password123";
      const error = new Error("Database connection error");

      mockUserRepository.findByEmail.mockRejectedValue(error);

      await expect(loginUseCase.execute(email, password)).rejects.toThrow(
        "Database connection error"
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it("should successfully login admin user", async () => {
      const adminUser = new User({
        id: "2",
        name: "Admin User",
        document: "98765432100",
        email: "admin@example.com",
        password: "$2a$10$hashedAdminPassword",
        role: "admin",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
      const email = "admin@example.com";
      const password = "adminPassword123";
      const token = "admin-jwt-token-123";

      mockUserRepository.findByEmail.mockResolvedValue(adminUser);
      mockAuthService.comparePassword.mockResolvedValue(true);
      mockAuthService.generateToken.mockReturnValue(token);

      const result = await loginUseCase.execute(email, password);

      expect(result).toEqual({
        token,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      });
      expect(result.user.role).toBe("admin");
    });
  });
});
