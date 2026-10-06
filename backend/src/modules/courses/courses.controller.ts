import { Request, Response, NextFunction } from "express";
import * as coursesService from "./courses.service";
import { parsePagination, paginatedResponse } from "../../utils/pagination";
import { CreateCourseBody, UpdateCourseBody, CreateLessonBody } from "./courses.types";

// ── Catalog (public / student) ────────────────────────────────────────────────

export async function listCoursesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pg = parsePagination(req);
    const search = req.query["search"] as string | undefined;
    const { rows, total } = await coursesService.listPublished(pg.limit, pg.offset, search);
    res.json({ status: "ok", ...paginatedResponse(rows, total, pg) });
  } catch (err) { next(err); }
}

export async function getCourseHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await coursesService.getBySlug(String(req.params["slug"]));
    res.json({ status: "ok", data: course });
  } catch (err) { next(err); }
}

export async function listLessonsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lessons = await coursesService.listLessons(String(req.params["courseId"]));
    res.json({ status: "ok", data: lessons });
  } catch (err) { next(err); }
}

export async function listCategoriesHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cats = await coursesService.listCategories();
    res.json({ status: "ok", data: cats });
  } catch (err) { next(err); }
}

// ── Instructor / student actions ──────────────────────────────────────────────

export async function createCourseHandler(req: Request<object, object, CreateCourseBody>, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await coursesService.create(req.user!.sub, req.body);
    res.status(201).json({ status: "ok", data: course });
  } catch (err) { next(err); }
}

export async function updateCourseHandler(req: Request<{ id: string }, object, UpdateCourseBody>, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await coursesService.update(req.params.id, req.user!.sub, req.body);
    res.json({ status: "ok", data: course });
  } catch (err) { next(err); }
}

export async function deleteCourseHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await coursesService.deleteCourse(String(req.params["id"]), req.user!.sub);
    res.json({ status: "ok", message: "Course deleted" });
  } catch (err) { next(err); }
}

export async function createLessonHandler(req: Request<{ courseId: string }, object, CreateLessonBody>, res: Response, next: NextFunction): Promise<void> {
  try {
    const lesson = await coursesService.createLesson(req.params.courseId, req.user!.sub, req.body);
    res.status(201).json({ status: "ok", data: lesson });
  } catch (err) { next(err); }
}

export async function enrollHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await coursesService.enroll(req.user!.sub, String(req.params["courseId"]));
    res.status(201).json({ status: "ok", data });
  } catch (err) { next(err); }
}

export async function myEnrollmentsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await coursesService.listUserEnrollments(req.user!.sub);
    res.json({ status: "ok", data });
  } catch (err) { next(err); }
}

export async function enrollmentStatusHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await coursesService.getEnrollment(req.user!.sub, String(req.params["courseId"]));
    res.json({ status: "ok", data });
  } catch (err) { next(err); }
}
