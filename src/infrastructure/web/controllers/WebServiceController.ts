
import { Request, Response } from "express";
import { ServiceRepository } from "../../repositories/ServiceRepository";
import { HttpPresenters, ServicePresenter } from "../../../interface/presenters";
import { ServiceController } from "../../../interface/controllers/ServiceController";
import { requiredFields, handleError } from "../utils/handlerHelpers";

export class WebServiceController {
  private readonly serviceController: ServiceController;

  constructor(serviceRepository: ServiceRepository = new ServiceRepository()) {
    this.serviceController = new ServiceController(serviceRepository);
  }

  async create(req: Request, res: Response): Promise<void> {
    const missing = requiredFields(["name", "serviceCode", "price"], req.body);
    if (missing) {
      res.status(400).json(HttpPresenters.badRequest(`${missing} is required`));
      return;
    }
    try {
      const { name, serviceCode, price } = req.body;
      const service = await this.serviceController.create(name, serviceCode, Number(price));
      res.status(201).json(HttpPresenters.created(ServicePresenter.toResponse(service)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await this.serviceController.getById(id as string);
      if (!service) {
        res.status(404).json(HttpPresenters.notFound("Service not found"));
        return;
      }
      res.status(200).json(HttpPresenters.ok(ServicePresenter.toResponse(service)));
    } catch (error) {
      handleError(res, error, "Service not found");
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const services = await this.serviceController.getAll();
      res.status(200).json(HttpPresenters.ok(ServicePresenter.toListResponse(services)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async getServiceByServiceCode(req: Request, res: Response): Promise<void> {
    try {
      const { serviceCode } = req.params;
      const service = await this.serviceController.getServiceByServiceCode(serviceCode as string);
      if (!service) {
        res.status(404).json(HttpPresenters.notFound("Service not found"));
        return;
      }
      res.status(200).json(HttpPresenters.ok(ServicePresenter.toResponse(service)));
    } catch (error) {
      handleError(res, error, "Service not found");
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, serviceCode, price } = req.body;
      const service = await this.serviceController.update({
        id: id as string,
        name,
        serviceCode,
        price,
      });
      if (!service) {
        res.status(404).json(HttpPresenters.notFound("Service not found"));
        return;
      }
      res.status(200).json(HttpPresenters.ok(ServicePresenter.toResponse(service)));
    } catch (error) {
      handleError(res, error, "Service not found");
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.serviceController.delete(id as string);
      if (!deleted) {
        res.status(404).json(HttpPresenters.notFound("Service not found"));
        return;
      }
      res.status(204).send(HttpPresenters.noContent());
    } catch (error) {
      handleError(res, error, "Service not found");
    }
  }
}
