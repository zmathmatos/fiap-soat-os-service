import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserModel } from "../database/sequelize/models/UserModel";

export class UserRepository implements IUserRepository {
  private removePassword(userData: any): User {
    const { password, ...userWithoutPassword } = userData;
    return new User(userWithoutPassword);
  }

  async create(
    user: Omit<User, "id" | "serviceOrders" | "createdAt" | "updatedAt">,
  ): Promise<User> {
    const createdUser = await UserModel.create({
      name: user.name,
      document: user.document,
      email: user.email,
      password: user.password,
    });

    return this.removePassword(createdUser.toJSON());
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id);

    if (!user) {
      return null;
    }

    return this.removePassword(user.toJSON());
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.findAll();

    return users.map((user) => this.removePassword(user.toJSON()));
  }

  async findByDocument(document: string): Promise<User | null> {
    const user = await UserModel.findOne({
      where: { document },
      include: ["serviceOrders"],
    });

    if (!user) {
      return null;
    }

    return this.removePassword(user.toJSON());
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return user.toJSON();
  }

  async update(
    id: string,
    userData: Omit<User, "id" | "createdAt" | "updatedAt" | "role">,
  ): Promise<User | null> {
    const user = await UserModel.findByPk(id, { include: ["serviceOrders"] });

    if (!user) {
      return null;
    }

    await user.update(userData);

    return this.removePassword(user.toJSON());
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await UserModel.destroy({
      where: { id },
      cascade: true,
    });

    return deleted > 0;
  }
}
