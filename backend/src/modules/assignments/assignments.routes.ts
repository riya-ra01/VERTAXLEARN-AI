import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import {
  listAssignmentsHandler, getAssignmentHandler, createAssignmentHandler, deleteAssignmentHandler,
  submitAssignmentHandler, getMySubmissionHandler, listSubmissionsHandler, gradeSubmissionHandler,
} from "./assignments.controller";

const router = Router({ mergeParams: true }); // receives :courseId from parent

// Assignments
router.get("/",                       listAssignmentsHandler);
router.post("/",                      authenticate, authorize("instructor","admin"), createAssignmentHandler);
router.get("/:assignmentId",          authenticate, getAssignmentHandler);
router.delete("/:assignmentId",       authenticate, authorize("instructor","admin"), deleteAssignmentHandler);

// Submissions
router.post("/:assignmentId/submit",        authenticate, submitAssignmentHandler);
router.get("/:assignmentId/my-submission",  authenticate, getMySubmissionHandler);
router.get("/:assignmentId/submissions",    authenticate, authorize("instructor","admin"), listSubmissionsHandler);
router.patch("/submissions/:submissionId/grade", authenticate, authorize("instructor","admin"), gradeSubmissionHandler);

export default router;
