import { UserUseCase } from "../../application/use-cases/user/UserUseCase";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class UserController {
  private userUseCase: UserUseCase;

  constructor(userRepository: IUserRepository) {
    this.userUseCase = new UserUseCase(userRepository);
  }

  async create({
    name,
    document,
    email,
    password,
  }: Readonly<{
    name: string;
    document: string;
    email: string;
    password: string;
  }>): Promise<User> {
    return this.userUseCase.create.execute(name, document, email, password);
  }

  async getById(id: string): Promise<User | null> {
    return this.userUseCase.getById.execute(id);
  }

  async getAll(): Promise<User[]> {
    return this.userUseCase.getAll.execute();
  }

  async getByDocument(document: string): Promise<User | null> {
    return this.userUseCase.getByDocument.execute(document);
  }

  async update({
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
    return this.userUseCase.update.execute({
      id: id as string,
      name,
      document,
      email,
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.userUseCase.delete.execute(id as string);
  }
}
