import { Request } from "express";

export interface PaginationParams {
  limit: number;
  offset: number;
  page: number;
}

/** Parse ?page=1&limit=20 from query string with safe defaults. */
export const parsePagination = (req: Request): PaginationParams => {
  const page  = Math.max(1, parseInt(req.query["page"]  as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
  return { page, limit, offset: (page - 1) * limit };
};

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams
) => ({
  data,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
});
