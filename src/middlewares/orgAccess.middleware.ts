import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error.util";
import { Organization } from "../models/organization.model";

export const orgAccess =
  (allowedRoles: ("owner" | "admin" | "member")[]) =>
  async (
    req: Request<{ orgId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { orgId } = req.params;
    const user = (req as any).user;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return next(new AppError("Invalid organization ID", 400));
    }

    const organization = await Organization.findOne({
      _id: orgId,
      "members.user": user._id,
    }).select("members owner");

    if (!organization) {
      return next(new AppError("Organization not found", 404));
    }

    const member = organization.members.find(
      (m: any) => m.user.toString() === user._id.toString(),
    );

    if (!member || !allowedRoles.includes(member.role)) {
      return next(new AppError("Forbidden", 403));
    }

    (req as any).organization = organization;

    next();
  };
