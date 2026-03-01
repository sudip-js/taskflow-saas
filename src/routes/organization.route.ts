import { Router } from "express";
import { protect } from "../middlewares/protect.middleware";
import {
  createOrganizationController,
  deleteOrganizationController,
  getMyOrganizationsController,
  getOrganizationByIdController,
  updateOrganizationController,
} from "../controllers/organization.controller";
import { upsertOrganizationSchema } from "../validations/organization.validation";
import { validate } from "../middlewares/validate.middleware";
import { orgAccess } from "../middlewares/orgAccess.middleware";

const router = Router();

router.post(
  "/",
  protect,
  validate(upsertOrganizationSchema),
  createOrganizationController,
);
router.get("/", protect, getMyOrganizationsController);
router.get("/:orgId", protect, getOrganizationByIdController);

router.patch(
  "/:orgId",
  validate(upsertOrganizationSchema),
  protect,
  orgAccess(["owner", "admin"]),
  updateOrganizationController,
);

router.delete(
  "/:orgId",
  protect,
  orgAccess(["owner"]),
  deleteOrganizationController,
);

export default router;
