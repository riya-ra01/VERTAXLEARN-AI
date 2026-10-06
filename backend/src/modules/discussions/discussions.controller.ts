import { Request, Response, NextFunction } from "express";
import * as svc from "./discussions.service";
import { CreateDiscussionBody, CreateReplyBody } from "./discussions.types";
import { parsePagination, paginatedResponse } from "../../utils/pagination";

const p = (req: Request, k: string) => String(req.params[k]);

export async function listDiscussionsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pg = parsePagination(req);
    const { rows, total } = await svc.listByCourse(p(req, "courseId"), pg.limit, pg.offset);
    res.json({ status: "ok", ...paginatedResponse(rows, total, pg) });
  } catch (err) { next(err); }
}

export async function getDiscussionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.getById(p(req, "discussionId")) }); }
  catch (err) { next(err); }
}

export async function createDiscussionHandler(req: Request<object, object, CreateDiscussionBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ status: "ok", data: await svc.create(req.user!.sub, req.body) }); }
  catch (err) { next(err); }
}

export async function deleteDiscussionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.deleteDiscussion(p(req, "discussionId"), req.user!.sub, req.user!.role);
    res.json({ status: "ok" });
  } catch (err) { next(err); }
}

export async function pinDiscussionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.pinDiscussion(p(req, "discussionId"), req.body.pinned as boolean);
    res.json({ status: "ok" });
  } catch (err) { next(err); }
}

export async function listRepliesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.listReplies(p(req, "discussionId")) }); }
  catch (err) { next(err); }
}

export async function addReplyHandler(req: Request<{ discussionId: string }, object, CreateReplyBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ status: "ok", data: await svc.addReply(req.params.discussionId, req.user!.sub, req.body) }); }
  catch (err) { next(err); }
}

export async function acceptReplyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { await svc.acceptReply(p(req, "replyId")); res.json({ status: "ok" }); }
  catch (err) { next(err); }
}

export async function deleteReplyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.deleteReply(p(req, "replyId"), req.user!.sub, req.user!.role);
    res.json({ status: "ok" });
  } catch (err) { next(err); }
}
