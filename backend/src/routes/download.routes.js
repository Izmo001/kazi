import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { downloadCv } from "../controllers/download.js"; // ✅ import controller from controller file

const router = express.Router();

router.get("/cv/:userId", protect, authorize("STAFF","ADMIN"), downloadCv);

export default router;