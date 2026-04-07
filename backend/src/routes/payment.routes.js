import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  initiatePayment,      // ✅ Correct name
  paymentCallback,      // ✅ Correct name
  checkPaymentStatus,   // ✅ Correct name
  getPaymentHistory,    // ✅ Correct name
} from "../controllers/payment.controller.js";

const router = express.Router();

// Public callback (M-PESA calls this)
router.post("/callback", paymentCallback);

// Protected routes
router.use(protect);
router.post("/initiate", initiatePayment);
router.get("/status/:paymentId", checkPaymentStatus);
router.get("/history", getPaymentHistory);

export default router;