import { Router } from "express";
import { WebServiceOrderController } from "../../../controllers/WebServiceOrderController";

const router = Router();
const serviceOrderController = new WebServiceOrderController();

router.post("/", (req, res) => serviceOrderController.create(req, res));
router.get("/analytics/average-time", (req, res) => serviceOrderController.getAverageServiceTime(req, res));
router.get("/", (req, res) => serviceOrderController.getAll(req, res));
router.get("/number/:serviceOrderNumber", (req, res) => serviceOrderController.getByServiceOrderNumber(req, res));
router.get("/:id", (req, res) => serviceOrderController.getById(req, res));
router.get("/user/:userId", (req, res) => serviceOrderController.getByUserId(req, res));
router.get("/user/document/:document", (req, res) => serviceOrderController.getByUserDocument(req, res));
router.get("/vehicle/:vehicleId", (req, res) => serviceOrderController.getByVehicleId(req, res));
router.get("/vehicle/license-plate/:licensePlate", (req, res) => serviceOrderController.getByVehicleLicensePlate(req, res));
router.delete("/:id", (req, res) => serviceOrderController.delete(req, res));
router.put("/:id", (req, res) => serviceOrderController.update(req, res));
router.put("/:id/in-diagnostic", (req, res) => serviceOrderController.setAsInDiagnostic(req, res));
router.put("/:id/add-parts-and-services", (req, res) => serviceOrderController.addPartsAndServices(req, res));
router.put("/:id/in-execution", (req, res) => serviceOrderController.setAsInExecution(req, res));
router.put("/:id/completed", (req, res) => serviceOrderController.setAsCompleted(req, res));
router.put("/:id/delivered", (req, res) => serviceOrderController.setAsDelivered(req, res));
router.put("/:id/status", (req, res) => serviceOrderController.updateStatus(req, res));

export default router;
