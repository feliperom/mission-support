import { Router } from "express";
import {
  listOfferings,
  createOffering,
  updateOffering,
  getMonthlySummary,
  getMonthlyCheck,
} from "./offerings.controller.js";

const router = Router();

router.get("/monthly-summary", getMonthlySummary);
router.get("/monthly-check", getMonthlyCheck);
router.get("/", listOfferings);
router.post("/", createOffering);
router.put("/:id", updateOffering);

export default router;
