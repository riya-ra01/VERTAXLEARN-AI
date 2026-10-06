import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import {
  listQuizzesHandler, getQuizHandler, createQuizHandler, deleteQuizHandler,
  listQuestionsHandler, addQuestionHandler, deleteQuestionHandler,
  startAttemptHandler, submitAttemptHandler, listAttemptsHandler,
} from "./quizzes.controller";

const router = Router({ mergeParams: true }); // receives :courseId from parent

// Quizzes
router.get("/",                   listQuizzesHandler);
router.post("/",                  authenticate, authorize("instructor","admin"), createQuizHandler);
router.get("/:quizId",            authenticate, getQuizHandler);
router.delete("/:quizId",         authenticate, authorize("instructor","admin"), deleteQuizHandler);

// Questions
router.get("/:quizId/questions",  authenticate, listQuestionsHandler);
router.post("/:quizId/questions", authenticate, authorize("instructor","admin"), addQuestionHandler);
router.delete("/:quizId/questions/:questionId", authenticate, authorize("instructor","admin"), deleteQuestionHandler);

// Attempts
router.post("/:quizId/attempts",              authenticate, startAttemptHandler);
router.patch("/attempts/:attemptId/submit",   authenticate, submitAttemptHandler);
router.get("/:quizId/attempts",               authenticate, listAttemptsHandler);

export default router;
