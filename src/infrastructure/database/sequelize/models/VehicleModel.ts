import { DataTypes, Model, Sequelize } from "sequelize";
import { ServiceOrderModel } from "./ServiceOrderModel";
import { sequelize } from "../init";

export class VehicleModel extends Model {
  declare id: string;
  declare serviceOrders?: ServiceOrderModel[];
  declare licensePlate: string;
  declare brand: string;
  declare model: string;
  declare year: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

VehicleModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    licensePlate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "vehicles",
    timestamps: true,
  }
);

export default VehicleModel;