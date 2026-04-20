import { Op, Sequelize } from "sequelize";
import {
  ServiceOrderModel,
  ServiceOrderModelPart,
  ServiceOrderModelService,
} from "../database/sequelize/models/ServiceOrderModel";
import {
  ServiceOrder,
  ServiceOrderStatus,
} from "../../domain/entities/ServiceOrder";
import {
  AverageServiceTimeResult,
  IServiceOrderRepository,
} from "../../domain/repositories/IServiceOrderRepository";
import { sequelize } from "../database/sequelize/init";

export class ServiceOrderRepository implements IServiceOrderRepository {
  async create(
    serviceOrder: Omit<
      ServiceOrder,
      | "id"
      | "serviceOrderNumber"
      | "user"
      | "vehicle"
      | "parts"
      | "services"
      | "createdAt"
      | "updatedAt"
    >,
    orderNumber: number,
    userId: string,
    vehicleId: string,
    serviceIds?: string[],
    partIds?: string[],
  ): Promise<ServiceOrder> {
    return sequelize.transaction(async (t) => {
      const created = await ServiceOrderModel.create(
        {
          serviceOrderNumber: orderNumber,
          userId: userId,
          vehicleId: vehicleId,
          status: serviceOrder.status,
        },
        { transaction: t },
      );

      if (serviceIds && serviceIds.length > 0) {
        await created.addServices(serviceIds, { transaction: t });
      }

      if (partIds && partIds.length > 0) {
        await ServiceOrderModelPart.bulkCreate(
          partIds.map((partId) => ({
            serviceOrderId: created.id,
            partId,
            quantity: 1,
          })),
          { transaction: t },
        );
      }

      const newServiceOrder = await ServiceOrderModel.findByPk(created.id, {
        include: [
          { association: "user", attributes: { exclude: ["password"] } },
          "vehicle",
          "services",
          "parts",
        ],
        transaction: t,
      });

      return this.parseServiceOrder(newServiceOrder!);
    });
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    const serviceOrder = await ServiceOrderModel.findByPk(id, {
      include: [
        {
          association: "user",
          attributes: { exclude: ["password"] },
        },
        "vehicle",
        "services",
        "parts",
      ],
    });

    if (!serviceOrder) {
      return null;
    }

    return this.parseServiceOrder(serviceOrder);
  }

  async findByServiceOrderNumber(
    serviceOrderNumber: number,
  ): Promise<ServiceOrder | null> {
    const serviceOrder = await ServiceOrderModel.findOne({
      where: { serviceOrderNumber },
      include: [
        {
          association: "user",
          attributes: { exclude: ["password"] },
        },
        "vehicle",
        "services",
        "parts",
      ],
    });

    if (!serviceOrder) {
      return null;
    }

    return this.parseServiceOrder(serviceOrder);
  }

  async findAll(
    includeFinished?: boolean,
    orderByStatus?: boolean,
  ): Promise<ServiceOrder[]> {
    const whereClause = includeFinished
      ? {}
      : {
          status: {
            [Op.notIn]: [
              ServiceOrderStatus.completed,
              ServiceOrderStatus.delivered,
            ],
          },
        };

    const serviceOrders = await ServiceOrderModel.findAll({
      where: whereClause,
      include: [
        {
          association: "user",
          attributes: { exclude: ["password"] },
        },
        "vehicle",
        "services",
        "parts",
      ],
      order: orderByStatus
        ? [
            [
              Sequelize.literal(`
            CASE
              WHEN status = '${ServiceOrderStatus.inExecution}' THEN 1
              WHEN status = '${ServiceOrderStatus.awaitingApproval}' THEN 2
              WHEN status = '${ServiceOrderStatus.inDiagnostic}' THEN 3
              WHEN status = '${ServiceOrderStatus.received}' THEN 4
              ELSE 5
            END
          `),
              "ASC",
            ],
            ["createdAt", "ASC"],
          ]
        : [["createdAt", "ASC"]],
    });

    return serviceOrders.map((serviceOrder) =>
      this.parseServiceOrder(serviceOrder),
    );
  }

  async findByUserId(userId: string): Promise<ServiceOrder[]> {
    const serviceOrders = await ServiceOrderModel.findAll({
      where: { userId },
      include: [
        {
          association: "user",
          attributes: { exclude: ["password"] },
        },
        "vehicle",
        "services",
        "parts",
      ],
    });

    return serviceOrders.map((serviceOrder) =>
      this.parseServiceOrder(serviceOrder),
    );
  }

