
import { Request, Response } from "express";
import { ServiceOrderRepository } from "../../repositories/ServiceOrderRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { VehicleRepository } from "../../repositories/VehicleRepository";
import { ServiceRepository } from "../../repositories/ServiceRepository";
import { HttpPresenters, ServiceOrderPresenter } from "../../../interface/presenters";
import { Vehicle } from "../../../domain/entities/Vehicle";
import { User } from "../../../domain/entities/User";
import { ServiceOrderStatus } from "../../../domain/entities/ServiceOrder";
import { ServiceController } from "../../../interface/controllers/ServiceController";
import { ServiceOrderController } from "../../../interface/controllers/ServiceOrderController";
import { UserController } from "../../../interface/controllers/UserController";
import { VehicleController } from "../../../interface/controllers/VehicleController";
import { requiredFields, handleError } from "../utils/handlerHelpers";

export class WebServiceOrderController {
  private readonly serviceOrderController: ServiceOrderController;
  private readonly userController: UserController;
  private readonly vehicleController: VehicleController;
  private readonly serviceController: ServiceController;

  constructor(
    serviceOrderRepository: ServiceOrderRepository = new ServiceOrderRepository(),
    userRepository: UserRepository = new UserRepository(),
    vehicleRepository: VehicleRepository = new VehicleRepository(),
    serviceRepository: ServiceRepository = new ServiceRepository(),
  ) {
    this.serviceOrderController = new ServiceOrderController(
      serviceOrderRepository,
    );
    this.userController = new UserController(userRepository);
    this.vehicleController = new VehicleController(vehicleRepository);
    this.serviceController = new ServiceController(serviceRepository);
  }

