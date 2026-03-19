import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  purchaseSubscription,
  checkApplicationEligibility,
  getSubscriptionDetails,
  cancelSubscription,
  initializeFreeTier
} from "../controllers/subscription.controller.js";

const router = express.Router();

// All subscription routes require authentication
router.use(protect);

// GET /api/subscription/status - Check if user can apply
router.get("/status", checkApplicationEligibility);

// GET /api/subscription/details - Get user subscription details
router.get("/details", getSubscriptionDetails);

// POST /api/subscription/purchase - Purchase a subscription plan
router.post("/purchase", purchaseSubscription);

// POST /api/subscription/cancel - Cancel subscription
router.post("/cancel", cancelSubscription);

// POST /api/subscription/initialize - Initialize free tier (internal use)
router.post("/initialize", initializeFreeTier);

export default router;