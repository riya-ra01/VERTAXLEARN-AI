import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import {
  getProfileHandler,
  updateProfileHandler,
  getUserByIdHandler,
  listUsersHandler,
  setUserActiveHandler,
} from "./users.controller";

const router = Router();

// Current user
router.get("/me",     authenticate, getProfileHandler);
router.patch("/me",   authenticate, updateProfileHandler);

// Public profile lookup
router.get("/:id",    authenticate, getUserByIdHandler);

// Admin only
router.get("/",       authenticate, authorize("admin"), listUsersHandler);
router.patch("/:id/active", authenticate, authorize("admin"), setUserActiveHandler);

export default router;
