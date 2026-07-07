import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import routers from "./routers";
import { authMiddleware, adminMiddleware } from "../../interface/middleware/authMiddleware";
import { correlationIdMiddleware } from "../../interface/middleware/correlationIdMiddleware";
import Logger from "../database/sequelize/utils/Logger";

const app = express();

// Middlewares
app.use(correlationIdMiddleware);
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (line: string) => Logger.info(line.trim(), { event: "http.access" }) },
  }),
);
app.use(cors());
app.use(helmet());
app.use(express.json());

// Set Health check route
app.use("/health", routers.health);

// Set Auth routes
app.use("/auth", routers.auth);

// Apply authentication and admin middleware to all admin routes
app.use("/admin", authMiddleware, adminMiddleware);

// Set User routes
app.use("/admin/users", routers.users);

// Set Vehicle routes
app.use("/admin/vehicles", routers.vehicles);

// Set Part routes
app.use("/admin/parts", routers.parts);

// Set Service routes
app.use("/admin/services", routers.services);

// Set Service Order routes
app.use("/admin/service-orders", routers.serviceOrders);

// Set Customer Service Order routes
// Authentication is applied per-route inside the router, since order creation
// must be reachable by customers who aren't registered/authenticated yet.
app.use("/customer/service-orders", routers.customerServiceOrders);

// Error handler
app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
  const correlationId = res.getHeader("x-correlation-id") as string | undefined;
  Logger.error("unhandled request error", {
    err: error,
    event: "http.error",
    method: req.method,
    path: req.originalUrl,
  });
  res.status(500).json({
    error: error.message,
    correlationId,
  });
});

export default app;
