import type { User } from "../../../../domain/entities/User";
import type { IUserRepository } from "../../../../domain/repositories/IUserRepository";

export class GetUserByDocumentUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(document: string): Promise<User> {
    const user = await this.userRepository.findByDocument(document);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