  async create(req: Request, res: Response): Promise<void> {
    const missing = requiredFields(["document", "licensePlate"], req.body);
    if (missing) {
      res.status(400).json(HttpPresenters.badRequest(`${missing} is required`));
      return;
    }
    try {
      const { document, licensePlate, brand, model, year, serviceCodes, partIds } = req.body;
      const user = await this.userController.getByDocument(document);
      if (!user) {
        res.status(404).json(HttpPresenters.notFound("User not found"));
        return;
      }
      let vehicle: Vehicle | null = null;
      if (brand && model && year) {
        try {
          vehicle = await this.vehicleController.create(licensePlate, brand, model, year);
        } catch (error) {
          res.status(400).json(HttpPresenters.badRequest("Error creating vehicle: " + (error instanceof Error ? error.message : "")));
          return;
        }
      } else {
        vehicle = await this.vehicleController.getVehicleByLicensePlate(licensePlate);
        if (!vehicle) {
          res.status(404).json(HttpPresenters.notFound("Vehicle not found"));
          return;
        }
      }
      let serviceIds: string[] = [];
      if (serviceCodes && serviceCodes.length > 0) {
        const services = await this.serviceController.getServiceByServiceCodes(serviceCodes);
        serviceIds = services.map((service) => service.id);
      }
      const serviceOrder = await this.serviceOrderController.create(user.id, vehicle.id, serviceIds, partIds);
      res.status(201).json(HttpPresenters.created(ServiceOrderPresenter.toResponse(serviceOrder)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async createForCustomer(req: Request, res: Response): Promise<void> {
    const missing = requiredFields(
      ["name", "document", "email", "password", "licensePlate", "brand", "model", "year"],
      req.body,
    );
    if (missing) {
      res.status(400).json(HttpPresenters.badRequest(`${missing} is required`));
      return;
    }
    try {
      const { name, document, email, password, licensePlate, brand, model, year, serviceIds, partIds } = req.body;

      let user: User | null = null;
      try {
        user = await this.userController.getByDocument(document);
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("not found")) {
          throw error;
        }
      }
      if (!user) {
        try {
          user = await this.userController.create({ name, document, email, password });
        } catch (error) {
          res.status(400).json(HttpPresenters.badRequest("Error creating user: " + (error instanceof Error ? error.message : "")));
          return;
        }
      }

      let vehicle = await this.vehicleController.getVehicleByLicensePlate(licensePlate);
      if (!vehicle) {
        try {
          vehicle = await this.vehicleController.create(licensePlate, brand, model, Number(year));
        } catch (error) {
          res.status(400).json(HttpPresenters.badRequest("Error creating vehicle: " + (error instanceof Error ? error.message : "")));
          return;
        }
      }

      const serviceOrder = await this.serviceOrderController.create(user.id, vehicle.id, serviceIds, partIds);
      res.status(201).json(HttpPresenters.created(ServiceOrderPresenter.toResponse(serviceOrder)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const serviceOrder = await this.serviceOrderController.getById(id as string);
      if (!serviceOrder) {
        res.status(404).json(HttpPresenters.notFound("Service Order not found"));
        return;
      }
      res.status(200).json(HttpPresenters.ok(ServiceOrderPresenter.toResponse(serviceOrder)));
    } catch (error) {
      handleError(res, error, "Service Order not found");
    }
  }

  async getByServiceOrderNumber(req: Request, res: Response): Promise<void> {
    try {
      const { serviceOrderNumber } = req.params;

      const serviceOrder =
        await this.serviceOrderController.getByServiceOrderNumber(
          Number(serviceOrderNumber),
        );

      if (!serviceOrder) {
        res
          .status(404)
          .json(HttpPresenters.notFound("Service Order not found"));
        return;
      }

      res
        .status(200)
        .json(
          HttpPresenters.ok(ServiceOrderPresenter.toResponse(serviceOrder)),
        );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(HttpPresenters.badRequest(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const includeFinished = req.query?.includeFinished === "true";
      const orderByStatus = req.query?.orderByStatus === "true";
      const serviceOrders = await this.serviceOrderController.getAll(includeFinished, orderByStatus);
      res.status(200).json(HttpPresenters.ok(ServiceOrderPresenter.toListResponse(serviceOrders)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const serviceOrders = await this.serviceOrderController.getByUserId(userId as string);
      res.status(200).json(HttpPresenters.ok(ServiceOrderPresenter.toListResponse(serviceOrders)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async getByUserDocument(req: Request, res: Response): Promise<void> {
    try {
      const { document } = req.params;
      const user = await this.userController.getByDocument(document as string);
      if (!user) {
        res.status(404).json(HttpPresenters.notFound("User not found"));
        return;
      }
      const serviceOrders = await this.serviceOrderController.getByUserId(user.id);
      res.status(200).json(HttpPresenters.ok(ServiceOrderPresenter.toListResponse(serviceOrders)));
    } catch (error) {
      handleError(res, error, "User not found");
    }
  }

  async getByVehicleId(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleId } = req.params;
      const serviceOrders = await this.serviceOrderController.getByVehicleId(vehicleId as string);
      res.status(200).json(HttpPresenters.ok(ServiceOrderPresenter.toListResponse(serviceOrders)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async getByVehicleLicensePlate(req: Request, res: Response): Promise<void> {
    try {
      const { licensePlate } = req.params;
      const vehicle = await this.vehicleController.getVehicleByLicensePlate(licensePlate as string);
      if (!vehicle) {
        res.status(404).json(HttpPresenters.notFound("Vehicle not found"));
        return;
      }
      const serviceOrders = await this.serviceOrderController.getByVehicleId(vehicle.id);
      res.status(200).json(HttpPresenters.ok(ServiceOrderPresenter.toListResponse(serviceOrders)));
    } catch (error) {
      handleError(res, error, "Vehicle not found");
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const missing = requiredFields(["userId", "vehicleId"], req.body);
    if (missing) {
      res.status(400).json(HttpPresenters.badRequest(`${missing} is required`));
      return;
    }
    try {
      const { id } = req.params;
      const { userId, vehicleId, parts, serviceIds, status } = req.body;
      const newParts = (parts || []) as { partId: string; quantity: number }[];
      const user = await this.userController.getById(userId);
      if (!user) {
        res.status(404).json(HttpPresenters.notFound("User not found"));
        return;
      }
      const vehicle = await this.vehicleController.getById(vehicleId);
      if (!vehicle) {
        res.status(404).json(HttpPresenters.notFound("Vehicle not found"));
        return;
      }
      const updatedServiceOrder = await this.serviceOrderController.update({
        id: id as string,
        userId: user.id,
        vehicleId: vehicle.id,
        partsQuantities: newParts,
        serviceIds,
        status: status as ServiceOrderStatus | undefined,
      });
      res.status(200).json(HttpPresenters.ok(ServiceOrderPresenter.toResponse(updatedServiceOrder)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.serviceOrderController.delete(id as string);
      if (!deleted) {
        res.status(404).json(HttpPresenters.notFound("Service Order not found"));
        return;
      }
      res.status(204).send(HttpPresenters.noContent());
    } catch (error) {
      handleError(res, error, "Service Order not found");
    }
  }

  async setAsInDiagnostic(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const serviceOrder = await this.serviceOrderController.getById(
        id as string,
      );

      if (!serviceOrder) {
        res
          .status(404)
          .json(HttpPresenters.notFound("Service Order not found"));
        return;
      }

      const updatedServiceOrder = await this.serviceOrderController.update({
        id: serviceOrder.id,
        userId: serviceOrder.user.id,
        vehicleId: serviceOrder.vehicle.id,
        partsQuantities: undefined,
        serviceIds: undefined,
        status: ServiceOrderStatus.inDiagnostic,
      });

      res
        .status(200)
        .json(
          HttpPresenters.ok(
            ServiceOrderPresenter.toResponse(updatedServiceOrder),
          ),
        );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(HttpPresenters.badRequest(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async handleBillingEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { event } = req.body as { event?: string };

      await this.serviceOrderController.applyBillingEvent(id as string, event);

      res.status(204).send();
    } catch (error) {
      handleError(res, error, "Service Order not found");
    }
  }

  async addPartsAndServices(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { parts, serviceIds } = req.body;
      const newParts = (parts || []) as { partId: string; quantity: number }[];

      const serviceOrder = await this.serviceOrderController.getById(
        id as string,
      );

      if (!serviceOrder) {
        res
          .status(404)
          .json(HttpPresenters.notFound("Service Order not found"));
        return;
      }

      if (newParts.length > 0 && newParts.some((part) => part.quantity <= 0)) {
        res
          .status(400)
          .json(
            HttpPresenters.badRequest(
              "Quantity must be greater than zero for all parts",
            ),
          );
        return;
      }

      const servicesIds = serviceOrder.services.map((service) => service.id);

      const newServiceIds = serviceIds
        ? [...new Set([...(servicesIds || []), ...serviceIds])]
        : servicesIds || [];

      const updatedServiceOrder = await this.serviceOrderController.update({
        id: serviceOrder.id,
        userId: serviceOrder.user.id,
        vehicleId: serviceOrder.vehicle.id,
        partsQuantities: newParts,
        serviceIds: newServiceIds,
        status: ServiceOrderStatus.awaitingApproval,
      });

      res
        .status(200)
        .json(
          HttpPresenters.ok(
            ServiceOrderPresenter.toResponse(updatedServiceOrder),
          ),
        );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(HttpPresenters.badRequest(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async setAsInExecution(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const serviceOrder = await this.serviceOrderController.getById(
        id as string,
      );

      if (!serviceOrder) {
        res
          .status(404)
          .json(HttpPresenters.notFound("Service Order not found"));
        return;
      }

      const updatedServiceOrder = await this.serviceOrderController.update({
        id: serviceOrder.id,
        userId: serviceOrder.user.id,
        vehicleId: serviceOrder.vehicle.id,
        partsQuantities: undefined,
        serviceIds: undefined,
        status: ServiceOrderStatus.inExecution,
      });

      res
        .status(200)
        .json(
          HttpPresenters.ok(
            ServiceOrderPresenter.toResponse(updatedServiceOrder),
          ),
        );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(HttpPresenters.badRequest(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async setAsCompleted(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const serviceOrder = await this.serviceOrderController.getById(
        id as string,
      );

      if (!serviceOrder) {
        res
          .status(404)
          .json(HttpPresenters.notFound("Service Order not found"));
        return;
      }

      const updatedServiceOrder = await this.serviceOrderController.update({
        id: serviceOrder.id,
        userId: serviceOrder.user.id,
        vehicleId: serviceOrder.vehicle.id,
        partsQuantities: undefined,
        serviceIds: undefined,
        status: ServiceOrderStatus.completed,
      });

      res
        .status(200)
        .json(
          HttpPresenters.ok(
            ServiceOrderPresenter.toResponse(updatedServiceOrder),
          ),
        );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(HttpPresenters.badRequest(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async setAsDelivered(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const serviceOrder = await this.serviceOrderController.getById(
        id as string,
      );

      if (!serviceOrder) {
        res
          .status(404)
          .json(HttpPresenters.notFound("Service Order not found"));
        return;
      }

      const updatedServiceOrder = await this.serviceOrderController.update({
        id: serviceOrder.id,
        userId: serviceOrder.user.id,
        vehicleId: serviceOrder.vehicle.id,
        partsQuantities: undefined,
        serviceIds: undefined,
        status: ServiceOrderStatus.delivered,
      });

      res
        .status(200)
        .json(
          HttpPresenters.ok(
            ServiceOrderPresenter.toResponse(updatedServiceOrder),
          ),
        );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(HttpPresenters.badRequest(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const serviceOrder = await this.serviceOrderController.getById(
        id as string,
      );

      if (!serviceOrder) {
        res
          .status(404)
          .json(HttpPresenters.notFound("Service Order not found"));
        return;
      }

      const updatedServiceOrder = await this.serviceOrderController.update({
        id: serviceOrder.id,
        userId: serviceOrder.user.id,
        vehicleId: serviceOrder.vehicle.id,
        partsQuantities: undefined,
        serviceIds: undefined,
        status: status as ServiceOrderStatus,
      });

      res
        .status(200)
        .json(
          HttpPresenters.ok(
            ServiceOrderPresenter.toResponse(updatedServiceOrder),
          ),
        );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(HttpPresenters.badRequest(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }

  async getAverageServiceTime(_req: Request, res: Response): Promise<void> {
    try {
      const averageServiceTime = await this.serviceOrderController.getAverageServiceTime();
      res.status(200).json(HttpPresenters.ok(averageServiceTime));
    } catch (error) {
      handleError(res, error);
    }
  }
}
