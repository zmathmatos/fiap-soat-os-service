import { Router } from 'express';
import { WebUserController } from '../../../controllers/WebUserController';

const router = Router();
const userController = new WebUserController();

router.post("/", (req, res) => userController.create(req, res));
router.get("/", (req, res) => userController.getAll(req, res));
router.get("/:id", (req, res) => userController.getById(req, res));
router.get("/document/:document", (req, res) => userController.getByDocument(req, res));
router.put("/:id", (req, res) => userController.update(req, res));
router.delete("/:id", (req, res) => userController.delete(req, res));

export default router;
