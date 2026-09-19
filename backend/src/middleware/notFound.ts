import { Request, Response, NextFunction } from "express";

/** Catch-all for unmatched routes. */
export const notFound = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({ status: "error", message: `Route ${req.path} not found` });
};
