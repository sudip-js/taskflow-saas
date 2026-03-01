import { Request, Response } from "express";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
  resendResetPasswordEmail,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from "../services/auth.service";
import { asyncHandler } from "../utils/common.util";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: result.message,
    });
  },
);

export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.query;

    const result = await verifyEmail(token as string);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { accessToken, refreshToken, user } = await loginUser(
      email,
      password,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken,
      user,
    });
  },
);

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshUserToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken,
    });
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user;

    await logoutUser(userId);

    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);

export const getMeController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    res.status(200).json({
      success: true,
      user,
    });
  },
);

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await forgotPassword(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const result = await resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
);

export const resendVerificationEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    console.log({ email });

    const result = await resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
);

export const resendResetPasswordEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    console.log({ email });

    const result = await resendResetPasswordEmail(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
);
