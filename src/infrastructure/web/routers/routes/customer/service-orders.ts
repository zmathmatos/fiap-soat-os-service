import { Router } from "express";
import { WebServiceOrderController } from "../../../controllers/WebServiceOrderController";
import { authMiddleware } from "../../../../../interface/middleware/authMiddleware";

const router = Router();
const serviceOrderController = new WebServiceOrderController();

// Public: a customer may not be registered or authenticated yet when creating their first order
router.post("/", (req, res) => serviceOrderController.createForCustomer(req, res));

router.get("/number/:serviceOrderNumber", authMiddleware, (req, res) => serviceOrderController.getByServiceOrderNumber(req, res));
router.get("/user/document/:document", authMiddleware, (req, res) => serviceOrderController.getByUserDocument(req, res));
router.get("/vehicle/license-plate/:licensePlate", authMiddleware, (req, res) => serviceOrderController.getByVehicleLicensePlate(req, res));
router.get("/:serviceOrderNumber/quotation/approval", authMiddleware, (req, res) => serviceOrderController.approveQuotation(req, res));
router.get("/:serviceOrderNumber/quotation/rejection", authMiddleware, (req, res) => serviceOrderController.rejectQuotation(req, res));

export default router;
