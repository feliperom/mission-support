import { Router } from "express";
import {
  listSupporters,
  getSupporterById,
  createSupporter,
  updateSupporter,
  deleteSupporter,
  getBirthdays,
} from "./supporters.controller.js";

const router = Router();

router.get("/birthdays", getBirthdays);
router.get("/", listSupporters);
router.get("/:id", getSupporterById);
router.post("/", createSupporter);
router.put("/:id", updateSupporter);
router.delete("/:id", deleteSupporter);

export default router;
