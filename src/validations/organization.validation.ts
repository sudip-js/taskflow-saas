import { z } from "zod";

export const upsertOrganizationSchema = z.object({
  name: z
    .string()
    .nonempty("Organization name is required")
    .min(3, "Organization name must be at least 3 characters long")
    .max(100, "Organization name must be at most 100 characters long"),
});

export const addMemberSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  role: z.enum(["admin", "member"]).default("member"),
});

export const updateMemberRoleSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  role: z.enum(["admin", "member"]),
});

export const removeMemberSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
});

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .nonempty("Email is required")
    .email("Invalid email")
    .max(32, "Email must be at most 32 characters long"),
  role: z.enum(["admin", "member"]).optional(),
});

export const acceptInviteSchema = z.object({
  token: z
    .string()
    .nonempty("Token is required")
    .min(10, "Token must be at least 10 characters long"),
});
