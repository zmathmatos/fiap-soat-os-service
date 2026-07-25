import dotenv from "dotenv";
dotenv.config();

// New Relic agent is preloaded via `node -r newrelic` in the start script
// (see package.json). That guarantees the agent is initialized BEFORE any
// other module is imported — required so it can instrument express/http.
// When NEW_RELIC_ENABLED !== "true", newrelic.js sets agent_enabled = false
// and the preload becomes a no-op.

import app from "./infrastructure/web/app";
import { initializeDatabase } from "./infrastructure/database/sequelize/init";
import Logger from "./infrastructure/database/sequelize/utils/Logger";
import { RabbitMQPaymentEventConsumer } from "./infrastructure/messaging/RabbitMQPaymentEventConsumer";
import { RabbitMQExecutionEventConsumer } from "./infrastructure/messaging/RabbitMQExecutionEventConsumer";
import { ServiceOrderController } from "./interface/controllers/ServiceOrderController";
import { ServiceOrderRepository } from "./infrastructure/repositories/ServiceOrderRepository";
import { rabbitMQQuotationEventPublisher } from "./infrastructure/messaging/RabbitMQQuotationEventPublisher";

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

// Fails soft: unlike waitForDatabase, exhausting retries here does not exit the
// process — the REST API works without RabbitMQ. But there's no retry after
// giving up, so a broker outage longer than MAX_RETRIES * RETRY_DELAY leaves
// events unconsumed until the service is restarted.
async function startConsumer(
  name: string,
  consumer: { start: () => Promise<void> },
  retries = MAX_RETRIES,
): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      await consumer.start();
      return;
    } catch (error) {
      Logger.error(`RabbitMQ ${name} consumer connection attempt ${i}/${retries} failed`, {
        err: error,
        event: "rabbitmq.consumer.connectFailed",
      });
      if (i === retries) {
        Logger.error(
          `Failed to start RabbitMQ ${name} consumer after maximum retries — those events will not be processed until the service restarts`,
          { event: "rabbitmq.consumer.giveUp" },
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

// Fails soft, same shape as startConsumer: warms up the quotation publisher's
// AMQP channel so a broker-down state surfaces in the startup logs instead of silently on
// the first quotation. Giving up after MAX_RETRIES just means the first publish attempt
// will pay the (re)connect cost and fail/retry on its own — it does not disable publishing.
async function startQuotationEventPublisher(retries = MAX_RETRIES): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      await rabbitMQQuotationEventPublisher.connect();
      return;
    } catch (error) {
      Logger.error(`RabbitMQ quotation publisher connection attempt ${i}/${retries} failed`, {
        err: error,
        event: "rabbitmq.publisher.connectFailed",
      });
      if (i === retries) {
        Logger.error(
          "Failed to warm up RabbitMQ quotation publisher after maximum retries — the next quotation will retry the connection",
          { event: "rabbitmq.publisher.giveUp" },
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
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

    // Run in the background — the REST API stays up even if RabbitMQ is unreachable.
    const serviceOrderController = new ServiceOrderController(new ServiceOrderRepository());
    void startConsumer("payment", new RabbitMQPaymentEventConsumer(serviceOrderController));
    void startConsumer("execution", new RabbitMQExecutionEventConsumer(serviceOrderController));
    void startQuotationEventPublisher();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
