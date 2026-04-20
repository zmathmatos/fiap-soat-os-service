import { describe, it, expect, beforeEach } from "@jest/globals";
import { UserUseCase } from "../../../../src/application/use-cases/user/UserUseCase";
import { CreateUserUseCase } from "../../../../src/application/use-cases/user/methods/CreateUserUseCase";
import { DeleteUserUseCase } from "../../../../src/application/use-cases/user/methods/DeleteUserUseCase";
import { GetAllUsersUseCase } from "../../../../src/application/use-cases/user/methods/GetAllUsersUseCase";
import { GetUserByDocumentUseCase } from "../../../../src/application/use-cases/user/methods/GetUserByDocumentUseCase";
import { GetUserByIdUseCase } from "../../../../src/application/use-cases/user/methods/GetUserByIdUseCase";
import { UpdateUserUseCase } from "../../../../src/application/use-cases/user/methods/UpdateUserUseCase";
import type { IUserRepository } from "../../../../src/domain/repositories/IUserRepository";

describe("UserUseCase", () => {
  let userUseCase: UserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByDocument: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    userUseCase = new UserUseCase(mockUserRepository);
  });

  it("should instantiate all use cases", () => {
    expect(userUseCase.create).toBeInstanceOf(CreateUserUseCase);
    expect(userUseCase.delete).toBeInstanceOf(DeleteUserUseCase);
    expect(userUseCase.getAll).toBeInstanceOf(GetAllUsersUseCase);
    expect(userUseCase.getByDocument).toBeInstanceOf(GetUserByDocumentUseCase);
    expect(userUseCase.getById).toBeInstanceOf(GetUserByIdUseCase);
    expect(userUseCase.update).toBeInstanceOf(UpdateUserUseCase);
  });

  it("should build CreateUserUseCase instance", () => {
    const createUseCase = userUseCase.buildCreateUserUseCase();
    expect(createUseCase).toBeInstanceOf(CreateUserUseCase);
  });

  it("should build DeleteUserUseCase instance", () => {
    const deleteUseCase = userUseCase.buildDeleteUserUseCase();
    expect(deleteUseCase).toBeInstanceOf(DeleteUserUseCase);
  });

  it("should build GetAllUsersUseCase instance", () => {
    const getAllUseCase = userUseCase.buildGetAllUsersUseCase();
    expect(getAllUseCase).toBeInstanceOf(GetAllUsersUseCase);
  });

  it("should build GetUserByDocumentUseCase instance", () => {
    const getByDocumentUseCase = userUseCase.buildGetUserByDocumentUseCase();
    expect(getByDocumentUseCase).toBeInstanceOf(GetUserByDocumentUseCase);
  });

  it("should build GetUserByIdUseCase instance", () => {
    const getByIdUseCase = userUseCase.buildGetUserByIdUseCase();
    expect(getByIdUseCase).toBeInstanceOf(GetUserByIdUseCase);
  });

  it("should build UpdateUserUseCase instance", () => {
    const updateUseCase = userUseCase.buildUpdateUserUseCase();
    expect(updateUseCase).toBeInstanceOf(UpdateUserUseCase);
  });
});
