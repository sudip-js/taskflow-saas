export interface GetOrgOptions {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}
