export interface GetOrgOptions {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface OrgParams {
  orgId: string;
}

export interface GetMembersOptions {
  orgId: string;
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  role?: "owner" | "admin" | "member";
}
