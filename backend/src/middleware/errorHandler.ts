import { Request, Response, NextFunction } from "express";

/** Global error handler — must have 4 parameters to be recognised by Express. */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err.stack);
  res.status(500).json({ status: "error", message: "Internal server error" });
};
