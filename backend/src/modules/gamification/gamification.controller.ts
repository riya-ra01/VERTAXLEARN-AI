import { Request, Response, NextFunction } from "express";
import * as svc from "./gamification.service";
import { AwardPointsBody, CreateBadgeBody } from "./gamification.types";

const p = (req: Request, k: string) => String(req.params[k]);

export async function getMyPointsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.getPoints(req.user!.sub) }); }
  catch (err) { next(err); }
}

export async function getTransactionsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.getTransactions(req.user!.sub) }); }
  catch (err) { next(err); }
}

export async function awardPointsHandler(req: Request<object, object, AwardPointsBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.awardPoints(req.body) }); }
  catch (err) { next(err); }
}

export async function leaderboardHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(50, parseInt(req.query["limit"] as string) || 10);
    res.json({ status: "ok", data: await svc.leaderboard(limit) });
  } catch (err) { next(err); }
}

export async function listBadgesHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.listBadges() }); }
  catch (err) { next(err); }
}

export async function createBadgeHandler(req: Request<object, object, CreateBadgeBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ status: "ok", data: await svc.createBadge(req.body) }); }
  catch (err) { next(err); }
}

export async function getMyBadgesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.getUserBadges(req.user!.sub) }); }
  catch (err) { next(err); }
}

export async function awardBadgeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await svc.awardBadge(p(req, "userId"), p(req, "badgeId"));
    res.status(201).json({ status: "ok", data });
  } catch (err) { next(err); }
}
