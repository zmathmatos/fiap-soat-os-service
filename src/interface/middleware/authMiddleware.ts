import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { HttpPresenters } from '../presenters';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json(HttpPresenters.unauthorized('No token provided'));
      return;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      res.status(401).json(HttpPresenters.unauthorized('Token error'));
      return;
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      res.status(401).json(HttpPresenters.unauthorized('Token malformatted'));
      return;
    }

    const authService = new AuthService();
    const decoded = authService.verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json(HttpPresenters.unauthorized('Invalid token'));
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json(HttpPresenters.unauthorized('User not authenticated'));
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json(HttpPresenters.forbidden('Access denied. Admin role required.'));
    return;
  }

  next();
};
