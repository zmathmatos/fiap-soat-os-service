import { describe, it, expect, beforeEach } from "@jest/globals";
import { AuthService } from "../../../src/application/services/AuthService";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

jest.mock("jsonwebtoken");
jest.mock("bcryptjs");

describe("AuthService", () => {
  let authService: AuthService;
  const mockJwtSecret = "test-secret-key";
  const mockJwtExpiresIn = "1h";
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalJwtExpiresIn = process.env.JWT_EXPIRES_IN;

  beforeEach(() => {
    process.env.JWT_SECRET = mockJwtSecret;
    process.env.JWT_EXPIRES_IN = mockJwtExpiresIn;
    authService = new AuthService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    process.env.JWT_EXPIRES_IN = originalJwtExpiresIn;
  });

  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "password123";
      const hashedPassword = "$2a$10$hashedPassword";

      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await authService.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, "salt");
    });

    it("should handle hashing errors", async () => {
      const password = "password123";
      const error = new Error("Hashing failed");

      (bcrypt.genSalt as jest.Mock).mockRejectedValue(error);

      await expect(authService.hashPassword(password)).rejects.toThrow(
        "Hashing failed",
      );
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching passwords", async () => {
      const password = "password123";
      const hashedPassword = "$2a$10$hashedPassword";

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.comparePassword(
        password,
        hashedPassword,
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it("should return false for non-matching passwords", async () => {
      const password = "password123";
      const hashedPassword = "$2a$10$hashedPassword";

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.comparePassword(
        password,
        hashedPassword,
      );

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it("should handle comparison errors", async () => {
      const password = "password123";
      const hashedPassword = "$2a$10$hashedPassword";
      const error = new Error("Comparison failed");

      (bcrypt.compare as jest.Mock).mockRejectedValue(error);

      await expect(
        authService.comparePassword(password, hashedPassword),
      ).rejects.toThrow("Comparison failed");
    });
  });

  describe("generateToken", () => {
    it("should generate a JWT token with valid payload", () => {
      const payload = {
        userId: "1",
        email: "test@example.com",
        role: "customer",
      };
      const mockToken = "jwt-token-123";

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = authService.generateToken(payload);

      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(payload, mockJwtSecret, {
        expiresIn: mockJwtExpiresIn,
      });
    });

    it("should generate token for admin user", () => {
      const payload = {
        userId: "2",
        email: "admin@example.com",
        role: "admin",
      };
      const mockToken = "admin-jwt-token-123";

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = authService.generateToken(payload);

      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(payload, mockJwtSecret, {
        expiresIn: mockJwtExpiresIn,
      });
    });

    it("should throw error when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET;
      const service = new AuthService();

      const payload = {
        userId: "1",
        email: "test@example.com",
        role: "customer",
      };

      expect(() => service.generateToken(payload)).toThrow(
        "JWT secret is missing",
      );
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const token = "valid-jwt-token";
      const decodedPayload = {
        userId: "1",
        email: "test@example.com",
        role: "customer",
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      const result = authService.verifyToken(token);

      expect(result).toEqual(decodedPayload);
      expect(jwt.verify).toHaveBeenCalledWith(token, mockJwtSecret);
    });

    it("should throw error for invalid token", () => {
      const token = "invalid-jwt-token";

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      expect(() => authService.verifyToken(token)).toThrow(
        "Invalid or expired token",
      );
      expect(jwt.verify).toHaveBeenCalledWith(token, mockJwtSecret);
    });

    it("should throw error for expired token", () => {
      const token = "expired-jwt-token";

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("jwt expired");
      });

      expect(() => authService.verifyToken(token)).toThrow(
        "Invalid or expired token",
      );
      expect(jwt.verify).toHaveBeenCalledWith(token, mockJwtSecret);
    });

    it("should verify admin token successfully", () => {
      const token = "admin-jwt-token";
      const decodedPayload = {
        userId: "2",
        email: "admin@example.com",
        role: "admin",
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      const result = authService.verifyToken(token);

      expect(result).toEqual(decodedPayload);
      expect(result.role).toBe("admin");
    });

    it("should throw error when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET;
      const service = new AuthService();

      const token = "valid-jwt-token";

      expect(() => service.verifyToken(token)).toThrow("JWT secret is missing");
      expect(jwt.verify).not.toHaveBeenCalled();
    });
  });
});
