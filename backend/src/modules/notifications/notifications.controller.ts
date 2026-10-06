import { Request, Response, NextFunction } from "express";
import * as svc from "./notifications.service";
import { parsePagination, paginatedResponse } from "../../utils/pagination";

const p = (req: Request, k: string) => String(req.params[k]);

export async function listNotificationsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pg = parsePagination(req);
    const { rows, total, unread } = await svc.list(req.user!.sub, pg.limit, pg.offset);
    res.json({ status: "ok", unread, ...paginatedResponse(rows, total, pg) });
  } catch (err) { next(err); }
}

export async function markReadHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { await svc.markRead(p(req, "id"), req.user!.sub); res.json({ status: "ok" }); }
  catch (err) { next(err); }
}

export async function markAllReadHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { await svc.markAllRead(req.user!.sub); res.json({ status: "ok" }); }
  catch (err) { next(err); }
}

export async function deleteNotificationHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { await svc.deleteNotification(p(req, "id"), req.user!.sub); res.json({ status: "ok" }); }
  catch (err) { next(err); }
}
