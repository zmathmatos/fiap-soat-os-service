import { Document } from "../../../../domain/entities/Document";
import type { User } from "../../../../domain/entities/User";
import type { IUserRepository } from "../../../../domain/repositories/IUserRepository";

export class UpdateUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute({
    id,
    name,
    document,
    email,
  }: Readonly<{
    id: string;
    name: string;
    document: string;
    email: string;
  }>): Promise<User> {
    const userDocument = new Document(document);
    if (!userDocument.isValid()) {
      throw new Error("Invalid document");
    }

    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new Error("User not found");
    }

    if (document && document !== existingUser.document) {
      const userWithDocument =
        await this.userRepository.findByDocument(document);
      if (userWithDocument) {
        throw new Error("Another user with this document already exists");
      }
    }

    const updatedUser = await this.userRepository.update(id, {
      name,
      document,
      email,
    });

    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    return updatedUser;
  }
}
