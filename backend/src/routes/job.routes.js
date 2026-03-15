import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  closeJob,
  getJobsBySkills
} from "../controllers/job.controller.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get("/", getJobs);
router.get("/:id", getJobById);
router.post("/match", getJobsBySkills); // Get jobs matching user skills

// Admin only routes
router.post("/", authorize("admin"), createJob);
router.put("/:id", authorize("admin"), updateJob);
router.patch("/:id/close", authorize("admin"), closeJob);

export default router;