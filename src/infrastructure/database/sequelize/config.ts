import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const useSsl = process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "fiap_db",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  logging: process.env.NODE_ENV === "development",
  dialectOptions: useSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : undefined,
});

export default sequelize;
