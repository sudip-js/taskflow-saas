import { Schema, model, Types } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  owner: Types.ObjectId;
  members: {
    user: Types.ObjectId;
    role: "owner" | "admin" | "member";
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

organizationSchema.index({ "members.user": 1, owner: 1 });

export const Organization = model<IOrganization>(
  "Organization",
  organizationSchema,
);
