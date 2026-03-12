import express from "express";
import multer from "multer";
import path from "path";
import {
  register,
  login,
  registerValidators,
  updateProfile
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for CV upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads/cvs");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, req.user.id + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Register & Login
router.post("/register", registerValidators, register);
router.post("/login", login);

// Get current logged-in user
router.get("/me", protect, (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      skills: req.user.skills || [],
      experienceLevel: req.user.experienceLevel || "Entry",
      educationLevel: req.user.educationLevel || "",
      yearsOfExperience: req.user.yearsOfExperience || 0,
      preferredRoles: req.user.preferredRoles || [],
      locationPreference: req.user.locationPreference || "",
      cvUrl: req.user.cvUrl || null,
      profileCompleted: req.user.profileCompleted || false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/me", protect, updateProfile);

// Upload CV
router.post("/upload-cv", protect, upload.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const cvUrl = `/uploads/cvs/${req.file.filename}`;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { cvUrl },
      { new: true }
    ).select("-password");

    res.json({ 
      message: "CV uploaded successfully", 
      cvUrl: updatedUser.cvUrl 
    });
  } catch (error) {
    console.error("CV upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;