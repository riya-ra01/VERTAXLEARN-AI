import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  status?: number;
}

/** Global error handler — must have 4 parameters to be recognised by Express. */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.status ?? 500;
  if (statusCode >= 500) console.error(err.stack);
  res.status(statusCode).json({
    status: "error",
    message: err.message ?? "Internal server error",
  });
};
