import { Request, Response } from "express";
import { PartRepository } from "../../repositories/PartRepository";
import { HttpPresenters, PartPresenter } from "../../../interface/presenters";
import { PartController } from "../../../interface/controllers/PartController";

export class WebPartController {
  private readonly partController: PartController;

  constructor(partRepository: PartRepository = new PartRepository()) {
    this.partController = new PartController(partRepository);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, partNumber, brand, price, stockQuantity } = req.body;

      if (
        !name ||
        !partNumber ||
        !brand ||
        price === undefined ||
        stockQuantity === undefined
      ) {
        res
          .status(400)
          .json(
            HttpPresenters.badRequest(
              "Name, part number, brand, price and stock quantity are required",
            ),
          );

        return;
      }

      const part = await this.partController.create({
        name,
        partNumber,
        brand,
        price: Number.parseFloat(price),
        stockQuantity: Number.parseFloat(stockQuantity),
      });

      res
        .status(201)
        .json(HttpPresenters.created(PartPresenter.toResponse(part)));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(HttpPresenters.badRequest(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const part = await this.partController.getById(id as string);

      if (!part) {
        res.status(404).json(HttpPresenters.notFound("Part not found"));
        return;
      }

      res.status(200).json(HttpPresenters.ok(PartPresenter.toResponse(part)));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(HttpPresenters.notFound(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const parts = await this.partController.getAll();

      res
        .status(200)
        .json(HttpPresenters.ok(PartPresenter.toListResponse(parts)));
    } catch (error) {
      res.status(500).json(HttpPresenters.internalServerError());
    }
  }

  async getPartByPartNumber(req: Request, res: Response): Promise<void> {
    try {
      const { partNumber } = req.params;

      const part = await this.partController.getPartByPartNumber(
        partNumber as string,
      );

      if (!part) {
        res.status(404).json(HttpPresenters.notFound("Part not found"));
        return;
      }

      res.status(200).json(HttpPresenters.ok(PartPresenter.toResponse(part)));
    } catch (error) {
      res.status(500).json(HttpPresenters.internalServerError());
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, partNumber, brand, price, stockQuantity } = req.body;

      const part = await this.partController.update({
        id: id as string,
        name,
        partNumber,
        brand,
        price,
        stockQuantity,
      });

      if (!part) {
        res.status(404).json(HttpPresenters.notFound("Part not found"));
        return;
      }

      res.status(200).json(HttpPresenters.ok(PartPresenter.toResponse(part)));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(HttpPresenters.badRequest(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await this.partController.delete(id as string);

      if (!deleted) {
        res.status(404).json(HttpPresenters.notFound("Service not found"));
        return;
      }

      res.status(204).send(HttpPresenters.noContent());
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(HttpPresenters.notFound(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }
}
