import dotenv from "dotenv";
dotenv.config();

// New Relic agent must be required before any other module.
// It is no-op when NEW_RELIC_ENABLED !== "true".
if (process.env.NEW_RELIC_ENABLED === "true") {
  require("newrelic");
}

import app from "./infrastructure/web/app";
import { initializeDatabase } from "./infrastructure/database/sequelize/init";
import Logger from "./infrastructure/database/sequelize/utils/Logger";

process.on("unhandledRejection", (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  Logger.error("unhandled promise rejection", { err, event: "process.unhandledRejection" });
});

process.on("uncaughtException", (error) => {
  Logger.error("uncaught exception", { err: error, event: "process.uncaughtException" });
  setTimeout(() => process.exit(1), 250);
});

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
