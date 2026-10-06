import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import {
  listDiscussionsHandler, getDiscussionHandler, createDiscussionHandler,
  deleteDiscussionHandler, pinDiscussionHandler,
  listRepliesHandler, addReplyHandler, acceptReplyHandler, deleteReplyHandler,
} from "./discussions.controller";

const router = Router({ mergeParams: true }); // receives :courseId

router.get("/",                       listDiscussionsHandler);
router.post("/",                      authenticate, createDiscussionHandler);
router.get("/:discussionId",          authenticate, getDiscussionHandler);
router.delete("/:discussionId",       authenticate, deleteDiscussionHandler);
router.patch("/:discussionId/pin",    authenticate, authorize("instructor","admin"), pinDiscussionHandler);

router.get("/:discussionId/replies",  authenticate, listRepliesHandler);
router.post("/:discussionId/replies", authenticate, addReplyHandler);
router.patch("/:discussionId/replies/:replyId/accept", authenticate, authorize("instructor","admin"), acceptReplyHandler);
router.delete("/:discussionId/replies/:replyId",       authenticate, deleteReplyHandler);

export default router;
