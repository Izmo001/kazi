// src/routes/application.routes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createApplication,
  listUserApplications,
  updateApplicationStatus
} from "../controllers/application.controller.js";

const router = express.Router();

router.post("/", protect, createApplication);
router.get("/me", protect, listUserApplications);
router.patch("/:id/status", protect, authorize("admin", "staff"), updateApplicationStatus);

export default router;
