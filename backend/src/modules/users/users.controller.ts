import { Request, Response, NextFunction } from "express";
import * as usersService from "./users.service";
import { parsePagination, paginatedResponse } from "../../utils/pagination";
import { UpdateProfileBody } from "./users.types";

export async function getProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersService.getById(req.user!.sub);
    res.json({ status: "ok", data: user });
  } catch (err) { next(err); }
}

export async function updateProfileHandler(
  req: Request<object, object, UpdateProfileBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersService.updateProfile(req.user!.sub, req.body);
    res.json({ status: "ok", data: user });
  } catch (err) { next(err); }
}

export async function getUserByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersService.getById(String(req.params["id"]));
    res.json({ status: "ok", data: user });
  } catch (err) { next(err); }
}

// ── Admin handlers ────────────────────────────────────────────────────────────

export async function listUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pg = parsePagination(req);
    const { rows, total } = await usersService.listUsers(pg.limit, pg.offset);
    res.json({ status: "ok", ...paginatedResponse(rows, total, pg) });
  } catch (err) { next(err); }
}

export async function setUserActiveHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { isActive } = req.body as { isActive: boolean };
    await usersService.setActive(String(req.params["id"]), isActive);
    res.json({ status: "ok", message: `User ${isActive ? "activated" : "deactivated"}` });
  } catch (err) { next(err); }
}
