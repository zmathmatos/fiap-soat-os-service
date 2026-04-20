import { User } from "../../domain/entities/User";

export class UserPresenter {
  static toResponse(user: User) {
    return {
      id: user.id,
      name: user.name,
      document: user.document,
      email: user.email,
      role: user.role,
    };
  }

  static toListResponse(users: User[]) {
    return users.map(UserPresenter.toResponse);
  }
}
