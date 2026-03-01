import { Router } from "express";
import { protect } from "../middlewares/protect.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationEmailSchema,
  resetPasswordSchema,
} from "../validations/auth.validation";
import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendResetPasswordEmailController,
  resendVerificationEmailController,
  resetPasswordController,
  verifyEmailController,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.get("/verify-email", verifyEmailController);
router.post(
  "/resend-verification-email",
  validate(resendVerificationEmailSchema),
  resendVerificationEmailController,
);
router.post("/login", validate(loginSchema), loginController);
router.get("/refresh-token", refreshTokenController);
router.get("/logout", protect, logoutController);
router.get("/me", protect, getMeController);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController,
);
router.post(
  "/resend-reset-password-email",
  validate(forgotPasswordSchema),
  resendResetPasswordEmailController,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController,
);

export default router;
