import { Request, Response } from "express";
import { VehicleRepository } from "../../repositories/VehicleRepository";
import { HttpPresenters, VehiclePresenter } from "../../../interface/presenters";
import { VehicleController } from "../../../interface/controllers/VehicleController";

export class WebVehicleController {
  private readonly vehicleController: VehicleController;

  constructor(vehicleRepository: VehicleRepository = new VehicleRepository()) {
    this.vehicleController = new VehicleController(vehicleRepository);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { licensePlate, brand, model, year } = req.body;

      if (!licensePlate || !brand || !model || !year) {
        res.status(400).json(HttpPresenters.badRequest("License plate, brand, model and year are required"));
        return;
      }

      const vehicle = await this.vehicleController.create(
        licensePlate,
        brand,
        model,
        Number.parseFloat(year),
      );

      res.status(201).json(HttpPresenters.created(VehiclePresenter.toResponse(vehicle)));
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

      const vehicle = await this.vehicleController.getById(id as string);

      if (!vehicle) {
        res.status(404).json(HttpPresenters.notFound("Vehicle not found"));
        return;
      }

      res.status(200).json(HttpPresenters.ok(VehiclePresenter.toResponse(vehicle)));
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
      const vehicles = await this.vehicleController.getAll();

      res.status(200).json(HttpPresenters.ok(VehiclePresenter.toListResponse(vehicles)));
    } catch (error) {
      res.status(500).json(HttpPresenters.internalServerError());
    }
  }

  async getVehicleByLicensePlate(req: Request, res: Response): Promise<void> {
    try {
      const { licensePlate } = req.params;

      const vehicle = await this.vehicleController.getVehicleByLicensePlate(
        licensePlate as string
      );

      if (!vehicle) {
        res.status(404).json(HttpPresenters.notFound("Vehicle not found"));
        return;
      }

      res.status(200).json(HttpPresenters.ok(VehiclePresenter.toResponse(vehicle)));
    } catch (error) {
      res.status(500).json(HttpPresenters.internalServerError());
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { licensePlate, brand, model, year } = req.body;

      const vehicle = await this.vehicleController.update({
        id: id as string,
        licensePlate,
        brand,
        model,
        year: parseInt(year),
      });

      if (!vehicle) {
        res.status(404).json(HttpPresenters.notFound("Vehicle not found"));
        return;
      }

      res.status(200).json(HttpPresenters.ok(VehiclePresenter.toResponse(vehicle)));
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

      const deleted = await this.vehicleController.delete(id as string);

      if (!deleted) {
        res.status(404).json(HttpPresenters.notFound("Vehicle not found"));
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
