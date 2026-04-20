import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  private jwtSecret?: string;
  private jwtExpiresIn: SignOptions["expiresIn"];

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn =
      (process.env.JWT_EXPIRES_IN as typeof this.jwtExpiresIn) || "24Hrs";
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(payload: JwtPayload): string {
    if (!this.jwtSecret) {
      throw new Error("JWT secret is missing");
    }

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  verifyToken(token: string): JwtPayload {
    if (!this.jwtSecret) {
      throw new Error("JWT secret is missing");
    }

    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}
