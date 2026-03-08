import Job from "../models/job.js";

export const createJob = async (req, res) => {
  try {
    // only STAFF or ADMIN should call this (enforced in route)
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "OPEN" }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
