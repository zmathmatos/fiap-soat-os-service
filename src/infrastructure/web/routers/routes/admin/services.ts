import { Router } from "express";
import { WebServiceController } from "../../../controllers/WebServiceController";

const router = Router();
const serviceController = new WebServiceController();

router.post("/", (req, res) => serviceController.create(req, res));
router.get("/", (req, res) => serviceController.getAll(req, res));
router.get("/:id", (req, res) => serviceController.getById(req, res));
router.get("/service-code/:serviceCode", (req, res) =>
  serviceController.getServiceByServiceCode(req, res)
);
router.put("/:id", (req, res) => serviceController.update(req, res));
router.delete("/:id", (req, res) => serviceController.delete(req, res));

export default router;
