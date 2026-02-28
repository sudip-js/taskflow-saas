import { Router } from "express";
import { protect } from "../middlewares/protect.middleware";
import {
  createOrganizationController,
  getMyOrganizationsController,
  getOrganizationByIdController,
} from "../controllers/organization.controller";
import { createOrganizationSchema } from "../validations/organization.validation";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

router.post(
  "/",
  protect,
  validate(createOrganizationSchema),
  createOrganizationController,
);
router.get("/", protect, getMyOrganizationsController);
router.get("/:orgId", protect, getOrganizationByIdController);

export default router;
