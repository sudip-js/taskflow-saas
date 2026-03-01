import { Schema, model, Types } from "mongoose";

export interface IOrganizationInvite {
  organization: Types.ObjectId;
  email: string;
  role: "admin" | "member";
  token: string;
  expiresAt: Date;
}

const organizationInviteSchema = new Schema<IOrganizationInvite>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    token: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // auto-delete after expiry
    },
  },
  { timestamps: true },
);

export const OrganizationInvite = model<IOrganizationInvite>(
  "OrganizationInvite",
  organizationInviteSchema,
);
