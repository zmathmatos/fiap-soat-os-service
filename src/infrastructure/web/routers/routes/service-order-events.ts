import { Router } from "express";
import { WebServiceOrderController } from "../../controllers/WebServiceOrderController";

const router = Router();
const serviceOrderController = new WebServiceOrderController();

router.post("/:id/events", (req, res) => serviceOrderController.handleBillingEvent(req, res));

export default router;
