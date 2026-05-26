import { Router } from "express";
import type { Request, Response } from "express";
import sequelize from "../../../database/sequelize/config";

const router = Router();

router.get("/live", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

router.get("/ready", async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: "OK", database: "connected" });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.status(200).send({
      status: "OK",
      message: "Service is healthy",
      database: "connected",
    });
  } catch (error) {
    res.status(503).send({
      status: "ERROR",
      message: "Service is unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
