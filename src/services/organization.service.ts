import mongoose from "mongoose";
import { User } from "../models/user.model";
import { Organization } from "../models/organization.model";
import { GetMembersOptions, GetOrgOptions } from "../types/organization.type";
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

export const updateOrganization = async (orgId: string, name: string) => {
  const organization = await Organization.findById(orgId);

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  organization.name = name;
  await organization.save();

  return organization;
};

export const deleteOrganization = async (orgId: string) => {
  const org = await Organization.findById(orgId);

  if (!org) {
    throw new AppError("Organization not found", 404);
  }

  await org.deleteOne();

  return { message: "Organization deleted successfully" };
};

// Org members

export const addMemberToOrganization = async (
  orgId: string,
  userId: string,
  role: "admin" | "member",
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const organization = await Organization.findById(orgId);

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const existingMember = organization.members.find(
    (member) => member.user.toString() === userId,
  );

  if (existingMember) {
    throw new AppError("User is already a member", 400);
  }

  await Organization.updateOne(
    { _id: orgId },
    {
      $addToSet: {
        members: {
          user: userId,
          role,
        },
      },
    },
  );

  return {
    message: "Member added successfully",
  };
};

export const getOrganizationMembers = async ({
  orgId,
  userId,
  page = 1,
  limit = 10,
  search,
  role,
}: GetMembersOptions) => {
  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    throw new AppError("Invalid organization ID", 400);
  }

  const org = await Organization.findOne({
    _id: orgId,
    "members.user": userId,
  }).select("_id");

  if (!org) {
    throw new AppError("Organization not found", 404);
  }

  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: { _id: new mongoose.Types.ObjectId(orgId) } },
    { $unwind: "$members" },

    ...(role ? [{ $match: { "members.role": role } }] : []),

    {
      $lookup: {
        from: "users",
        localField: "members.user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    ...(search
      ? [
          {
            $match: {
              $or: [
                { "user.name": { $regex: search, $options: "i" } },
                { "user.email": { $regex: search, $options: "i" } },
              ],
            },
          },
        ]
      : []),

    {
      $project: {
        _id: 0,
        userId: "$user._id",
        name: "$user.name",
        email: "$user.email",
        role: "$members.role",
        joinedAt: "$user.createdAt",
      },
    },

    { $skip: skip },
    { $limit: limit },
  ];

  const members = await Organization.aggregate(pipeline);

  return {
    data: members,
    meta: {
      page,
      limit,
    },
  };
};
