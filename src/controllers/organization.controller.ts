import { Request, Response } from "express";
import {
  createOrganization,
  deleteOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
} from "../services/organization.service";
import { asyncHandler } from "../utils/common.util";
import { OrgParams } from "../types/organization.type";

export const createOrganizationController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const { name } = req.body;

    const org = await createOrganization(user._id.toString(), name);

    res.status(201).json({
      success: true,
      organization: org,
    });
  },
);

export const getMyOrganizationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const order = req.query.order as "asc" | "desc";

    const result = await getMyOrganizations({
      userId: user._id.toString(),
      page,
      limit,
      search,
      sortBy,
      order,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getOrganizationByIdController = asyncHandler(
  async (req: Request<OrgParams>, res: Response) => {
    const user = (req as any).user;
    const { orgId } = req.params;
    const result = await getOrganizationById(orgId, user._id.toString());

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const updateOrganizationController = asyncHandler(
  async (req: Request<OrgParams>, res: Response) => {
    const { orgId } = req.params;
    const { name } = req.body;

    const updatedOrg = await updateOrganization(orgId, name);

    res.status(200).json({
      success: true,
      organization: updatedOrg,
    });
  },
);

export const deleteOrganizationController = asyncHandler(
  async (req: Request<OrgParams>, res: Response) => {
    const { orgId } = req.params;

    const result = await deleteOrganization(orgId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
);
