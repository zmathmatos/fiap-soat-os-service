import { AuthController } from "../../../src/interface/controllers/AuthController";
import type { IUserRepository } from "../../../src/domain/repositories/IUserRepository";
import { User } from "../../../src/domain/entities/User";
import { AuthService } from "../../../src/application/services/AuthService";

jest.mock("../../../src/application/services/AuthService");

describe("AuthController", () => {
  let authController: AuthController;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockAuthService: jest.Mocked<AuthService>;

  const testUser = new User({
    id: "1",
    name: "John Doe",
    document: "12345678909",
    email: "john@doe.com",
    password: "$2a$10$hashedPassword",
    role: "customer",
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

    authController = new AuthController(mockUserRepository);
    mockAuthService = (authController as any).loginUseCase
      .authService as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return a token and user data on valid credentials", async () => {
      const token = "jwt-token-123";

      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockAuthService.comparePassword.mockResolvedValue(true);
      mockAuthService.generateToken.mockReturnValue(token);

      const result = await authController.login("john@doe.com", "secret123");

      expect(result).toEqual({
        token,
        user: {
          id: testUser.id,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
        },
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("john@doe.com");
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith(
        "secret123",
        testUser.password,
      );
      expect(mockAuthService.generateToken).toHaveBeenCalledWith({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });
    });

    it("should throw an error when user is not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authController.login("unknown@doe.com", "secret123"),
      ).rejects.toThrow("Invalid email or password");

      expect(mockAuthService.comparePassword).not.toHaveBeenCalled();
      expect(mockAuthService.generateToken).not.toHaveBeenCalled();
    });

    it("should throw an error when password is incorrect", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockAuthService.comparePassword.mockResolvedValue(false);

      await expect(
        authController.login("john@doe.com", "wrongpassword"),
      ).rejects.toThrow("Invalid email or password");

      expect(mockAuthService.generateToken).not.toHaveBeenCalled();
    });

    it("should return admin role when logging in as admin", async () => {
      const adminUser = new User({
        id: "2",
        name: "Admin User",
        document: "98765432100",
        email: "admin@doe.com",
        password: "$2a$10$hashedAdminPassword",
        role: "admin",
      });
      const token = "admin-jwt-token-456";

      mockUserRepository.findByEmail.mockResolvedValue(adminUser);
      mockAuthService.comparePassword.mockResolvedValue(true);
      mockAuthService.generateToken.mockReturnValue(token);

      const result = await authController.login("admin@doe.com", "adminpass");

      expect(result.user.role).toBe("admin");
      expect(result.token).toBe(token);
    });

    it("should propagate repository errors", async () => {
      mockUserRepository.findByEmail.mockRejectedValue(
        new Error("Database connection error"),
      );

      await expect(
        authController.login("john@doe.com", "secret123"),
      ).rejects.toThrow("Database connection error");
    });
  });
});
