import sequelize from "./config";

export async function initializeDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
}

export { sequelize };
