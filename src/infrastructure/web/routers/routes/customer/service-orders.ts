import { Router } from "express";
import { WebServiceOrderController } from "../../../controllers/WebServiceOrderController";

const router = Router();
const serviceOrderController = new WebServiceOrderController();

router.post("/", (req, res) => serviceOrderController.createForCustomer(req, res));
router.get("/number/:serviceOrderNumber", (req, res) => serviceOrderController.getByServiceOrderNumber(req, res));
router.get("/user/document/:document", (req, res) => serviceOrderController.getByUserDocument(req, res));
router.get("/vehicle/license-plate/:licensePlate", (req, res) => serviceOrderController.getByVehicleLicensePlate(req, res));
router.get("/:serviceOrderNumber/quotation/approval", (req, res) => serviceOrderController.approveQuotation(req, res));
router.get("/:serviceOrderNumber/quotation/rejection", (req, res) => serviceOrderController.rejectQuotation(req, res));

export default router;
