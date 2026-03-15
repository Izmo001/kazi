import express from "express";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protect and admin authorization to all routes
router.use(protect);
router.use(authorize("ADMIN"));

// ========== JOB MANAGEMENT ==========

// Get all jobs (admin view)
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new job
router.post("/jobs", async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };
    
    const job = await Job.create(jobData);
    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update job
router.put("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete job
router.delete("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update job status
router.patch("/jobs/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json(job);
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({ message: error.message });
  }
});

// ========== APPLICATION MANAGEMENT ==========

// Get all applications
router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "jobId",
        select: "title company location",
        model: "Job"
      })
      .populate({
        path: "userId",
        select: "name email",
        model: "User"
      })
      .sort({ appliedDate: -1 });
    
    // Transform the data to match frontend expectations
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      job: app.jobId ? {
        _id: app.jobId._id,
        title: app.jobId.title,
        company: app.jobId.company,
        location: app.jobId.location
      } : null,
      user: app.userId ? {
        _id: app.userId._id,
        name: app.userId.name,
        email: app.userId.email
      } : null,
      status: app.status.toLowerCase(),
      appliedAt: app.appliedDate || app.createdAt
    }));
    
    res.json(formattedApplications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update application status
router.patch("/applications/:id", async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: status.toUpperCase() },
      { new: true }
    )
    .populate({
      path: "jobId",
      select: "title company",
      model: "Job"
    })
    .populate({
      path: "userId",
      select: "name email",
      model: "User"
    });
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Format the response
    const formattedApplication = {
      _id: application._id,
      job: application.jobId ? {
        _id: application.jobId._id,
        title: application.jobId.title,
        company: application.jobId.company
      } : null,
      user: application.userId ? {
        _id: application.userId._id,
        name: application.userId.name,
        email: application.userId.email
      } : null,
      status: application.status.toLowerCase(),
      appliedAt: application.appliedDate || application.createdAt
    };
    
    res.json(formattedApplication);
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ message: error.message });
  }
});

// ========== STATISTICS ==========

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: "OPEN" });
    const closedJobs = await Job.countDocuments({ status: "CLOSED" });
    const totalUsers = await User.countDocuments();
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: "PENDING" });
    
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title company status");
      
    const recentApplications = await Application.find()
      .populate("userId", "name")
      .populate("jobId", "title")
      .sort({ appliedDate: -1 })
      .limit(5);

    // Format recent applications
    const formattedRecentApplications = recentApplications.map(app => ({
      _id: app._id,
      user: app.userId ? { name: app.userId.name } : { name: "Unknown" },
      job: app.jobId ? { title: app.jobId.title } : { title: "Unknown Job" },
      status: app.status.toLowerCase()
    }));

    res.json({
      totalJobs,
      openJobs,
      closedJobs,
      totalUsers,
      totalApplications,
      pendingApplications,
      recentJobs,
      recentApplications: formattedRecentApplications
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ========== USER MANAGEMENT ==========

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Also delete their applications
    await Application.deleteMany({ userId: req.params.id });
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;