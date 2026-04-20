import app from "./infrastructure/web/app";
import dotenv from "dotenv";
import { initializeDatabase } from "./infrastructure/database/sequelize/init";
dotenv.config();

const port = process.env.APP_PORT || 3000;
const MAX_RETRIES = 10;
const RETRY_DELAY = 3000;

async function waitForDatabase(retries = MAX_RETRIES): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`Attempting to connect to database (attempt ${i}/${retries})...`);
      await initializeDatabase();
      console.log("Database connection established successfully.");
      return;
    } catch (error) {
      console.error(`Database connection attempt ${i} failed:`, error);
      if (i === retries) {
        throw new Error("Failed to connect to database after maximum retries");
      }
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

async function startServer() {
  try {
    await waitForDatabase();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
