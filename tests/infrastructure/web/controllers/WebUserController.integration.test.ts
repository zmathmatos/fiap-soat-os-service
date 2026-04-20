import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
} from "@jest/globals";
import { Request, Response } from "express";
import sequelize from "../../../../src/infrastructure/database/sequelize/config";
import UserModel from "../../../../src/infrastructure/database/sequelize/models/UserModel";
import { ServiceOrderModel } from "../../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import { WebUserController } from "../../../../src/infrastructure/web/controllers/WebUserController";
import { UserRepository } from "../../../../src/infrastructure/repositories/UserRepository";
import { User } from "../../../../src/domain/entities/User";

describe("WebUserController Integration Tests", () => {
  const validDocument = "12345678909";
  const otherValidDocument = "12345678000195";
  const userEmail = "use1@email.com";
  const userPassword = "user1_password";
  const otherUserEmail = "user2@email.com";
  const otherUserPassword = "user2_password";

  let webUserController: WebUserController;
  let userRepository: UserRepository;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    userRepository = new UserRepository();
    webUserController = new WebUserController(userRepository);

    // Setup mock request and response
    mockRequest = {
      body: {},
      params: {},
    };

    responseData = null;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      }),
      send: jest.fn().mockReturnThis(),
    };
  });

  afterEach(async () => {
    await ServiceOrderModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a user and return 201 status", async () => {
      mockRequest.body = {
        name: "John Doe",
        document: validDocument,
        email: userEmail,
        password: userPassword,
      };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data).toHaveProperty("id");
      expect(responseData.data.name).toBe("John Doe");
      expect(responseData.data.document).toBe(validDocument);
    });

    it("should return 400 when name is missing", async () => {
      mockRequest.body = {
        document: validDocument,
      };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 400 when document is missing", async () => {
      mockRequest.body = {
        name: "Jane Smith",
      };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should persist user to database", async () => {
      mockRequest.body = {
        name: "Bob Johnson",
        document: validDocument,
        email: userEmail,
        password: userPassword,
      };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const userInDb = await UserModel.findOne({
        where: { document: validDocument },
      });
      expect(userInDb).toBeDefined();
      expect(userInDb?.name).toBe("Bob Johnson");
    });
  });

  describe("getById", () => {
    it("should get a user by id and return 200 status", async () => {
      const userData = User.create(
        "Alice Brown",
        validDocument,
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      mockRequest.params = { id: createdUser.id };

      await webUserController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.id).toBe(createdUser.id);
      expect(responseData.data.document).toBe(validDocument);
    });

    it("should return 404 when user does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webUserController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });
  });

  describe("getAll", () => {
    it("should get all users and return 200 status", async () => {
      const user1Data = User.create(
        "Charlie Wilson",
        validDocument,
        userEmail,
        userPassword,
      );
      const user2Data = User.create(
        "Diana Prince",
        otherValidDocument,
        otherUserEmail,
        otherUserPassword,
      );

      await userRepository.create(user1Data);
      await userRepository.create(user2Data);

      await webUserController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(Array.isArray(responseData.data)).toBe(true);
      expect(responseData.data).toHaveLength(2);
      expect(responseData.data[0].name).toBe(user1Data.name);
      expect(responseData.data[0].document).toBe(user1Data.document);
      expect(responseData.data[1].name).toBe(user2Data.name);
      expect(responseData.data[1].document).toBe(user2Data.document);
    });

    it("should return empty array when no users exist", async () => {
      await webUserController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(Array.isArray(responseData.data)).toBe(true);
      expect(responseData.data).toHaveLength(0);
    });
  });

  describe("getByDocument", () => {
    it("should get a user by document and return 200 status", async () => {
      const userData = User.create(
        "Eve Adams",
        validDocument,
        userEmail,
        userPassword,
      );
      await userRepository.create(userData);

      mockRequest.params = { document: validDocument };

      await webUserController.getByDocument(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseData.data.document).toBe(validDocument);
      expect(responseData.data.name).toBe("Eve Adams");
    });

    it("should return 404 when document does not exist", async () => {
      mockRequest.params = { document: "99999999999" };

      await webUserController.getByDocument(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });
  });

  describe("update", () => {
    it("should update a user and return 200 status", async () => {
      const userData = User.create(
        "Frank Miller",
        validDocument,
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      mockRequest.params = { id: createdUser.id };
      mockRequest.body = {
        name: "Frank Miller Jr.",
        document: otherValidDocument,
        email: userEmail,
      };

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.data.name).toBe("Frank Miller Jr.");
      expect(responseData.data.document).toBe(otherValidDocument);
    });

    it("should return 400 when name is missing", async () => {
      const userData = User.create(
        "Grace Lee",
        "77788899900",
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      mockRequest.params = { id: createdUser.id };
      mockRequest.body = {
        document: "00099988877",
      };

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData).toHaveProperty("error");
    });

    it("should return 400 when document is missing", async () => {
      const userData = User.create(
        "Henry Ford",
        "12312312312",
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      mockRequest.params = { id: createdUser.id };
      mockRequest.body = {
        name: "Henry Ford Jr.",
      };

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData).toHaveProperty("error");
    });

    it("should return 400 when user does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };
      mockRequest.body = {
        name: "New Name",
        document: "11111111111",
      };

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData).toHaveProperty("error");
    });

    it("should persist updates to database", async () => {
      const userData = User.create(
        "Irene Clark",
        validDocument,
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      mockRequest.params = { id: createdUser.id };
      mockRequest.body = {
        name: "Irene Clark Updated",
        document: otherValidDocument,
        email: userData.email,
      };

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      const userInDb = await UserModel.findByPk(createdUser.id);
      expect(userInDb?.name).toBe("Irene Clark Updated");
      expect(userInDb?.document).toBe(otherValidDocument);
    });
  });

  describe("delete", () => {
    it("should delete a user and return 204 status", async () => {
      const userData = User.create(
        "Jack Black",
        "78978978978",
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      mockRequest.params = { id: createdUser.id };

      await webUserController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it("should return 404 when user does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      mockRequest.params = { id: uuid };

      await webUserController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData).toHaveProperty("error");
    });

    it("should remove user from database", async () => {
      const userData = User.create(
        "Karen White",
        "11111111111",
        userEmail,
        userPassword,
      );
      const createdUser = await userRepository.create(userData);

      mockRequest.params = { id: createdUser.id };

      await webUserController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      const userInDb = await UserModel.findByPk(createdUser.id);
      expect(userInDb).toBeNull();
    });

    it("should not affect other users when deleting", async () => {
      const user1Data = User.create(
        "Larry Green",
        "22222222222",
        userEmail,
        userPassword,
      );
      const user2Data = User.create(
        "Mary Jane",
        "33333333333",
        otherUserEmail,
        otherUserPassword,
      );

      const createdUser1 = await userRepository.create(user1Data);
      await userRepository.create(user2Data);

      mockRequest.params = { id: createdUser1.id };

      await webUserController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      const users = await userRepository.findAll();
      expect(users).toHaveLength(1);
      expect(users[0].document).toBe("33333333333");
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully in create", async () => {
      // Create a user first
      mockRequest.body = {
        name: "Nancy Drew",
        document: "44444444444",
      };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Try to create with duplicate document
      mockRequest.body = {
        name: "Different Name",
        document: "44444444444",
      };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Should handle the error
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should handle validation errors in create", async () => {
      mockRequest.body = {};

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData).toHaveProperty("error");
    });
  });

  describe("complex scenarios", () => {
    it("should handle multiple user operations in sequence", async () => {
      // Create first user
      mockRequest.body = {
        name: "Oliver Twist",
        document: validDocument,
        email: userEmail,
        password: userPassword,
      };

      await webUserController.create(
        mockRequest as Request,
        mockResponse as Response,
      );

      const userId = responseData.data.id;

      // Get all users
      await webUserController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data).toHaveLength(1);

      // Update user
      mockRequest.params = { id: userId };
      mockRequest.body = {
        name: "Oliver Twist Jr.",
        document: otherValidDocument,
        email: userEmail,
        password: userPassword,
      };

      await webUserController.update(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.name).toBe("Oliver Twist Jr.");
      expect(responseData.data.document).toBe(otherValidDocument);

      // Get by ID
      mockRequest.params = { id: userId };
      mockRequest.body = {};

      await webUserController.getById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data.document).toBe(otherValidDocument);

      // Delete user
      mockRequest.params = { id: userId };

      await webUserController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);

      // Verify deletion
      mockRequest.body = {};
      await webUserController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseData.data).toHaveLength(0);
    });

    it("should maintain data integrity with multiple concurrent operations", async () => {
      await Promise.all([
        webUserController.create(
          {
            body: {
              name: `User 1`,
              document: validDocument,
              email: userEmail,
              password: userPassword,
            },
            params: {},
          } as unknown as Request,
          mockResponse as Response,
        ),
        webUserController.create(
          {
            body: {
              name: `User 2`,
              document: otherValidDocument,
              email: otherUserEmail,
              password: otherUserPassword,
            },
            params: {},
          } as unknown as Request,
          mockResponse as Response,
        ),
      ]);

      const allUsers = await userRepository.findAll();
      expect(allUsers).toHaveLength(2);

      const uniqueDocuments = new Set(allUsers.map((u) => u.document));
      expect(uniqueDocuments.size).toBe(2);
    });
  });
});
