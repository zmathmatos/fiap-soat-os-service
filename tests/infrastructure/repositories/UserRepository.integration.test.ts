import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import sequelize from "../../../src/infrastructure/database/sequelize/config";
import UserModel from "../../../src/infrastructure/database/sequelize/models/UserModel";
import { ServiceOrderModel } from "../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import { UserRepository } from "../../../src/infrastructure/repositories/UserRepository";
import { User } from "../../../src/domain/entities/User";

describe("UserRepository Integration Tests", () => {
  const validDocument = "12345678909";
  const otherValidDocument = "12345678000195";
  const userEmail = "user@email.com";
  const userPassword = "user123";

  let userRepository: UserRepository;

  beforeEach(async () => {
    // Sincronize o banco de dados para testes
    await sequelize.sync({ force: true });
    userRepository = new UserRepository();
  });

  afterEach(async () => {
    // Limpe os dados após cada teste
    await ServiceOrderModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a new user in the database", async () => {
      const userData = User.create(
        "John Doe",
        validDocument,
        userEmail,
        userPassword,
      );

      const createdUser = await userRepository.create(userData);

      expect(createdUser).toBeInstanceOf(User);
      expect(createdUser.id).toBeDefined();
      expect(createdUser.name).toBe("John Doe");
      expect(createdUser.document).toBe("12345678909");
      expect(createdUser.role).toBe("customer");
      expect(createdUser.createdAt).toBeDefined();
      expect(createdUser.updatedAt).toBeDefined();
    });
  });

  describe("findById", () => {
    it("should find a user by id", async () => {
      const userData = User.create(
        "Bob Johnson",
        validDocument,
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      const foundUser = await userRepository.findById(createdUser.id);

      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.document).toBe(createdUser.document);
    });

    it("should return null when user does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const foundUser = await userRepository.findById(uuid);

      expect(foundUser).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return empty array when no users exist", async () => {
      const users = await userRepository.findAll();

      expect(users).toEqual([]);
    });

    it("should return all users from database", async () => {
      const user1Data = User.create(
        "Alice Brown",
        "44455566677",
        "user1@email.com",
        "user1_password",
      );
      const user2Data = User.create(
        "Charlie Wilson",
        "88899900011",
        "user2@email.com",
        "user2_password",
      );
      const user3Data = User.create(
        "Diana Prince",
        "22233344455",
        "user3@email.com",
        "user3_password",
      );

      await userRepository.create(user1Data);
      await userRepository.create(user2Data);
      await userRepository.create(user3Data);

      const users = await userRepository.findAll();

      expect(users).toHaveLength(3);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[1]).toBeInstanceOf(User);
      expect(users[2]).toBeInstanceOf(User);
      expect(users[0].document).toBe(user1Data.document);
      expect(users[1].document).toBe(user2Data.document);
      expect(users[2].document).toBe(user3Data.document);
    });
  });

  describe("findByDocument", () => {
    it("should find a user by document", async () => {
      const userData = User.create(
        "Frank Miller",
        validDocument,
        userEmail,
        userPassword,
      );
      await userRepository.create(userData);

      const foundUser = await userRepository.findByDocument(validDocument);

      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser?.document).toBe(validDocument);
      expect(foundUser?.name).toBe(userData.name);
    });

    it("should return null when document does not exist", async () => {
      const foundUser = await userRepository.findByDocument("99999999999");

      expect(foundUser).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const userData = User.create(
        "Henry Ford",
        validDocument,
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      const updatedUser = await userRepository.update(createdUser.id, {
        name: "Henry Ford Jr.",
        document: otherValidDocument,
        email: userEmail,
        password: userPassword,
      });

      expect(updatedUser).toBeInstanceOf(User);
      expect(updatedUser?.name).toBe("Henry Ford Jr.");
      expect(updatedUser?.document).toBe(otherValidDocument);
    });

    it("should return null when user does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const result = await userRepository.update(uuid, {
        name: "New Name",
        document: validDocument,
        email: userEmail,
        password: userPassword,
      });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      const userData = User.create(
        "Karen White",
        validDocument,
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      const deleted = await userRepository.delete(createdUser.id);

      expect(deleted).toBe(true);
    });

    it("should remove user from database", async () => {
      const userData = User.create(
        "Larry Green",
        "22222222222",
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      await userRepository.delete(createdUser.id);

      const userInDb = await UserModel.findByPk(createdUser.id);
      expect(userInDb).toBeNull();
    });

    it("should return false when user does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const deleted = await userRepository.delete(uuid);

      expect(deleted).toBe(false);
    });

    it("should not affect other users when deleting", async () => {
      const user1Data = User.create(
        "Mary Jane",
        "33333333333",
        "user1@email.com",
        "user1_password",
      );
      const user2Data = User.create(
        "Nancy Drew",
        "44444444444",
        "user2@email.com",
        "user2_password",
      );

      const createdUser1 = await userRepository.create(user1Data);
      await userRepository.create(user2Data);

      await userRepository.delete(createdUser1.id);

      const users = await userRepository.findAll();
      expect(users).toHaveLength(1);
      expect(users[0].document).toBe("44444444444");
    });
  });

  describe("complex scenarios", () => {
    it("should handle CRUD operations in sequence", async () => {
      // Create
      const userData = User.create(
        "Oliver Twist",
        validDocument,
        userEmail,
        userPassword,
      );
      const created = await userRepository.create(userData);
      expect(created.id).toBeDefined();

      // Read
      let found = await userRepository.findById(created.id);
      expect(found?.document).toBe(validDocument);

      // Update
      const updated = await userRepository.update(created.id, {
        name: "Oliver Twist Jr.",
        document: otherValidDocument,
        email: userEmail,
        password: userPassword,
      });
      expect(updated?.name).toBe("Oliver Twist Jr.");

      // Verify update
      found = await userRepository.findById(created.id);
      expect(found?.name).toBe("Oliver Twist Jr.");

      // Delete
      const deleted = await userRepository.delete(created.id);
      expect(deleted).toBe(true);

      // Verify deletion
      found = await userRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it("should maintain data integrity with concurrent operations", async () => {
      const user1Data = User.create(
        "Peter Parker",
        validDocument,
        "user1@email.com",
        "user1_password",
      );
      const user2Data = User.create(
        "Quinn Adams",
        otherValidDocument,
        "user2@email.com",
        "user2_password",
      );

      const [created1, created2] = await Promise.all([
        userRepository.create(user1Data),
        userRepository.create(user2Data),
      ]);

      expect(created1.id).not.toBe(created2.id);

      const all = await userRepository.findAll();
      expect(all).toHaveLength(2);
    });
  });
});
