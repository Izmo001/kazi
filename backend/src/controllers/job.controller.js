import Job from "../models/Job.js";

// @desc    Create a new job (Admin only)
// @route   POST /api/jobs
// @access  Private/Admin
export const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    const job = await Job.create(jobData);
    res.status(201).json(job);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all open jobs (Users)
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "OPEN" })
      .sort({ createdAt: -1 })
      .select("-__v");
    
    res.json(jobs);
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Private
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json(job);
  } catch (err) {
    console.error("Get job error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update job (Admin only)
// @route   PUT /api/jobs/:id
// @access  Private/Admin
export const updateJob = async (req, res) => {
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
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Close a job (Admin only)
// @route   PATCH /api/jobs/:id/close
// @access  Private/Admin
export const closeJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: "CLOSED" },
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json({ message: "Job closed successfully", job });
  } catch (err) {
    console.error("Close job error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get jobs by skills (For matching)
// @route   POST /api/jobs/match
// @access  Private
export const getJobsBySkills = async (req, res) => {
  try {
    const { skills } = req.body;
    
    const jobs = await Job.find({
      status: "OPEN",
      requiredSkills: { $in: skills }
    }).sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (err) {
    console.error("Job matching error:", err);
    res.status(500).json({ message: err.message });
  }
};