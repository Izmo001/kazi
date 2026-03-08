import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createJob, listJobs } from "../controllers/job.controller.js";

const router = express.Router();

// create job (staff/admin)
router.post("/", protect, authorize("STAFF","ADMIN"), createJob);

// list jobs (any logged-in user)
router.get("/", protect, listJobs);

export default router;
