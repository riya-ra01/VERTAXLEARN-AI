import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import {
  getMyPointsHandler, getTransactionsHandler, awardPointsHandler,
  leaderboardHandler, listBadgesHandler, createBadgeHandler,
  getMyBadgesHandler, awardBadgeHandler,
} from "./gamification.controller";

const router = Router();

// Points
router.get("/points/me",           authenticate, getMyPointsHandler);
router.get("/points/transactions", authenticate, getTransactionsHandler);
router.post("/points/award",       authenticate, authorize("admin"), awardPointsHandler);
router.get("/leaderboard",         leaderboardHandler);

// Badges
router.get("/badges",                          listBadgesHandler);
router.post("/badges",                         authenticate, authorize("admin"), createBadgeHandler);
router.get("/badges/me",                       authenticate, getMyBadgesHandler);
router.post("/badges/:badgeId/award/:userId",  authenticate, authorize("admin"), awardBadgeHandler);

export default router;
