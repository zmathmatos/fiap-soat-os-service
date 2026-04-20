import { Response } from "express";
import { HttpPresenters } from "../../../interface/presenters";

export function requiredFields(fields: string[], body: any): string | null {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return field;
    }
  }
  return null;
}

export function handleError(res: Response, error: unknown, notFoundMsg?: string): void {
  if (error instanceof Error) {
    if (notFoundMsg && error.message.includes("not found")) {
      res.status(404).json(HttpPresenters.notFound(notFoundMsg));
      return;
    }
    res.status(400).json(HttpPresenters.badRequest(error.message));
    return;
  }
  res.status(500).json(HttpPresenters.internalServerError());
}
