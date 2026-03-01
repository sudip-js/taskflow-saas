import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty("Name is required")
    .min(3, "Name must be at least 3 characters long")
    .max(15, "Name must be at most 15 characters long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .nonempty("Email is required")
    .email("Invalid email")
    .max(32, "Email must be at most 32 characters long"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .nonempty("Email is required")
    .email("Invalid email")
    .max(32, "Email must be at most 32 characters long"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .nonempty("Email is required")
    .email("Invalid email")
    .max(32, "Email must be at most 32 characters long"),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .nonempty("Token is required")
    .min(10, "Token must be at least 10 characters long"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long"),
});

export const resendVerificationEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .nonempty("Email is required")
    .email("Invalid email")
    .max(32, "Email must be at most 32 characters long"),
});
