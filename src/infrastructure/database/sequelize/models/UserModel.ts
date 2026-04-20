import { DataTypes, Model, Sequelize } from "sequelize";
import { ServiceOrderModel } from "./ServiceOrderModel";
import { sequelize } from "../init";

export class UserModel extends Model {
  declare id: string;
  declare serviceOrders?: ServiceOrderModel[];
  declare name: string;
  declare document: string;
  declare email: string;
  declare password: string;
  declare role?: "admin" | "customer";
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "customer",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);

export default UserModel;
