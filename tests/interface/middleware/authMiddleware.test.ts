import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import {
  authMiddleware,
  adminMiddleware,
} from "../../../src/interface/middleware/authMiddleware";
import { AuthService } from "../../../src/application/services/AuthService";

jest.mock("../../../src/application/services/AuthService");

describe("authMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as Response["status"],
      json: jest.fn().mockReturnThis() as Response["json"],
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("should successfully authenticate with valid Bearer token", () => {
    const token = "valid-token-123";
    const decodedPayload = {
      userId: "1",
      email: "test@example.com",
      role: "customer",
    };

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    mockAuthService = AuthService.prototype as jest.Mocked<AuthService>;
    mockAuthService.verifyToken = jest
      .fn()
      .mockReturnValue(decodedPayload) as jest.Mocked<
      (typeof AuthService.prototype)["verifyToken"]
    >;

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.user).toEqual(decodedPayload);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should return 401 when no authorization header is provided", () => {
    mockRequest.headers = {};

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 401,
      error: "No token provided",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 when authorization header is malformed (missing Bearer)", () => {
    mockRequest.headers = {
      authorization: "valid-token-123",
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 401,
      error: "Token error",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 when authorization header has wrong scheme", () => {
    mockRequest.headers = {
      authorization: "Basic valid-token-123",
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 401,
      error: "Token malformatted",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 when authorization header has too many parts", () => {
    mockRequest.headers = {
      authorization: "Bearer token extra-part",
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 401,
      error: "Token error",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 when token verification fails", () => {
    const token = "invalid-token";

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    mockAuthService = AuthService.prototype as jest.Mocked<AuthService>;
    mockAuthService.verifyToken = jest.fn().mockImplementation(() => {
      throw new Error("Invalid token");
    }) as jest.Mocked<(typeof AuthService.prototype)["verifyToken"]>;

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 401,
      error: "Invalid token",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should accept Bearer with different casing (bearer, BEARER)", () => {
    const token = "valid-token-123";
    const decodedPayload = {
      userId: "1",
      email: "test@example.com",
      role: "customer",
    };

    mockRequest.headers = {
      authorization: `bearer ${token}`,
    };

    mockAuthService = AuthService.prototype as jest.Mocked<AuthService>;
    mockAuthService.verifyToken = jest
      .fn()
      .mockReturnValue(decodedPayload) as jest.Mocked<
      (typeof AuthService.prototype)["verifyToken"]
    >;

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.user).toEqual(decodedPayload);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should authenticate admin user successfully", () => {
    const token = "admin-token-123";
    const decodedPayload = {
      userId: "2",
      email: "admin@example.com",
      role: "admin",
    };

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    mockAuthService = AuthService.prototype as jest.Mocked<AuthService>;
    mockAuthService.verifyToken = jest
      .fn()
      .mockReturnValue(decodedPayload) as jest.Mocked<
      (typeof AuthService.prototype)["verifyToken"]
    >;

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.user).toEqual(decodedPayload);
    expect(mockRequest.user?.role).toBe("admin");
    expect(mockNext).toHaveBeenCalled();
  });
});

describe("adminMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as Response["status"],
      json: jest.fn().mockReturnThis() as Response["json"],
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("should allow access for admin user", () => {
    mockRequest.user = {
      userId: "1",
      email: "admin@example.com",
      role: "admin",
    };

    adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should return 401 when user is not authenticated", () => {
    mockRequest.user = undefined;

    adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 401,
      error: "User not authenticated",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 403 when user role is not admin", () => {
    mockRequest.user = {
      userId: "2",
      email: "customer@example.com",
      role: "customer",
    };

    adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 403,
      error: "Access denied. Admin role required.",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 403 for invalid roles (e.g., manager)", () => {
    mockRequest.user = {
      userId: "3",
      email: "manager@example.com",
      role: "manager",
    };

    adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 403,
      error: "Access denied. Admin role required.",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
