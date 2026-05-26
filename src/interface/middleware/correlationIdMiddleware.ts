import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { logContext } from "../../infrastructure/database/sequelize/utils/Logger";

const HEADER = "x-correlation-id";

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.header(HEADER);
  const correlationId = incoming && incoming.length > 0 ? incoming : randomUUID();
  res.setHeader(HEADER, correlationId);
  logContext.run({ correlationId }, () => next());
};
