import { Request, Response, NextFunction } from "express";
import * as svc from "./quizzes.service";
import { CreateQuizBody, CreateQuestionBody, SubmitAttemptBody } from "./quizzes.types";

const id  = (req: Request, key: string) => String(req.params[key]);

export async function listQuizzesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.listByCourse(id(req, "courseId")) }); }
  catch (err) { next(err); }
}

export async function getQuizHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.getById(id(req, "quizId")) }); }
  catch (err) { next(err); }
}

export async function createQuizHandler(req: Request<object, object, CreateQuizBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ status: "ok", data: await svc.create(req.body) }); }
  catch (err) { next(err); }
}

export async function deleteQuizHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { await svc.deleteQuiz(id(req, "quizId")); res.json({ status: "ok" }); }
  catch (err) { next(err); }
}

export async function listQuestionsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.listQuestions(id(req, "quizId")) }); }
  catch (err) { next(err); }
}

export async function addQuestionHandler(req: Request<{ quizId: string }, object, CreateQuestionBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ status: "ok", data: await svc.addQuestion(req.params.quizId, req.body) }); }
  catch (err) { next(err); }
}

export async function deleteQuestionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { await svc.deleteQuestion(id(req, "questionId")); res.json({ status: "ok" }); }
  catch (err) { next(err); }
}

export async function startAttemptHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ status: "ok", data: await svc.startAttempt(id(req, "quizId"), req.user!.sub) }); }
  catch (err) { next(err); }
}

export async function submitAttemptHandler(req: Request<{ attemptId: string }, object, SubmitAttemptBody>, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.submitAttempt(req.params.attemptId, req.user!.sub, req.body) }); }
  catch (err) { next(err); }
}

export async function listAttemptsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ status: "ok", data: await svc.listAttempts(id(req, "quizId"), req.user!.sub) }); }
  catch (err) { next(err); }
}
