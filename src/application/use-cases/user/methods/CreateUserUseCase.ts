import { Document } from "../../../../domain/entities/Document";
import { User } from "../../../../domain/entities/User";
import type { IUserRepository } from "../../../../domain/repositories/IUserRepository";
import { AuthService } from "../../../services/AuthService";

export class CreateUserUseCase {
  private userRepository: IUserRepository;
  private authService: AuthService;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.authService = new AuthService();
  }

  async execute(name: string, document: string, email: string, password: string): Promise<User> {
    const userDocument = new Document(document);
    if (!userDocument.isValid()) {
      throw new Error("Invalid document");
    }

    const existingUserByDocument = await this.userRepository.findByDocument(document);
    if (existingUserByDocument) {
      throw new Error("User with this document already exists");
    }

    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await this.authService.hashPassword(password);
    const userData = User.create(name, document, email, hashedPassword);
    return await this.userRepository.create(userData);
  }
}
