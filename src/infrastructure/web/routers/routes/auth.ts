import { Router } from 'express';
import { WebAuthController } from '../../controllers/WebAuthController';

const router = Router();
const authController = new WebAuthController();

router.post('/login', (req, res) => authController.login(req, res));

export default router;
