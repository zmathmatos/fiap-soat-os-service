import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
} from "@jest/globals";
import sequelize from "../../../src/infrastructure/database/sequelize/config";
import {
  ServiceOrderModel,
  ServiceOrderModelPart,
  ServiceOrderModelService,
} from "../../../src/infrastructure/database/sequelize/models/ServiceOrderModel";
import UserModel from "../../../src/infrastructure/database/sequelize/models/UserModel";
import { VehicleModel } from "../../../src/infrastructure/database/sequelize/models/VehicleModel";
import { ServiceModel } from "../../../src/infrastructure/database/sequelize/models/ServiceModel";
import { PartModel } from "../../../src/infrastructure/database/sequelize/models/PartModel";
import { ServiceOrderRepository } from "../../../src/infrastructure/repositories/ServiceOrderRepository";
import { ServiceOrder, ServiceOrderStatus } from "../../../src/domain/entities/ServiceOrder";
import { User } from "../../../src/domain/entities/User";
import { Vehicle } from "../../../src/domain/entities/Vehicle";
import { Service } from "../../../src/domain/entities/Service";
import { Part } from "../../../src/domain/entities/Part";

describe("ServiceOrderRepository Integration Tests", () => {
  let serviceOrderRepository: ServiceOrderRepository;
  let userId: string;
  let vehicleId: string;
  let serviceId: string;
  let partId: string;

  const firstUserEmail = "user1@email.com";
  const firstUserPassword = "user1_password";

  beforeEach(async () => {
    // Sincronize o banco de dados para testes
    await sequelize.sync({ force: true });
    serviceOrderRepository = new ServiceOrderRepository();

    // Criar dados de suporte (user, vehicle, service)
    const userData = User.create(
      "John Doe",
      "12345678909",
      firstUserEmail,
      firstUserPassword,
    );
    const userModel = await UserModel.create({
      name: userData.name,
      document: userData.document,
      email: userData.email,
      password: userData.password,
    });
    userId = userModel.id;

    const vehicleData = Vehicle.create("ABC1234", "Toyota", "Camry", 2023);
    const vehicleModel = await VehicleModel.create({
      licensePlate: vehicleData.licensePlate,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
    });
    vehicleId = vehicleModel.id;

    const serviceData = Service.create("Oil Change", "SRV-001", 99.99);
    const serviceModel = await ServiceModel.create({
      name: serviceData.name,
      serviceCode: serviceData.serviceCode,
      price: serviceData.price,
    });
    serviceId = serviceModel.id;

    const partData = Part.create("Oil Filter", "PRT-001", "Bosch", 29.99, 50);
    const partModel = await PartModel.create({
      name: partData.name,
      partNumber: partData.partNumber,
      brand: partData.brand,
      price: partData.price,
      stockQuantity: partData.stockQuantity,
    });
    partId = partModel.id;
  });

  afterEach(async () => {
    // Limpe os dados após cada teste
    await ServiceOrderModel.destroy({ where: {} });
    await ServiceModel.destroy({ where: {} });
    await PartModel.destroy({ where: {} });
    await VehicleModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("create", () => {
    it("should create a new service order in the database", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      expect(createdServiceOrder).toBeInstanceOf(ServiceOrder);
      expect(createdServiceOrder.id).toBeDefined();
      expect(createdServiceOrder.serviceOrderNumber).toBe(1);
      expect(createdServiceOrder.status).toBe(ServiceOrderStatus.received);
      expect(createdServiceOrder.createdAt).toBeDefined();
      expect(createdServiceOrder.updatedAt).toBeDefined();
    });

    it("should persist service order to database", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const savedServiceOrder = await ServiceOrderModel.findByPk(
        createdServiceOrder.id,
      );
      expect(savedServiceOrder).toBeDefined();
      expect(savedServiceOrder?.serviceOrderNumber).toBe(1);
    });
  });

  describe("findById", () => {
    it("should find a service order by id", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const foundServiceOrder = await serviceOrderRepository.findById(
        createdServiceOrder.id,
      );

      expect(foundServiceOrder).toBeInstanceOf(ServiceOrder);
      expect(foundServiceOrder?.id).toBe(createdServiceOrder.id);
      expect(foundServiceOrder?.serviceOrderNumber).toBe(1);
    });

    it("should return null when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const foundServiceOrder = await serviceOrderRepository.findById(uuid);

      expect(foundServiceOrder).toBeNull();
    });

    it("should include related entities (user, vehicle, services)", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const foundServiceOrder = await serviceOrderRepository.findById(
        createdServiceOrder.id,
      );

      expect(foundServiceOrder?.user).toBeDefined();
      expect(foundServiceOrder?.vehicle).toBeDefined();
    });
  });

  describe("findAll", () => {
    it("should return empty array when no service orders exist", async () => {
      const serviceOrders = await serviceOrderRepository.findAll();

      expect(serviceOrders).toEqual([]);
    });

    it("should return all service orders from database", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      await serviceOrderRepository.create(
        serviceOrderData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );

      const serviceOrders = await serviceOrderRepository.findAll();

      expect(serviceOrders).toHaveLength(2);
      expect(serviceOrders.every((so) => so instanceof ServiceOrder)).toBe(
        true,
      );
    });

    it("should exclude completed and delivered orders when includeFinished is not provided", async () => {
      const baseData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const activeOrder = await serviceOrderRepository.create(
        baseData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );
      const completedOrder = await serviceOrderRepository.create(
        baseData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );
      const deliveredOrder = await serviceOrderRepository.create(
        baseData as any,
        3,
        userId,
        vehicleId,
        [serviceId],
      );

      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.completed },
        { where: { id: completedOrder.id } },
      );
      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.delivered },
        { where: { id: deliveredOrder.id } },
      );

      const serviceOrders = await serviceOrderRepository.findAll();

      expect(serviceOrders).toHaveLength(1);
      expect(serviceOrders[0].id).toBe(activeOrder.id);
    });

    it("should exclude completed and delivered orders when includeFinished is false", async () => {
      const baseData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const activeOrder = await serviceOrderRepository.create(
        baseData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );
      const completedOrder = await serviceOrderRepository.create(
        baseData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );
      const deliveredOrder = await serviceOrderRepository.create(
        baseData as any,
        3,
        userId,
        vehicleId,
        [serviceId],
      );

      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.completed },
        { where: { id: completedOrder.id } },
      );
      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.delivered },
        { where: { id: deliveredOrder.id } },
      );

      const serviceOrders = await serviceOrderRepository.findAll(false);

      expect(serviceOrders).toHaveLength(1);
      expect(serviceOrders[0].id).toBe(activeOrder.id);
    });

    it("should include completed and delivered orders when includeFinished is true", async () => {
      const baseData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const activeOrder = await serviceOrderRepository.create(
        baseData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );
      const completedOrder = await serviceOrderRepository.create(
        baseData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );
      const deliveredOrder = await serviceOrderRepository.create(
        baseData as any,
        3,
        userId,
        vehicleId,
        [serviceId],
      );

      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.completed },
        { where: { id: completedOrder.id } },
      );
      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.delivered },
        { where: { id: deliveredOrder.id } },
      );

      const serviceOrders = await serviceOrderRepository.findAll(true);

      expect(serviceOrders).toHaveLength(3);
      const ids = serviceOrders.map((so) => so.id);
      expect(ids).toContain(activeOrder.id);
      expect(ids).toContain(completedOrder.id);
      expect(ids).toContain(deliveredOrder.id);
    });

    it("should return orders sorted by createdAt when orderByStatus is not provided", async () => {
      const baseData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const first = await serviceOrderRepository.create(
        baseData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );
      const second = await serviceOrderRepository.create(
        baseData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );

      const serviceOrders = await serviceOrderRepository.findAll();

      expect(serviceOrders[0].id).toBe(first.id);
      expect(serviceOrders[1].id).toBe(second.id);
    });

    it("should return orders sorted by createdAt when orderByStatus=false", async () => {
      const baseData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const first = await serviceOrderRepository.create(
        baseData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );
      const second = await serviceOrderRepository.create(
        baseData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );

      const serviceOrders = await serviceOrderRepository.findAll(
        undefined,
        false,
      );

      expect(serviceOrders[0].id).toBe(first.id);
      expect(serviceOrders[1].id).toBe(second.id);
    });

    it("should place inExecution orders before received orders when orderByStatus=true", async () => {
      const baseData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const receivedOrder = await serviceOrderRepository.create(
        baseData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );
      const inExecutionOrder = await serviceOrderRepository.create(
        baseData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );

      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.inExecution },
        { where: { id: inExecutionOrder.id } },
      );

      const serviceOrders = await serviceOrderRepository.findAll(
        undefined,
        true,
      );

      expect(serviceOrders[0].id).toBe(inExecutionOrder.id);
      expect(serviceOrders[1].id).toBe(receivedOrder.id);
    });

    it("should order by status priority: inExecution > awaitingApproval > inDiagnostic > received", async () => {
      const baseData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const receivedOrder = await serviceOrderRepository.create(
        baseData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );
      const inDiagnosticOrder = await serviceOrderRepository.create(
        baseData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );
      const awaitingApprovalOrder = await serviceOrderRepository.create(
        baseData as any,
        3,
        userId,
        vehicleId,
        [serviceId],
      );
      const inExecutionOrder = await serviceOrderRepository.create(
        baseData as any,
        4,
        userId,
        vehicleId,
        [serviceId],
      );

      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.inDiagnostic },
        { where: { id: inDiagnosticOrder.id } },
      );
      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.awaitingApproval },
        { where: { id: awaitingApprovalOrder.id } },
      );
      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.inExecution },
        { where: { id: inExecutionOrder.id } },
      );

      const serviceOrders = await serviceOrderRepository.findAll(
        undefined,
        true,
      );

      const ids = serviceOrders.map((so) => so.id);
      expect(ids[0]).toBe(inExecutionOrder.id);
      expect(ids[1]).toBe(awaitingApprovalOrder.id);
      expect(ids[2]).toBe(inDiagnosticOrder.id);
      expect(ids[3]).toBe(receivedOrder.id);
    });

    it("should place completed and delivered orders last when orderByStatus=true and includeFinished=true", async () => {
      const baseData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const receivedOrder = await serviceOrderRepository.create(
        baseData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );
      const completedOrder = await serviceOrderRepository.create(
        baseData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );
      const deliveredOrder = await serviceOrderRepository.create(
        baseData as any,
        3,
        userId,
        vehicleId,
        [serviceId],
      );
      const inExecutionOrder = await serviceOrderRepository.create(
        baseData as any,
        4,
        userId,
        vehicleId,
        [serviceId],
      );

      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.completed },
        { where: { id: completedOrder.id } },
      );
      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.delivered },
        { where: { id: deliveredOrder.id } },
      );
      await ServiceOrderModel.update(
        { status: ServiceOrderStatus.inExecution },
        { where: { id: inExecutionOrder.id } },
      );

      const serviceOrders = await serviceOrderRepository.findAll(true, true);

      const ids = serviceOrders.map((so) => so.id);
      expect(serviceOrders[0].id).toBe(inExecutionOrder.id);
      expect(serviceOrders[1].id).toBe(receivedOrder.id);
      expect(serviceOrders[2].id).toBe(completedOrder.id);
      expect(serviceOrders[3].id).toBe(deliveredOrder.id);
    });
  });

  describe("findByServiceOrderNumber", () => {
    it("should find a service order by service order number", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const foundServiceOrder =
        await serviceOrderRepository.findByServiceOrderNumber(1);

      expect(foundServiceOrder).toBeInstanceOf(ServiceOrder);
      expect(foundServiceOrder?.serviceOrderNumber).toBe(1);
    });

    it("should return null when service order number does not exist", async () => {
      const foundServiceOrder =
        await serviceOrderRepository.findByServiceOrderNumber(999);

      expect(foundServiceOrder).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should find all service orders by user id", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      await serviceOrderRepository.create(
        serviceOrderData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );

      const serviceOrders = await serviceOrderRepository.findByUserId(userId);

      expect(serviceOrders).toHaveLength(2);
      expect(serviceOrders.every((so) => so instanceof ServiceOrder)).toBe(
        true,
      );
    });

    it("should return empty array when no service orders exist for user", async () => {
      const nonExistentUserId = "12345678-1234-1234-1234-123456789012";
      const serviceOrders =
        await serviceOrderRepository.findByUserId(nonExistentUserId);

      expect(serviceOrders).toEqual([]);
    });
  });

  describe("findByVehicleId", () => {
    it("should find all service orders by vehicle id", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const serviceOrders =
        await serviceOrderRepository.findByVehicleId(vehicleId);

      expect(serviceOrders).toHaveLength(1);
      expect(serviceOrders[0]).toBeInstanceOf(ServiceOrder);
      expect(serviceOrders[0].vehicle.id).toBe(vehicleId);
    });

    it("should return empty array when no service orders exist for vehicle", async () => {
      const nonExistentVehicleId = "12345678-1234-1234-1234-123456789012";
      const serviceOrders =
        await serviceOrderRepository.findByVehicleId(nonExistentVehicleId);

      expect(serviceOrders).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update a service order to inExecution status", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const updatedData = {
        id: createdServiceOrder.id,
        user: createdServiceOrder.user,
        vehicle: createdServiceOrder.vehicle,
        parts: createdServiceOrder.parts,
        services: createdServiceOrder.services,
        serviceOrderNumber: createdServiceOrder.serviceOrderNumber,
        status: ServiceOrderStatus.inExecution,
        createdAt: createdServiceOrder.createdAt,
        updatedAt: createdServiceOrder.updatedAt,
      };

      const updatedServiceOrder = await serviceOrderRepository.update(
        createdServiceOrder.id,
        updatedData as ServiceOrder,
        userId,
        vehicleId,
        [serviceId],
      );

      expect(updatedServiceOrder.status).toBe(ServiceOrderStatus.inExecution);
      expect(updatedServiceOrder.id).toBe(createdServiceOrder.id);
    });

    it("should throw error when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const updatedData = {
        id: uuid,
        status: ServiceOrderStatus.inExecution,
      } as ServiceOrder;

      await expect(
        serviceOrderRepository.update(uuid, updatedData, userId, vehicleId, [
          serviceId,
        ]),
      ).rejects.toThrow();
    });

    it("should persist updates to database", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const updatedData = {
        id: createdServiceOrder.id,
        user: createdServiceOrder.user,
        vehicle: createdServiceOrder.vehicle,
        parts: createdServiceOrder.parts,
        services: createdServiceOrder.services,
        serviceOrderNumber: createdServiceOrder.serviceOrderNumber,
        status: ServiceOrderStatus.completed,
        createdAt: createdServiceOrder.createdAt,
        updatedAt: createdServiceOrder.updatedAt,
      };

      await serviceOrderRepository.update(
        createdServiceOrder.id,
        updatedData as ServiceOrder,
        userId,
        vehicleId,
        [serviceId],
      );

      const savedServiceOrder = await ServiceOrderModel.findByPk(
        createdServiceOrder.id,
      );
      expect(savedServiceOrder?.status).toBe(ServiceOrderStatus.completed);
    });

    it("should add a new service to a service order on update", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
      );

      const secondServiceData = Service.create(
        "Tire Rotation",
        "SRV-002",
        49.99,
      );
      const secondServiceModel = await ServiceModel.create({
        name: secondServiceData.name,
        serviceCode: secondServiceData.serviceCode,
        price: secondServiceData.price,
      });

      const updatedServiceOrder = await serviceOrderRepository.update(
        createdServiceOrder.id,
        { status: ServiceOrderStatus.received },
        userId,
        vehicleId,
        [serviceId, secondServiceModel.id],
      );

      expect(updatedServiceOrder.services).toHaveLength(2);
      const serviceIds = updatedServiceOrder.services!.map((s: any) => s.id);
      expect(serviceIds).toContain(serviceId);
      expect(serviceIds).toContain(secondServiceModel.id);
    });

    it("should not duplicate a service already associated with the service order on update", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      // Pass the same serviceId again — should not create a duplicate
      const updatedServiceOrder = await serviceOrderRepository.update(
        createdServiceOrder.id,
        { status: ServiceOrderStatus.received },
        userId,
        vehicleId,
        [serviceId],
      );

      const associatedServices = await ServiceOrderModelService.findAll({
        where: { serviceOrderId: createdServiceOrder.id },
      });
      expect(associatedServices).toHaveLength(1);
      expect(updatedServiceOrder.services).toHaveLength(1);
    });

    it("should add a new part to a service order on update", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
      );

      const updatedServiceOrder = await serviceOrderRepository.update(
        createdServiceOrder.id,
        { status: ServiceOrderStatus.received },
        userId,
        vehicleId,
        undefined,
        [{ partId, quantity: 1}],
      );

      expect(updatedServiceOrder.parts).toHaveLength(1);
      expect(updatedServiceOrder.parts[0]?.serviceQuantity).toBe(1);
    });

    it("should increment part quantity when the same part is added again on update", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        undefined,
        [partId],
      );

      // Add the same part again — quantity should increment from 1 to 2
      await serviceOrderRepository.update(
        createdServiceOrder.id,
        { status: ServiceOrderStatus.received },
        userId,
        vehicleId,
        undefined,
        [{partId, quantity: 2}],
      );

      const savedPart = await ServiceOrderModelPart.findOne({
        where: { serviceOrderId: createdServiceOrder.id, partId },
      });
      expect(savedPart).not.toBeNull();
      expect(savedPart!.quantity).toBe(3);
    });

    it("should add both services and parts to a service order on update", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
      );

      const updatedServiceOrder = await serviceOrderRepository.update(
        createdServiceOrder.id,
        { status: ServiceOrderStatus.received },
        userId,
        vehicleId,
        [serviceId],
        [{partId, quantity: 1}],
      );

      expect(updatedServiceOrder.services).toHaveLength(1);
      expect(updatedServiceOrder.parts).toHaveLength(1);
      expect(updatedServiceOrder.parts[0]?.serviceQuantity).toBe(1);

      const savedService = await ServiceOrderModelService.findOne({
        where: { serviceOrderId: createdServiceOrder.id },
      });
      expect(savedService).not.toBeNull();
    });

    it("should update service order with different status transitions", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );

      // Transition: received -> inExecution
      let updatedData = {
        id: createdServiceOrder.id,
        user: createdServiceOrder.user,
        vehicle: createdServiceOrder.vehicle,
        parts: createdServiceOrder.parts,
        services: createdServiceOrder.services,
        serviceOrderNumber: createdServiceOrder.serviceOrderNumber,
        status: ServiceOrderStatus.inExecution,
        createdAt: createdServiceOrder.createdAt,
        updatedAt: createdServiceOrder.updatedAt,
      };

      let result = await serviceOrderRepository.update(
        createdServiceOrder.id,
        updatedData as ServiceOrder,
        userId,
        vehicleId,
        [serviceId],
      );

      expect(result.status).toBe(ServiceOrderStatus.inExecution);

      // Transition: inExecution -> completed
      updatedData = {
        id: result.id,
        user: result.user,
        vehicle: result.vehicle,
        parts: result.parts,
        services: result.services,
        serviceOrderNumber: result.serviceOrderNumber,
        status: ServiceOrderStatus.completed,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      result = await serviceOrderRepository.update(
        createdServiceOrder.id,
        updatedData as ServiceOrder,
        userId,
        vehicleId,
        [serviceId],
      );

      expect(result.status).toBe(ServiceOrderStatus.completed);
    });
  });

  describe("delete", () => {
    it("should delete a service order", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const deleted = await serviceOrderRepository.delete(
        createdServiceOrder.id,
      );

      expect(deleted).toBe(true);
    });

    it("should remove service order from database", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      await serviceOrderRepository.delete(createdServiceOrder.id);

      const savedServiceOrder = await ServiceOrderModel.findByPk(
        createdServiceOrder.id,
      );
      expect(savedServiceOrder).toBeNull();
    });

    it("should return false when service order does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789012";
      const deleted = await serviceOrderRepository.delete(uuid);

      expect(deleted).toBe(false);
    });
  });

  describe("parseServiceOrder", () => {
    it("should return a ServiceOrder instance", async () => {
      const created = await serviceOrderRepository.create(
        { status: ServiceOrderStatus.received } as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const result = await serviceOrderRepository.findById(created.id);

      expect(result).toBeInstanceOf(ServiceOrder);
    });

    it("should return an empty parts array when the service order has no parts", async () => {
      const created = await serviceOrderRepository.create(
        { status: ServiceOrderStatus.received } as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      const result = await serviceOrderRepository.findById(created.id);

      expect(result!.parts).toEqual([]);
    });

    it("should map ServiceOrderModelPart.quantity to serviceQuantity on each part", async () => {
      const created = await serviceOrderRepository.create(
        { status: ServiceOrderStatus.received } as any,
        1,
        userId,
        vehicleId,
        undefined,
        [partId],
      );

      const result = await serviceOrderRepository.findById(created.id);

      expect(result!.parts).toHaveLength(1);
      expect((result!.parts[0] as any).serviceQuantity).toBe(1);
    });

    it("should reflect the updated quantity in serviceQuantity after incrementing", async () => {
      const created = await serviceOrderRepository.create(
        { status: ServiceOrderStatus.received } as any,
        1,
        userId,
        vehicleId,
        undefined,
        [partId],
      );

      await serviceOrderRepository.update(
        created.id,
        { status: ServiceOrderStatus.received },
        userId,
        vehicleId,
        undefined,
        [{partId, quantity: 2}],
      );

      const result = await serviceOrderRepository.findById(created.id);

      expect(result!.parts).toHaveLength(1);
      expect(result!.parts[0]?.serviceQuantity).toBe(3);
    });

    it("should not include ServiceOrderModelPart as a nested property on each part", async () => {
      const created = await serviceOrderRepository.create(
        { status: ServiceOrderStatus.received } as any,
        1,
        userId,
        vehicleId,
        undefined,
        [partId],
      );

      const result = await serviceOrderRepository.findById(created.id);

      expect((result!.parts[0] as any).ServiceOrderModelPart).toBeUndefined();
    });

    it("should preserve part fields (name, price) alongside serviceQuantity", async () => {
      const created = await serviceOrderRepository.create(
        { status: ServiceOrderStatus.received } as any,
        1,
        userId,
        vehicleId,
        undefined,
        [partId],
      );

      const result = await serviceOrderRepository.findById(created.id);

      const part = result!.parts[0] as any;
      expect(part.name).toBe("Oil Filter");
      expect(part.price).toBe("29.99");
      expect(part.serviceQuantity).toBe(1);
    });

    it("should handle multiple parts each with their own serviceQuantity", async () => {
      const secondPartData = Part.create("Brake Pad", "PRT-002", "Bosch", 59.99, 30);
      const secondPartModel = await PartModel.create({
        name: secondPartData.name,
        partNumber: secondPartData.partNumber,
        brand: secondPartData.brand,
        price: secondPartData.price,
        stockQuantity: secondPartData.stockQuantity,
      });

      const created = await serviceOrderRepository.create(
        { status: ServiceOrderStatus.received } as any,
        1,
        userId,
        vehicleId,
        undefined,
        [partId, secondPartModel.id],
      );

      // Add the first part again to make its quantity = 2
      await serviceOrderRepository.update(
        created.id,
        { status: ServiceOrderStatus.received },
        userId,
        vehicleId,
        undefined,
        [{partId, quantity: 1}],
      );

      const result = await serviceOrderRepository.findById(created.id);

      expect(result!.parts).toHaveLength(2);
      const firstPart = (result!.parts as any[]).find((p) => p.id === partId);
      const secondPart = (result!.parts as any[]).find(
        (p) => p.id === secondPartModel.id,
      );
      expect(firstPart.serviceQuantity).toBe(2);
      expect(secondPart.serviceQuantity).toBe(1);
    });
  });

  describe("getAverageServiceTime", () => {
    it("should return zero average when no completed orders exist", async () => {
      const result = await serviceOrderRepository.getAverageServiceTime();

      expect(result.averageTimeInHours).toBe(0);
      expect(result.completedOrders).toBe(0);
      expect(result.totalOrders).toBe(0);
    });

    it("should calculate average service time for completed orders", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      // Create a service order
      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      // Create completed order with start and end times
      const now = new Date();
      const startedAt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const endedAt = new Date(now.getTime());

      // Update to completed with timestamps
      const updatedOrder = await ServiceOrderModel.findByPk(
        createdServiceOrder.id,
      );
      if (updatedOrder) {
        updatedOrder.status = ServiceOrderStatus.completed;
        updatedOrder.startedServiceAt = startedAt;
        updatedOrder.endedServiceAt = endedAt;
        await updatedOrder.save();
      }

      const result = await serviceOrderRepository.getAverageServiceTime();

      expect(result.totalOrders).toBe(1);
      expect(result.completedOrders).toBe(1);
      expect(result.averageTimeInHours).toBeGreaterThan(0);
    });

    it("should return correct total orders count", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      // Create 3 service orders
      await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      await serviceOrderRepository.create(
        serviceOrderData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );

      await serviceOrderRepository.create(
        serviceOrderData as any,
        3,
        userId,
        vehicleId,
        [serviceId],
      );

      const result = await serviceOrderRepository.getAverageServiceTime();

      expect(result.totalOrders).toBe(3);
    });

    it("should only count completed orders in average calculation", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      // Create received orders
      await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      // Create completed order
      const completedOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        2,
        userId,
        vehicleId,
        [serviceId],
      );

      // Update to completed with timestamps
      const updatedOrder = await ServiceOrderModel.findByPk(completedOrder.id);
      if (updatedOrder) {
        const now = new Date();
        updatedOrder.status = ServiceOrderStatus.completed;
        updatedOrder.startedServiceAt = new Date(
          now.getTime() - 2 * 60 * 60 * 1000,
        );
        updatedOrder.endedServiceAt = new Date(now.getTime());
        await updatedOrder.save();
      }

      const result = await serviceOrderRepository.getAverageServiceTime();

      expect(result.totalOrders).toBe(2);
      expect(result.completedOrders).toBe(1);
      expect(result.averageTimeInHours).toBeGreaterThan(0);
    });

    it("should have averageTimeInHours with max 2 decimal places", async () => {
      const serviceOrderData = {
        user: { id: userId },
        vehicle: { id: vehicleId },
        parts: [],
        services: [],
        status: ServiceOrderStatus.received,
      };

      const createdServiceOrder = await serviceOrderRepository.create(
        serviceOrderData as any,
        1,
        userId,
        vehicleId,
        [serviceId],
      );

      // Update to completed
      const updatedOrder = await ServiceOrderModel.findByPk(
        createdServiceOrder.id,
      );
      if (updatedOrder) {
        const now = new Date();
        updatedOrder.status = ServiceOrderStatus.completed;
        updatedOrder.startedServiceAt = new Date(
          now.getTime() - 2.75 * 60 * 60 * 1000,
        );
        updatedOrder.endedServiceAt = new Date(now.getTime());
        await updatedOrder.save();
      }

      const result = await serviceOrderRepository.getAverageServiceTime();

      const decimalPlaces = (
        result.averageTimeInHours.toString().split(".")[1] || ""
      ).length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });
});
