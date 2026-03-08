import express from "express";
import {
  register,
  login,
  registerValidators
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js"; // your protect middleware

const router = express.Router();

// Register & Login
router.post("/register", registerValidators, register);
router.post("/login", login);

// Get current logged-in user
router.get("/me", protect, (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });
    res.json(req.user); // minimal user info: id, role, email
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;