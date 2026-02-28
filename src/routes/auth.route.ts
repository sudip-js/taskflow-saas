import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validations/auth.validation";
import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resetPasswordController,
  verifyEmailController,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/protect.middleware";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.get("/verify-email", verifyEmailController);
router.post("/login", validate(loginSchema), loginController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", protect, logoutController);
router.get("/me", protect, getMeController);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController,
);

export default router;
