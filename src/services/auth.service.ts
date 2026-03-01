import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { AppError } from "../utils/error.util";
import { generateVerificationToken } from "../utils/crypto.util";
import { sendEmail } from "../utils/email.util";
import { ENV } from "../config/env";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  // ✅ Normalize email
  const email = data.email.toLowerCase().trim();

  // ✅ Check existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  // ✅ Generate email verification token
  const { rawToken, hashedToken } = generateVerificationToken();

  const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // ✅ Create user (password auto-hashed by pre-save hook)
    const user = await User.create({
      name: data.name.trim(),
      email,
      password: data.password,
      verificationToken: hashedToken,
      verificationTokenExpires: verificationExpiry,
      isVerified: false,
    });

    // ✅ Create verification link
    const verificationURL = `${ENV.CLIENT_URL}/verify-email?token=${rawToken}`;

    // ✅ Send email
    await sendEmail(
      user.email,
      "Verify Your Taskflow Account",
      `
        <h2>Welcome to Taskflow</h2>
        <p>Please verify your email by clicking below:</p>
        <a href="${verificationURL}">Verify Email</a>
        <p>This link expires in 10 minutes.</p>
      `,
    );

    return {
      success: true,
      message:
        "You've successfully signed up. Please check your email to confirm your account before signing in to the Taskflow dashboard. The confirmation link expires in 10 minutes.",
    };
  } catch (error: any) {
    // ✅ Handle duplicate key race condition
    if (error.code === 11000) {
      throw new AppError("Email already registered", 409);
    }

    throw new AppError("Registration failed. Please try again.", 500);
  }
};

export const verifyEmail = async (token: string) => {
  if (!token) {
    throw new AppError("Invalid verification token", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Token expired or invalid", 400);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  await user.save();

  return {
    message: "Email verified successfully. You can now login.",
  };
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +refreshToken",
  );

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // Check if verified
  if (!user.isVerified) {
    throw new AppError("Please verify your email before login", 403);
  }

  // Compare password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  // 🔐 Hash refresh token before saving
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedRefreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user,
  };
};

export const refreshUserToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  let decoded: any;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  // 2️⃣ Hash incoming refresh token
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // 3️⃣ Find user with matching hashed token
  const user = await User.findOne({
    _id: decoded.userId,
    refreshToken: hashedToken,
  }).select("+refreshToken");

  if (!user) {
    throw new AppError("Refresh token reuse detected", 401);
  }

  const newAccessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  const newHashedRefreshToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  user.refreshToken = newHashedRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.refreshToken = undefined;
  await user.save();

  return {
    message: "Logged out successfully",
  };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return {
      message: "If that email exists, a reset link has been sent.",
    };
  }

  const resetToken = user.generatePasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await sendEmail(
    user.email,
    "Reset Your Password",
    `
      <h3>Password Reset</h3>
      <p>Click below to reset your password:</p>
      <a href="${resetURL}">Reset Password</a>
      <p>This link expires in 10 minutes.</p>
    `,
  );

  return {
    message: "If that email exists, a reset link has been sent.",
  };
};

export const resetPassword = async (token: string, newPassword: string) => {
  if (!token) {
    throw new AppError("Invalid token", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken");

  if (!user) {
    throw new AppError("Token expired or invalid", 400);
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return {
    message: "Password reset successful. Please login again.",
  };
};

export const resendVerificationEmail = async (email: string) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("User already verified", 400);
  }

  const { rawToken, hashedToken } = generateVerificationToken();

  const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationToken = hashedToken;
  user.verificationTokenExpires = verificationExpiry;

  await user.save();

  const verificationURL = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

  await sendEmail(
    user.email,
    "Verify Your Taskflow Account",
    `
      <h2>Welcome to Taskflow</h2>
      <p>Please verify your email by clicking below:</p>
      <a href="${verificationURL}">Verify Email</a>
      <p>This link expires in 10 minutes.</p>
    `,
  );

  return {
    message: "Verification email sent successfully.",
  };
};

export const resendResetPasswordEmail = async (email: string) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return {
      message: "If that email exists, a reset link has been sent.",
    };
  }

  const resetToken = user.generatePasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await sendEmail(
    user.email,
    "Reset Your Password",
    `
      <h3>Password Reset</h3>
      <p>Click below to reset your password:</p>
      <a href="${resetURL}">Reset Password</a>
      <p>This link expires in 10 minutes.</p>
    `,
  );

  return {
    message: "If that email exists, a reset link has been sent.",
  };
};
