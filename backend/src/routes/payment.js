import express from "express";
import { initiateSubscription, mpesaCallback} from "../controllers/payment.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/initiate", protect, initiateSubscription);
router.post("/callback", mpesaCallback);

export default router;