  async findByVehicleId(vehicleId: string): Promise<ServiceOrder[]> {
    const serviceOrders = await ServiceOrderModel.findAll({
      where: { vehicleId },
      include: [
        {
          association: "user",
          attributes: { exclude: ["password"] },
        },
        "vehicle",
        "services",
        "parts",
      ],
    });

    return serviceOrders.map((serviceOrder) =>
      this.parseServiceOrder(serviceOrder),
    );
  }

  async update(
    id: string,
    serviceOrder: Partial<ServiceOrder>,
    userId: string,
    vehicleId: string,
    serviceIds?: string[],
    partsQuantities?: { partId: string; quantity: number }[],
  ): Promise<ServiceOrder> {
    return sequelize.transaction(async (t) => {
      try {
        await ServiceOrderModel.update(
          {
            userId: userId,
            vehicleId: vehicleId,
            status: serviceOrder.status,
          },
          {
            where: { id },
            individualHooks: true,
            transaction: t,
          },
        );
      } catch (error) {
        if (error instanceof Error) {
          if (
            error.name === "SequelizeDatabaseError" &&
            error.message.includes("stockquantity_non_negative")
          ) {
            throw new Error(
              "Service Order update failed: Insufficient stock for one or more parts.",
            );
          }
        }
        throw error;
      }

      if (serviceIds && serviceIds.length > 0) {
        const existingServices = await ServiceOrderModelService.findAll({
          where: { serviceOrderId: id },
          transaction: t,
        });
        const existingServiceIds = new Set(
          existingServices.map((s) => (s as any).serviceId as string),
        );
        const newServiceIds = serviceIds.filter(
          (sid) => !existingServiceIds.has(sid),
        );
        if (newServiceIds.length > 0) {
          const order = await ServiceOrderModel.findByPk(id, {
            transaction: t,
          });
          await order!.addServices(newServiceIds, { transaction: t });
        }
      }

      if (partsQuantities && partsQuantities.length > 0) {
        for (const partQtt of partsQuantities) {
          const existing = await ServiceOrderModelPart.findOne({
            where: { serviceOrderId: id, partId: partQtt.partId },
            transaction: t,
          });
          if (existing) {
            await existing.update(
              { quantity: existing.quantity + partQtt.quantity },
              { transaction: t },
            );
          } else {
            await ServiceOrderModelPart.create(
              {
                serviceOrderId: id,
                partId: partQtt.partId,
                quantity: partQtt.quantity,
              },
              { transaction: t },
            );
          }
        }
      }

      const updated = await ServiceOrderModel.findByPk(id, {
        include: [
          {
            association: "user",
            attributes: { exclude: ["password"] },
          },
          "vehicle",
          "services",
          "parts",
        ],
        transaction: t,
      });

      if (!updated) {
        throw new Error("Service order not found");
      }

      return this.parseServiceOrder(updated);
    });
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await ServiceOrderModel.destroy({
      where: { id },
    });

    return deletedCount > 0;
  }

  async generateServiceOrderNumber(): Promise<number> {
    const serviceOrder = await ServiceOrderModel.findOne({
      order: [["serviceOrderNumber", "DESC"]],
    });

    return serviceOrder ? serviceOrder.serviceOrderNumber + 1 : 1000;
  }

  async getAverageServiceTime(): Promise<AverageServiceTimeResult> {
    const completedOrders = await ServiceOrderModel.findAll({
      where: {
        status: ServiceOrderStatus.completed,
      },
      attributes: ["startedServiceAt", "endedServiceAt"],
    });

    const ordersWithTime = completedOrders.filter(
      (order) => order.startedServiceAt && order.endedServiceAt,
    );

    if (ordersWithTime.length === 0) {
      return {
        averageTimeInHours: 0,
        completedOrders: 0,
        totalOrders: (await ServiceOrderModel.findAll()).length,
      };
    }

    const totalTimeInMs = ordersWithTime.reduce((sum, order) => {
      const start = new Date(order.startedServiceAt!).getTime();
      const end = new Date(order.endedServiceAt!).getTime();
      return sum + (end - start);
    }, 0);

    const averageTimeInMs = totalTimeInMs / ordersWithTime.length;
    const averageTimeInHours = averageTimeInMs / (1000 * 60 * 60);

    return {
      averageTimeInHours: Math.round(averageTimeInHours * 100) / 100,
      completedOrders: ordersWithTime.length,
      totalOrders: (await ServiceOrderModel.findAll()).length,
    };
  }

  private parseServiceOrder(serviceOrder: ServiceOrderModel) {
    const { parts, ...so } = serviceOrder.toJSON();
    const partsWithQuantity =
      parts?.map(({ ServiceOrderModelPart, ...part }: typeof parts) => ({
        ...part,
        serviceQuantity: ServiceOrderModelPart.quantity,
      })) ?? [];

    return new ServiceOrder({ ...so, parts: partsWithQuantity });
  }
}
