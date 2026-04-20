import { DataTypes, Model } from "sequelize";
import { sequelize } from "../init";

export class PartModel extends Model {
  declare id: string;
  declare name: string;
  declare partNumber: string;
  declare brand: string;
  declare price: number;
  declare stockQuantity: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

PartModel.init(
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
    partNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "parts",
    timestamps: true,
  },
);

export default PartModel;
