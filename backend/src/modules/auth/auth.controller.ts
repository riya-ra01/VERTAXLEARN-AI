import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { RegisterBody, LoginBody, RefreshBody } from "./auth.types";

export async function registerHandler(
  req: Request<object, object, RegisterBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({ status: "ok", data });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(
  req: Request<object, object, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await authService.login(req.body);
    res.json({ status: "ok", data });
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(
  req: Request<object, object, RefreshBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await authService.refresh(req.body.refreshToken);
    res.json({ status: "ok", data });
  } catch (err) {
    next(err);
  }
}

export function logoutHandler(_req: Request, res: Response): void {
  // Stateless JWT: client discards tokens. Server-side blacklist can be added later.
  res.json({ status: "ok", message: "Logged out" });
}

export function meHandler(req: Request, res: Response): void {
  // req.user is attached by the authenticate middleware
  res.json({ status: "ok", data: req.user });
}
