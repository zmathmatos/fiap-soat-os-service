import { DataTypes, Model, Transaction } from "sequelize";
import UserModel from "./UserModel";
import { VehicleModel } from "./VehicleModel";
import { ServiceModel } from "./ServiceModel";
import { PartModel } from "./PartModel";
import { sequelize } from "../init";
import { ServiceOrderStatus } from "../../../../domain/entities/ServiceOrder";
import Utils from "../utils/Utils";
import Logger from "../utils/Logger";

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
ServiceOrderModel.afterCreate(async (serviceOrder, options) => {
  const date = new Date(Date.now()).toLocaleDateString("pt-BR");
  const time = new Date(Date.now()).toLocaleTimeString("pt-BR");

  switch (serviceOrder.status) {
    case ServiceOrderStatus.received:
      Logger.log(
        `# --- ${date} ${time} ---- : Nova OS #${serviceOrder.serviceOrderNumber} recebida.`,
      );
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
        throw error;
      }
      break;
    default:
      break;
  }
});

// TODO: move this business rule to the application layer
ServiceOrderModel.afterUpdate(async (serviceOrder, _options) => {
  const date = new Date(Date.now()).toLocaleDateString("pt-BR");
  const time = new Date(Date.now()).toLocaleTimeString("pt-BR");

  switch (serviceOrder.status) {
    case ServiceOrderStatus.inDiagnostic:
      Logger.log(
        `# --- ${date} ${time} ---- : OS #${serviceOrder.serviceOrderNumber} em diagnóstico.`,
      );
      break;
    case ServiceOrderStatus.awaitingApproval:
      if (process.env.NODE_ENV !== "test") {
        Utils.generateQuotation(serviceOrder.serviceOrderNumber);
      }
      break;
    case ServiceOrderStatus.inExecution:
      Logger.log(
        `# --- ${date} ${time} ---- : OS #${serviceOrder.serviceOrderNumber} em serviço.`,
      );
      break;
    case ServiceOrderStatus.completed:
      Logger.log(
        `# --- ${date} ${time} ---- : OS #${serviceOrder.serviceOrderNumber} foi concluída.`,
      );
      break;
    case ServiceOrderStatus.delivered:
      Logger.log(
        `# --- ${date} ${time} ---- : OS #${serviceOrder.serviceOrderNumber} foi entregue ao cliente.`,
      );
      break;
    default:
      break;
  }
});

export default ServiceOrderModel;
