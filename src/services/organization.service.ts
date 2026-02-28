import mongoose from "mongoose";
import { Organization } from "../models/organization.model";
import { GetOrgOptions } from "../types/organization.type";
import { AppError } from "../utils/error.util";

export const createOrganization = async (userId: string, name: string) => {
  if (!name) {
    throw new AppError("Organization name is required", 400);
  }

  const org = await Organization.create({
    name,
    owner: userId,
    members: [
      {
        user: userId,
        role: "owner",
      },
    ],
  });

  return org;
};

export const getMyOrganizations = async ({
  userId,
  page = 1,
  limit = 10,
  search,
  sortBy = "createdAt",
  order = "desc",
}: GetOrgOptions) => {
  const skip = (page - 1) * limit;

  const filter: any = {
    "members.user": userId,
  };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const allowedSortFields = ["createdAt", "name"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const sortOrder = order === "asc" ? 1 : -1;

  const [organizations, total] = await Promise.all([
    Organization.find(filter)
      .select("_id name owner createdAt")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),

    Organization.countDocuments(filter),
  ]);

  return {
    data: organizations,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrganizationById = async (orgId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    throw new AppError("Invalid organization ID", 400);
  }

  const organization = await Organization.findOne({
    _id: orgId,
    "members.user": userId,
  })
    .select("name owner members createdAt updatedAt")
    .lean();

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const currentMember = organization.members.find(
    (member: any) => member.user.toString() === userId,
  );

  const userRole = currentMember?.role || null;

  return {
    organization: {
      _id: organization._id,
      name: organization.name,
      owner: organization.owner,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    },
    userRole,
  };
};
