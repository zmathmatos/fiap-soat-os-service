import { CreateUserUseCase } from "./methods/CreateUserUseCase";
import { DeleteUserUseCase } from "./methods/DeleteUserUseCase";
import { GetAllUsersUseCase } from "./methods/GetAllUsersUseCase";
import { GetUserByDocumentUseCase } from "./methods/GetUserByDocumentUseCase";
import { GetUserByIdUseCase } from "./methods/GetUserByIdUseCase";
import { UpdateUserUseCase } from "./methods/UpdateUserUseCase";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class UserUseCase {
    readonly create: CreateUserUseCase;
    readonly delete: DeleteUserUseCase;
    readonly getAll: GetAllUsersUseCase;
    readonly getByDocument: GetUserByDocumentUseCase;
    readonly getById: GetUserByIdUseCase;
    readonly update: UpdateUserUseCase;

    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;

        this.create = this.buildCreateUserUseCase();
        this.delete = this.buildDeleteUserUseCase();
        this.getAll = this.buildGetAllUsersUseCase();
        this.getByDocument = this.buildGetUserByDocumentUseCase();
        this.getById = this.buildGetUserByIdUseCase();
        this.update = this.buildUpdateUserUseCase();
    }

    buildCreateUserUseCase(): CreateUserUseCase {
        return new CreateUserUseCase(this.userRepository);
    }

    buildDeleteUserUseCase(): DeleteUserUseCase {
        return new DeleteUserUseCase(this.userRepository);
    }

    buildGetAllUsersUseCase(): GetAllUsersUseCase {
        return new GetAllUsersUseCase(this.userRepository);
    }

    buildGetUserByDocumentUseCase(): GetUserByDocumentUseCase {
        return new GetUserByDocumentUseCase(this.userRepository);
    }

    buildGetUserByIdUseCase(): GetUserByIdUseCase {
        return new GetUserByIdUseCase(this.userRepository);
    }

    buildUpdateUserUseCase(): UpdateUserUseCase {
        return new UpdateUserUseCase(this.userRepository);
    }
}