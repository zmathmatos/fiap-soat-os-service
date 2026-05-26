import { DataTypes, Model, Transaction } from "sequelize";
import UserModel from "./UserModel";
import { VehicleModel } from "./VehicleModel";
import { ServiceModel } from "./ServiceModel";
import { PartModel } from "./PartModel";
import { sequelize } from "../init";
import { ServiceOrderStatus } from "../../../../domain/entities/ServiceOrder";
import Utils from "../utils/Utils";
import Logger from "../utils/Logger";
import { newrelic } from "../../../observability/newrelic";

export class ServiceOrderModelPart extends Model {
  declare id: string;
  declare part: PartModel;
  declare quantity: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ServiceOrderModelPart.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "service_order_parts",
    timestamps: true,
  },
);

export class ServiceOrderModel extends Model {
  declare id: string;
  declare user: UserModel;
  declare vehicle: VehicleModel;
  declare parts?: ServiceOrderModelPart[];
  declare services?: ServiceModel[];
  declare serviceOrderNumber: number;
  declare status: string;
  declare startedServiceAt?: Date;
  declare endedServiceAt?: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  // Sequelize adds association methods like addServices dynamically at runtime when you call belongsToMany.
  declare addServices: (
    serviceIds: string[],
    options?: { transaction?: Transaction },
  ) => Promise<void>;
}

ServiceOrderModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    serviceOrderNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Recebido",
    },
    startedServiceAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endedServiceAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "service_orders",
    timestamps: true,
  },
);

ServiceOrderModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });
UserModel.hasMany(ServiceOrderModel, {
  foreignKey: "userId",
  as: "serviceOrders",
});

ServiceOrderModel.belongsTo(VehicleModel, {
  foreignKey: "vehicleId",
  as: "vehicle",
});
VehicleModel.hasMany(ServiceOrderModel, {
  foreignKey: "vehicleId",
  as: "serviceOrders",
});

ServiceOrderModelPart.belongsTo(ServiceOrderModel, {
  foreignKey: "serviceOrderId",
  as: "serviceOrder",
});

ServiceOrderModel.belongsToMany(PartModel, {
  through: ServiceOrderModelPart,
  foreignKey: "serviceOrderId",
  otherKey: "partId",
  as: "parts",
});
PartModel.belongsToMany(ServiceOrderModel, {
  through: ServiceOrderModelPart,
  foreignKey: "partId",
  otherKey: "serviceOrderId",
  as: "serviceOrders",
});

export class ServiceOrderModelService extends Model {
  declare id: string;
}

ServiceOrderModelService.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "service_order_services",
    timestamps: true,
  },
);

ServiceOrderModel.belongsToMany(ServiceModel, {
  through: ServiceOrderModelService,
  foreignKey: "serviceOrderId",
  otherKey: "serviceId",
  as: "services",
});

ServiceModel.belongsToMany(ServiceOrderModel, {
  through: ServiceOrderModelService,
  foreignKey: "serviceId",
  otherKey: "serviceOrderId",
  as: "serviceOrders",
});

// TODO: move this business rule to the application layer
ServiceOrderModel.afterCreate(async (serviceOrder, _options) => {
  switch (serviceOrder.status) {
    case ServiceOrderStatus.received:
      Logger.info("order created", {
        event: "order.created",
        "order.id": serviceOrder.id,
        "order.status": "RECEBIDO",
        service_order_number: serviceOrder.serviceOrderNumber,
      });
      newrelic.recordMetric("Custom/ServiceOrder/Created", 1);
      newrelic.recordCustomEvent("ServiceOrderEvent", {
        event: "order.created",
        orderId: serviceOrder.id,
        status: "RECEBIDO",
        serviceOrderNumber: serviceOrder.serviceOrderNumber,
      });
      break;
    default:
      break;
  }
});

// TODO: move this business rule to the application layer
ServiceOrderModel.beforeUpdate(async (serviceOrder, _options) => {
  if (
    serviceOrder.status === ServiceOrderStatus.inExecution &&
    !serviceOrder.startedServiceAt
  ) {
    serviceOrder.startedServiceAt = new Date();
  }

  if (
    serviceOrder.status === ServiceOrderStatus.completed &&
    !serviceOrder.endedServiceAt
  ) {
    const startTime = serviceOrder.startedServiceAt || new Date();

    // Adicionando um tempo aleatório entre 1 a 6 horas ao horário de início para simular o término do serviço
    const randomHours = Math.floor(Math.random() * 6) + 1;
    const endTime = new Date(
      startTime.getTime() + randomHours * 60 * 60 * 1000,
    );

    serviceOrder.endedServiceAt = endTime;
  }
});

// TODO: move this business rule to the application layer
ServiceOrderModel.beforeUpdate(async (serviceOrder, _options) => {
  switch (serviceOrder.status) {
    case ServiceOrderStatus.inExecution:
      try {
        await Utils.updateInventory(serviceOrder);
      } catch (error) {
        Logger.error("order processing failed: inventory update", {
          err: error,
          event: "order.failed",
          "order.id": serviceOrder.id,
          service_order_number: serviceOrder.serviceOrderNumber,
        });
        newrelic.recordMetric("Custom/ServiceOrder/Failed", 1);
        throw error;
      }
      break;
    default:
      break;
  }
});

// TODO: move this business rule to the application layer
ServiceOrderModel.afterUpdate(async (serviceOrder, _options) => {
  const startedAt = serviceOrder.startedServiceAt
    ? new Date(serviceOrder.startedServiceAt).getTime()
    : null;
  const endedAt = serviceOrder.endedServiceAt
    ? new Date(serviceOrder.endedServiceAt).getTime()
    : null;
  const durationMs =
    startedAt && endedAt ? endedAt - startedAt : undefined;

  const baseFields = {
    event: "order.processed",
    "order.id": serviceOrder.id,
    service_order_number: serviceOrder.serviceOrderNumber,
    ...(durationMs !== undefined ? { duration_ms: durationMs } : {}),
  };

  const emit = (status: string) => {
    Logger.info("order processed", { ...baseFields, "order.status": status });
    newrelic.recordMetric(`Custom/ServiceOrder/Status/${status}`, 1);
    if (durationMs !== undefined) {
      newrelic.recordMetric(`Custom/ServiceOrder/Duration/${status}`, durationMs);
    }
    newrelic.recordCustomEvent("ServiceOrderEvent", {
      event: "order.processed",
      orderId: serviceOrder.id,
      status,
      serviceOrderNumber: serviceOrder.serviceOrderNumber,
      ...(durationMs !== undefined ? { durationMs } : {}),
    });
  };

  switch (serviceOrder.status) {
    case ServiceOrderStatus.inDiagnostic:
      emit("DIAGNOSTICO");
      break;
    case ServiceOrderStatus.awaitingApproval:
      if (process.env.NODE_ENV !== "test") {
        try {
          Utils.generateQuotation(serviceOrder.serviceOrderNumber);
        } catch (error) {
          Logger.error("quotation generation failed", {
            err: error,
            service_order_number: serviceOrder.serviceOrderNumber,
          });
        }
      }
      emit("AGUARDANDO_APROVACAO");
      break;
    case ServiceOrderStatus.inExecution:
      emit("EXECUCAO");
      break;
    case ServiceOrderStatus.completed:
      emit("FINALIZACAO");
      break;
    case ServiceOrderStatus.delivered:
      emit("ENTREGUE");
      break;
    default:
      break;
  }
});

export default ServiceOrderModel;
