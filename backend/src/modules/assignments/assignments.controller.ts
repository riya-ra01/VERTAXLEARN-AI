import { Request, Response, NextFunction } from "express";
import * as svc from "./assignments.service";
import { CreateAssignmentBody, SubmitAssignmentBody, GradeSubmissionBody } from "./assignments.types";

const id = (req: Request, key: string) => String(req.params[key]);

export async function listAssignmentsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.listByCourse(id(req, "courseId")) }); }
  catch (err) { next(err); }
}

export async function getAssignmentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.getById(id(req, "assignmentId")) }); }
  catch (err) { next(err); }
}

export async function createAssignmentHandler(req: Request<object, object, CreateAssignmentBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ status: "ok", data: await svc.create(req.body) }); }
  catch (err) { next(err); }
}

export async function deleteAssignmentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { await svc.deleteAssignment(id(req, "assignmentId")); res.json({ status: "ok" }); }
  catch (err) { next(err); }
}

export async function submitAssignmentHandler(req: Request<{ assignmentId: string }, object, SubmitAssignmentBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ status: "ok", data: await svc.submit(req.params.assignmentId, req.user!.sub, req.body) }); }
  catch (err) { next(err); }
}

export async function getMySubmissionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const submission = await svc.getSubmission(id(req, "assignmentId"), req.user!.sub);
    res.json({ status: "ok", data: submission });
  }
  catch (err) { next(err); }
}

export async function listSubmissionsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.listSubmissions(id(req, "assignmentId")) }); }
  catch (err) { next(err); }
}

export async function gradeSubmissionHandler(req: Request<{ submissionId: string }, object, GradeSubmissionBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.grade(req.params.submissionId, req.user!.sub, req.body) }); }
  catch (err) { next(err); }
}
