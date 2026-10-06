import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import {
  listCoursesHandler,
  getCourseHandler,
  createCourseHandler,
  updateCourseHandler,
  deleteCourseHandler,
  listLessonsHandler,
  createLessonHandler,
  enrollHandler,
  myEnrollmentsHandler,
  enrollmentStatusHandler,
  listCategoriesHandler,
} from "./courses.controller";

const router = Router();

// ── Categories (public) ───────────────────────────────────────────────────────
router.get("/categories", listCategoriesHandler);

// ── Course catalog (public) ───────────────────────────────────────────────────
router.get("/",           listCoursesHandler);
router.get("/:slug",      getCourseHandler);

// ── Lessons ───────────────────────────────────────────────────────────────────
router.get("/:courseId/lessons", listLessonsHandler);
router.post(
  "/:courseId/lessons",
  authenticate,
  authorize("instructor", "admin"),
  createLessonHandler
);

// ── Enrollments ───────────────────────────────────────────────────────────────
router.get("/enrollments/me",           authenticate, myEnrollmentsHandler);
router.post("/:courseId/enroll",        authenticate, enrollHandler);
router.get("/:courseId/enrollment",     authenticate, enrollmentStatusHandler);

// ── Instructor / Admin CRUD ───────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  createCourseHandler
);
router.patch(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  updateCourseHandler
);
router.delete(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  deleteCourseHandler
);

export default router;
