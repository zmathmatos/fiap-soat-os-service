import { Router } from 'express';
import { WebPartController } from '../../../controllers/WebPartController';

const router = Router();
const partController = new WebPartController();

router.post("/", (req, res) => partController.create(req, res));
router.get("/", (req, res) => partController.getAll(req, res));
router.get("/:id", (req, res) => partController.getById(req, res));
router.get("/part-number/:partNumber", (req, res) => partController.getPartByPartNumber(req, res));
router.put("/:id", (req, res) => partController.update(req, res));
router.delete("/:id", (req, res) => partController.delete(req, res));

export default router;
