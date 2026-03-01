import mongoose from "mongoose";
import crypto from "crypto";

import { User } from "../models/user.model";
import { Organization } from "../models/organization.model";
import { GetMembersOptions, GetOrgOptions } from "../types/organization.type";
import { AppError } from "../utils/error.util";
import { OrganizationInvite } from "../models/organizationInvite.model";
import { sendEmail } from "../utils/email.util";

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

export const updateMemberRole = async (
  orgId: string,
  targetUserId: string,
  requesterId: string,
  newRole: "admin" | "member",
) => {
  if (
    !mongoose.Types.ObjectId.isValid(orgId) ||
    !mongoose.Types.ObjectId.isValid(targetUserId)
  ) {
    throw new AppError("Invalid ID", 400);
  }

  const organization = await Organization.findById(orgId);

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const requester = organization.members.find(
    (m) => m.user.toString() === requesterId,
  );

  if (!requester) {
    throw new AppError("Forbidden", 403);
  }

  const targetMember = organization.members.find(
    (m) => m.user.toString() === targetUserId,
  );

  if (!targetMember) {
    throw new AppError("Member not found", 404);
  }

  if (targetMember.role === "owner") {
    throw new AppError("Owner role cannot be modified", 400);
  }

  if (requester.role === "admin") {
    if (targetMember.role === "admin") {
      throw new AppError("Admins cannot modify other admins", 403);
    }
    if (newRole === "admin") {
      throw new AppError("Admins cannot promote members to admin", 403);
    }
  }

  if (targetMember.role === newRole) {
    throw new AppError("User already has this role", 400);
  }

  targetMember.role = newRole;

  await organization.save();

  return {
    message: "Member role updated successfully",
  };
};

export const removeMemberFromOrganization = async (
  orgId: string,
  targetUserId: string,
  requesterId: string,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(orgId) ||
    !mongoose.Types.ObjectId.isValid(targetUserId)
  ) {
    throw new AppError("Invalid ID", 400);
  }

  const organization = await Organization.findById(orgId);

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const requester = organization.members.find(
    (m) => m.user.toString() === requesterId,
  );

  if (!requester) {
    throw new AppError("Forbidden", 403);
  }

  const targetMember = organization.members.find(
    (m) => m.user.toString() === targetUserId,
  );

  if (!targetMember) {
    throw new AppError("Member not found", 404);
  }

  if (targetMember.role === "owner") {
    throw new AppError("Owner cannot be removed", 400);
  }

  if (requester.role === "admin") {
    if (targetMember.role === "admin") {
      throw new AppError("Admins cannot remove other admins", 403);
    }
  }

  organization.members = organization.members.filter(
    (m) => m.user.toString() !== targetUserId,
  );

  await organization.save();

  return {
    message: "Member removed successfully",
  };
};

// Invite Members

export const inviteMember = async (
  orgId: string,
  requesterId: string,
  email: string,
  role: "admin" | "member",
) => {
  email = email.toLowerCase().trim();

  if (!process.env.INVITE_TOKEN_SECRET) {
    throw new Error("INVITE_TOKEN_SECRET is not defined");
  }

  const organization = await Organization.findById(orgId);

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const requester = organization.members.find(
    (m) => m.user.toString() === requesterId,
  );

  if (!requester || !["owner", "admin"].includes(requester.role)) {
    throw new AppError("Forbidden", 403);
  }

  if (!["admin", "member"].includes(role)) {
    console.log({ role });
    throw new AppError("Invalid role", 400);
  }

  if (role === "admin" && requester.role !== "owner") {
    throw new AppError("Only owner can invite admin", 403);
  }

  const user = await User.findOne({ email });

  if (user) {
    const alreadyMember = organization.members.some(
      (m) => m.user.toString() === user._id.toString(),
    );

    if (alreadyMember) {
      throw new AppError("User already a member", 400);
    }
  }

  const existingInvite = await OrganizationInvite.findOne({
    organization: orgId,
    email,
    expiresAt: { $gt: new Date() },
  });

  if (existingInvite) {
    throw new AppError("User already invited", 400);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken + process.env.INVITE_TOKEN_SECRET)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await OrganizationInvite.create({
    organization: orgId,
    email,
    role,
    token: hashedToken,
    expiresAt,
  });

  const inviteURL = `${process.env.CLIENT_URL}/accept-invite?token=${rawToken}`;

  await sendEmail(
    email,
    "Organization Invitation",
    `
      <h3>You have been invited to join ${organization.name}</h3>
      <p>Click below to join the organization:</p>
      <a href="${inviteURL}">Accept Invitation</a>
      <p>This link expires in 24 hours.</p>
    `,
  );

  return { message: "Invitation sent successfully" };
};

export const acceptInvite = async (
  orgId: string,
  rawToken: string,
  userId: string,
  userEmail: string,
) => {
  if (!process.env.INVITE_TOKEN_SECRET) {
    throw new Error("INVITE_TOKEN_SECRET is not defined");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken + process.env.INVITE_TOKEN_SECRET)
    .digest("hex");

  const invite = await OrganizationInvite.findOne({
    organization: orgId,
    token: hashedToken,
  }).select("+token");

  if (!invite) {
    throw new AppError("Invalid invite token", 400);
  }

  if (invite.expiresAt < new Date()) {
    throw new AppError("Invite expired", 400);
  }

  if (invite.email !== userEmail) {
    throw new AppError("This invite is not for you", 403);
  }

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const alreadyMember = organization.members.find(
    (m) => m.user.toString() === userId,
  );

  if (alreadyMember) {
    throw new AppError("Already a member", 400);
  }

  organization.members.push({
    user: userId as any,
    role: invite.role,
  });

  await organization.save();

  await invite.deleteOne();

  return { message: "Joined organization successfully" };
};

export const declineInvite = async (
  orgId: string,
  rawToken: string,
  userEmail: string,
) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const invite = await OrganizationInvite.findOne({
    organization: orgId,
    token: hashedToken,
  }).select("+token");

  if (!invite) {
    throw new AppError("Invalid invite token", 400);
  }

  if (invite.email !== userEmail) {
    throw new AppError("Forbidden", 403);
  }

  await invite.deleteOne();

  return { message: "Invitation declined" };
};
