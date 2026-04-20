import { UserController } from "../../../src/interface/controllers/UserController";
import type { IUserRepository } from "../../../src/domain/repositories/IUserRepository";
import { User } from "../../../src/domain/entities/User";
import { AuthService } from "../../../src/application/services/AuthService";

const makeUser = (
  overrides: Partial<ConstructorParameters<typeof User>[0]> = {},
): User =>
  new User({
    id: "1",
    name: "John Doe",
    document: "12345678909",
    email: "john@doe.com",
    password: "secret123",
    role: "customer",
    ...overrides,
  });

describe("UserController", () => {
  let userController: UserController;
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

    userController = new UserController(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a user and return it", async () => {
      const user = makeUser();

      mockUserRepository.findByDocument.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(user);

      const spyAuthService = jest.spyOn(AuthService.prototype, "hashPassword");
      spyAuthService.mockImplementationOnce((password: string) =>
        Promise.resolve(password),
      );

      const result = await userController.create({
        name: "John Doe",
        document: "12345678909",
        email: "john@doe.com",
        password: "secret123",
      });

      expect(result).toEqual(user);
      expect(mockUserRepository.findByDocument).toHaveBeenCalledWith(
        "12345678909",
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: user.name,
        document: user.document,
        email: user.email,
        password: user.password,
        role: "customer",
      });
    });

    it("should throw an error for an invalid document", async () => {
      await expect(
        userController.create({
          name: "John Doe",
          document: "123",
          email: "john@doe.com",
          password: "secret123",
        }),
      ).rejects.toThrow("Invalid document");

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should throw an error when document is already in use", async () => {
      const existing = makeUser();
      mockUserRepository.findByDocument.mockResolvedValue(existing);

      await expect(
        userController.create({
          name: "Jane Doe",
          document: "12345678909",
          email: "jane@doe.com",
          password: "secret456",
        }),
      ).rejects.toThrow("User with this document already exists");

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return a user by id", async () => {
      const user = makeUser();
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await userController.getById("1");

      expect(result).toEqual(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should throw an error when user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userController.getById("non-existent-id")).rejects.toThrow(
        "User not found",
      );
    });
  });

  describe("getAll", () => {
    it("should return all users", async () => {
      const users = [
        makeUser({ id: "1" }),
        makeUser({
          id: "2",
          document: "12345678000195",
          email: "jane@doe.com",
        }),
      ];
      mockUserRepository.findAll.mockResolvedValue(users);

      const result = await userController.getAll();

      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });

    it("should return an empty array when there are no users", async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await userController.getAll();

      expect(result).toEqual([]);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("getByDocument", () => {
    it("should return a user by document", async () => {
      const user = makeUser();
      mockUserRepository.findByDocument.mockResolvedValue(user);

      const result = await userController.getByDocument("12345678909");

      expect(result).toEqual(user);
      expect(mockUserRepository.findByDocument).toHaveBeenCalledWith(
        "12345678909",
      );
    });

    it("should throw an error when no user matches the document", async () => {
      mockUserRepository.findByDocument.mockResolvedValue(null);

      await expect(userController.getByDocument("00000000000")).rejects.toThrow(
        "User not found",
      );
    });
  });

  describe("update", () => {
    it("should update and return the user", async () => {
      const existing = makeUser();
      const updated = makeUser({
        name: "Jane Doe",
        document: "12345678000195",
      });

      mockUserRepository.findById.mockResolvedValue(existing);
      mockUserRepository.findByDocument.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(updated);

      const result = await userController.update({
        id: "1",
        name: "Jane Doe",
        document: "12345678000195",
        email: "john@doe.com",
      });

      expect(result).toEqual(updated);
      expect(mockUserRepository.update).toHaveBeenCalledWith("1", {
        name: "Jane Doe",
        document: "12345678000195",
        email: "john@doe.com",
      });
    });

    it("should throw an error for an invalid document", async () => {
      await expect(
        userController.update({
          id: "1",
          name: "John Doe",
          document: "123",
          email: "john@doe.com",
        }),
      ).rejects.toThrow("Invalid document");

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("should throw an error when the user to update does not exist", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        userController.update({
          id: "non-existent-id",
          name: "John Doe",
          document: "12345678000195",
          email: "john@doe.com",
        }),
      ).rejects.toThrow("User not found");

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("should throw an error when the new document is already taken by another user", async () => {
      const existing = makeUser({ id: "1", document: "12345678909" });
      const conflicting = makeUser({ id: "2", document: "12345678000195" });

      mockUserRepository.findById.mockResolvedValue(existing);
      mockUserRepository.findByDocument.mockResolvedValue(conflicting);

      await expect(
        userController.update({
          id: "1",
          name: "John Doe",
          document: "12345678000195",
          email: "john@doe.com",
        }),
      ).rejects.toThrow("Another user with this document already exists");

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("should allow updating with the same document", async () => {
      const existing = makeUser();
      const updated = makeUser({ name: "Johnny Doe" });

      mockUserRepository.findById.mockResolvedValue(existing);
      mockUserRepository.update.mockResolvedValue(updated);

      const result = await userController.update({
        id: "1",
        name: "Johnny Doe",
        document: "12345678909",
        email: "john@doe.com",
      });

      expect(result).toEqual(updated);
      expect(mockUserRepository.findByDocument).not.toHaveBeenCalled();
    });

    it("should throw an error when update returns null", async () => {
      const existing = makeUser();

      mockUserRepository.findById.mockResolvedValue(existing);
      mockUserRepository.findByDocument.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(null);

      await expect(
        userController.update({
          id: "1",
          name: "Jane Doe",
          document: "12345678000195",
          email: "john@doe.com",
        }),
      ).rejects.toThrow("Failed to update user");
    });
  });

  describe("delete", () => {
    it("should delete an existing user and return true", async () => {
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userController.delete("1");

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should return false when the delete operation fails", async () => {
      mockUserRepository.delete.mockResolvedValue(false);

      const result = await userController.delete("1");

      expect(result).toBe(false);
      expect(mockUserRepository.delete).toHaveBeenCalledWith("1");
    });
  });
});
