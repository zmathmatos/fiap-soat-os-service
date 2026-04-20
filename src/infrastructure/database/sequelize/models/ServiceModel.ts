import { DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../init";

export class ServiceModel extends Model {
  declare id: string;
  declare name: string;
  declare serviceCode: string;
  declare price: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ServiceModel.init(
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
    serviceCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "services",
    timestamps: true,
  }
);

export default ServiceModel;