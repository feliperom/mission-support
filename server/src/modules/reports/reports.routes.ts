import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { getMonthlyReport } from "./reports.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/monthly/:year/:month", getMonthlyReport);

export default router;
