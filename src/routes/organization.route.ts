import { Router } from "express";
import { protect } from "../middlewares/protect.middleware";
import { validate } from "../middlewares/validate.middleware";
import { orgAccess } from "../middlewares/orgAccess.middleware";
import {
  addMemberSchema,
  upsertOrganizationSchema,
} from "../validations/organization.validation";
import {
  addMemberController,
  createOrganizationController,
  deleteOrganizationController,
  getMyOrganizationsController,
  getOrganizationByIdController,
  getOrganizationMembersController,
  updateOrganizationController,
} from "../controllers/organization.controller";

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
  protect,
  orgAccess(["owner", "admin"]),
  validate(upsertOrganizationSchema),
  updateOrganizationController,
);

router.delete(
  "/:orgId",
  protect,
  orgAccess(["owner"]),
  deleteOrganizationController,
);

// Org Member
router.post(
  "/:orgId/members",
  protect,
  orgAccess(["owner", "admin"]),
  validate(addMemberSchema),
  addMemberController,
);

router.get("/:orgId/members", protect, getOrganizationMembersController);

export default router;
