import { LoginResponse, LoginUseCase } from "../../application/use-cases/auth/LoginUseCase";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class AuthController {
  private loginUseCase: LoginUseCase;

  constructor(userRepository: IUserRepository) {
    this.loginUseCase = new LoginUseCase(userRepository);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.loginUseCase.execute(email, password);
  }
}
