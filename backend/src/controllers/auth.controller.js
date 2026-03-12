import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

// Validation rules
export const registerValidators = [
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
];

export const register = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const {
    name,
    email,
    password,
    skills,
    experienceLevel,
    educationLevel,
    yearsOfExperience,
    preferredRoles,
    locationPreference
  } = req.body;

  try {
    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new user with all fields
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      skills: skills || [],
      experienceLevel: experienceLevel || "Entry",
      educationLevel: educationLevel || "",
      yearsOfExperience: yearsOfExperience || 0,
      preferredRoles: preferredRoles || [],
      locationPreference: locationPreference || "",
      profileCompleted: skills && skills.length > 0
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    // Respond with token and user info
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        skills: newUser.skills,
        experienceLevel: newUser.experienceLevel,
        educationLevel: newUser.educationLevel,
        yearsOfExperience: newUser.yearsOfExperience,
        preferredRoles: newUser.preferredRoles,
        locationPreference: newUser.locationPreference,
        profileCompleted: newUser.profileCompleted
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Make sure login is exported
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        educationLevel: user.educationLevel,
        yearsOfExperience: user.yearsOfExperience,
        preferredRoles: user.preferredRoles,
        locationPreference: user.locationPreference,
        profileCompleted: user.profileCompleted
      } 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add updateProfile export
export const updateProfile = async (req, res) => {
  try {
    console.log("Update profile called with body:", req.body);
    
    const {
      skills,
      experienceLevel,
      educationLevel,
      preferredRoles,
      yearsOfExperience,
      locationPreference
    } = req.body;

    // Get user ID from the protect middleware
    const userId = req.user.id;

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        skills: skills || [],
        experienceLevel: experienceLevel || "Entry",
        educationLevel: educationLevel || "",
        preferredRoles: preferredRoles || [],
        yearsOfExperience: yearsOfExperience || 0,
        locationPreference: locationPreference || "",
        profileCompleted: true
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        skills: updatedUser.skills,
        experienceLevel: updatedUser.experienceLevel,
        educationLevel: updatedUser.educationLevel,
        yearsOfExperience: updatedUser.yearsOfExperience,
        preferredRoles: updatedUser.preferredRoles,
        locationPreference: updatedUser.locationPreference,
        profileCompleted: updatedUser.profileCompleted
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};