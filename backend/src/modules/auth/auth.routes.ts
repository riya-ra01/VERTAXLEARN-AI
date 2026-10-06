import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
} from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

// POST /api/auth/register
router.post("/register", registerHandler);

// POST /api/auth/login
router.post("/login", loginHandler);

// POST /api/auth/refresh
router.post("/refresh", refreshHandler);

// POST /api/auth/logout  (authenticated — allows future token blacklisting)
router.post("/logout", authenticate, logoutHandler);

// GET  /api/auth/me
router.get("/me", authenticate, meHandler);

export default router;
