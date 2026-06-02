import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import {
  getDashboardSummary,
  getDashboardEvolution,
  getDashboardBirthdays,
  getDashboardPendingCalls,
  getDashboardRegionStats
} from "./dashboard.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/summary", getDashboardSummary);
router.get("/evolution", getDashboardEvolution);
router.get("/birthdays", getDashboardBirthdays);
router.get("/pending-calls", getDashboardPendingCalls);
router.get("/region-stats", getDashboardRegionStats);

export default router;
