import type { User } from "../../../../domain/entities/User";
import type { IUserRepository } from "../../../../domain/repositories/IUserRepository";

export class GetUserByIdUseCase {
  private userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
