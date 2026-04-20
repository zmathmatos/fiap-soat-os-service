import { Router } from "express";
import type { Request, Response } from "express";
import sequelize from "../../../database/sequelize/config";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    // Check database connection
    await sequelize.authenticate();

    res.status(200).send({
      status: "OK",
      message: "Service is healthy",
      database: "connected"
    });
  } catch (error) {
    res.status(503).send({
      status: "ERROR",
      message: "Service is unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;