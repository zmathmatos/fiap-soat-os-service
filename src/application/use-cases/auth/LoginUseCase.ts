import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AuthService } from "../../services/AuthService";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class LoginUseCase {
  private userRepository: IUserRepository;
  private authService: AuthService;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.authService = new AuthService();
  }

  async execute(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await this.authService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = this.authService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
