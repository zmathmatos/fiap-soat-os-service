
import { Request, Response } from "express";
import { UserRepository } from "../../repositories/UserRepository";
import { UserUseCase } from "../../../application/use-cases/user/UserUseCase";
import { HttpPresenters, UserPresenter } from "../../../interface/presenters";
import { UserController } from "../../../interface/controllers/UserController";
import { requiredFields, handleError } from "../utils/handlerHelpers";

export class WebUserController {
  private readonly userController: UserController;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userController = new UserController(userRepository);
  }

  async create(req: Request, res: Response): Promise<void> {
    const missing = requiredFields(["name", "document", "email", "password"], req.body);
    if (missing) {
      res.status(400).json(HttpPresenters.badRequest(`${missing} is required`));
      return;
    }
    try {
      const { name, document, email, password } = req.body;
      const user = await this.userController.create({ name, document, email, password });
      res.status(201).json(HttpPresenters.created(UserPresenter.toResponse(user)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userController.getById(id as string);
      if (!user) {
        res.status(404).json(HttpPresenters.notFound("User not found"));
        return;
      }
      res.status(200).json(HttpPresenters.ok(UserPresenter.toResponse(user)));
    } catch (error) {
      handleError(res, error, "User not found");
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userController.getAll();
      res.status(200).json(HttpPresenters.ok(UserPresenter.toListResponse(users)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async getByDocument(req: Request, res: Response): Promise<void> {
    try {
      const { document } = req.params;
      const user = await this.userController.getByDocument(document as string);
      if (!user) {
        res.status(404).json(HttpPresenters.notFound("User not found"));
        return;
      }
      res.status(200).json(HttpPresenters.ok(UserPresenter.toResponse(user)));
    } catch (error) {
      handleError(res, error, "User not found");
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const missing = requiredFields(["name", "document", "email"], req.body);
    if (missing) {
      res.status(400).json(HttpPresenters.badRequest(`${missing} is required`));
      return;
    }
    try {
      const { id } = req.params;
      const { name, document, email } = req.body;
      const user = await this.userController.update({ id: id as string, name, document, email });
      res.status(200).json(HttpPresenters.ok(UserPresenter.toResponse(user)));
    } catch (error) {
      handleError(res, error);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.userController.delete(id as string);
      if (!deleted) {
        res.status(404).json(HttpPresenters.notFound("User not found"));
        return;
      }
      res.status(204).send(HttpPresenters.noContent());
    } catch (error) {
      handleError(res, error, "User not found");
    }
  }
}
