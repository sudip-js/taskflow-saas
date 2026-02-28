import { Request, Response } from "express";
import {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
} from "../services/organization.service";
import { asyncHandler } from "../utils/common.util";

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
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const orgId = req.params.orgId as string;
    const result = await getOrganizationById(orgId, user._id.toString());

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);
