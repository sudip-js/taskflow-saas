import { Router } from "express";
import { protect } from "../middlewares/protect.middleware";
import { validate } from "../middlewares/validate.middleware";
import { orgAccess } from "../middlewares/orgAccess.middleware";
import {
  acceptInviteSchema,
  addMemberSchema,
  inviteMemberSchema,
  removeMemberSchema,
  updateMemberRoleSchema,
  upsertOrganizationSchema,
} from "../validations/organization.validation";
import {
  acceptInviteController,
  addMemberController,
  createOrganizationController,
  declineInviteController,
  deleteOrganizationController,
  getMyOrganizationsController,
  getOrganizationByIdController,
  getOrganizationMembersController,
  inviteMemberController,
  removeMemberController,
  updateMemberRoleController,
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

router.patch(
  "/:orgId/members",
  protect,
  orgAccess(["owner", "admin"]),
  validate(updateMemberRoleSchema),
  updateMemberRoleController,
);

router.delete(
  "/:orgId/members",
  protect,
  validate(removeMemberSchema),
  removeMemberController,
);

router.post(
  "/:orgId/invite",
  protect,
  validate(inviteMemberSchema),
  inviteMemberController,
);

router.post(
  "/:orgId/invite/accept",
  protect,
  validate(acceptInviteSchema),
  acceptInviteController,
);

router.post("/:orgId/invite/decline", protect, declineInviteController);

export default router;
