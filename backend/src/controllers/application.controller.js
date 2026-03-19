import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Subscription from "../models/Subscription.js";
import { initializeFreeTier } from "./subscription.controller.js";

/**
 * Create Application (Apply for a job)
 * POST /api/applications/apply/:jobId
 */
export const createApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    if (!jobId) return res.status(400).json({ message: "jobId required" });

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Check subscription and application limits
    let subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      subscription = await initializeFreeTier(userId);
    }

    // Check if user can apply
    if (!subscription.canApply()) {
      return res.status(403).json({ 
        message: "Subscription required. Please upgrade to BASIC plan (300 KES/month) to apply for jobs.",
        requiresSubscription: true
      });
    }

    // Check if already applied
    const existing = await Application.findOne({ userId, jobId });
    if (existing) return res.status(400).json({ message: "Already applied" });

    // Use one application credit
    subscription.useApplication();
    await subscription.save();

    // Create application
    const application = await Application.create({
      userId,
      jobId,
      status: "PENDING",
      appliedDate: new Date()
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
      applicationsRemaining: subscription.applicationsRemaining
    });
  } catch (error) {
    console.error("Create application error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * List User Applications
 * GET /api/applications/me
 */
export const listUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const applications = await Application.find({ userId })
      .populate({
        path: "jobId",
        select: "title company location salary type requiredSkills",
        model: "Job"
      })
      .sort({ appliedDate: -1 });

    // Format the response
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      job: app.jobId ? {
        _id: app.jobId._id,
        title: app.jobId.title,
        company: app.jobId.company,
        location: app.jobId.location,
        salary: app.jobId.salary,
        type: app.jobId.type,
        requiredSkills: app.jobId.requiredSkills
      } : null,
      status: app.status.toLowerCase(),
      appliedAt: app.appliedDate || app.createdAt
    }));

    res.status(200).json({ 
      count: formattedApplications.length, 
      applications: formattedApplications 
    });
  } catch (error) {
    console.error("List applications error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Update Application Status
 * PATCH /api/applications/:id/status
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status required" });

    // Validate status
    const validStatuses = ["PENDING", "APPLIED", "INTERVIEW", "REJECTED", "ACCEPTED"];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      { status: status.toUpperCase() },
      { new: true }
    ).populate({
      path: "jobId",
      select: "title company",
      model: "Job"
    });

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      message: "Status updated",
      application: {
        _id: updated._id,
        job: updated.jobId,
        status: updated.status.toLowerCase(),
        appliedAt: updated.appliedDate || updated.createdAt
      }
    });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Get All Applications (Admin only)
 * GET /api/applications/admin/all
 */
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "userId",
        select: "name email",
        model: "User"
      })
      .populate({
        path: "jobId",
        select: "title company",
        model: "Job"
      })
      .sort({ appliedDate: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Get all applications error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};