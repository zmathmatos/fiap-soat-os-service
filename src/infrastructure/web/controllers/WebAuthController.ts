import { Request, Response } from "express";
import { UserRepository } from "../../repositories/UserRepository";
import { HttpPresenters } from "../../../interface/presenters";
import { AuthController } from "../../../interface/controllers/AuthController";

export class WebAuthController {
  private readonly authController: AuthController;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.authController = new AuthController(userRepository);
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(400)
          .json(HttpPresenters.badRequest("Email and password are required"));
        return;
      }

      const result = await this.authController.login(email, password);

      res.status(200).json(HttpPresenters.ok(result));
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json(HttpPresenters.unauthorized(error.message));
      } else {
        res.status(500).json(HttpPresenters.internalServerError());
      }
    }
  }
}
