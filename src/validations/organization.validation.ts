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
