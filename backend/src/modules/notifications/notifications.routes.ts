import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  listNotificationsHandler,
  markReadHandler,
  markAllReadHandler,
  deleteNotificationHandler,
} from "./notifications.controller";

const router = Router();

router.get("/",               authenticate, listNotificationsHandler);
router.patch("/read-all",     authenticate, markAllReadHandler);
router.patch("/:id/read",     authenticate, markReadHandler);
router.delete("/:id",         authenticate, deleteNotificationHandler);

export default router;
