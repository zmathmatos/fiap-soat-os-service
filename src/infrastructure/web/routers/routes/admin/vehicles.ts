import { Router } from 'express';
import { WebVehicleController } from '../../../controllers/WebVehicleController';

const router = Router();
const vehicleController = new WebVehicleController();

router.post("/", (req, res) => vehicleController.create(req, res));
router.get("/", (req, res) => vehicleController.getAll(req, res));
router.get("/:id", (req, res) => vehicleController.getById(req, res));
router.get("/license-plate/:licensePlate", (req, res) => vehicleController.getVehicleByLicensePlate(req, res));
router.put("/:id", (req, res) => vehicleController.update(req, res));
router.delete("/:id", (req, res) => vehicleController.delete(req, res));

export default router;
