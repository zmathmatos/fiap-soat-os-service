import sequelize from "./config";

export async function initializeDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Will sync the database and create tables if they don't existy already
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync();
    }
    console.log('Database models synchronized.');
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
}

export { sequelize };
