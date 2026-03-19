import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { 
  getRevenueAnalytics, 
  getPredictionData 
} from "../controllers/analytics.controller.js";

const router = express.Router();

// All analytics routes require authentication and admin role
router.use(protect);
router.use(authorize("ADMIN"));

// Revenue analytics endpoint
router.get("/revenue", getRevenueAnalytics);

// Prediction data endpoint for TensorFlow
router.get("/predict", getPredictionData);

export default router;