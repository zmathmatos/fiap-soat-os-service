import { DataTypes, Model, Transaction } from "sequelize";
import { sequelize } from "../init";

export class OutboxEventModel extends Model {
  declare id: string;
  declare eventType: string;
  declare payload: Record<string, unknown>;
  declare createdAt: Date;
  declare publishedAt: Date | null;
}

OutboxEventModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventType: {
      type: DataTypes.STRING(128),
      allowNull: false,
      field: "event_type",
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "published_at",
    },
  },
  {
    sequelize,
    tableName: "outbox_events",
    createdAt: "created_at",
    updatedAt: false,
  },
);

export async function insertOutboxEvent(
  eventType: string,
  payload: Record<string, unknown>,
  transaction: Transaction,
): Promise<void> {
  await OutboxEventModel.create({ eventType, payload }, { transaction });
}
