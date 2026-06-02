import { Router } from "express";
import {
  listContacts,
  createContact,
  getPendingContacts,
} from "./contacts.controller.js";

const router = Router();

router.get("/pending", getPendingContacts);
router.get("/", listContacts);
router.post("/", createContact);

export default router;
