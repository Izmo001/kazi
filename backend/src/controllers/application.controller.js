import Application from "../models/application.model.js";

/**
 * Create Application
 */
export const createApplication = async (req,res) => {
  try{
    const { jobId } = req.body;
    const userId = req.user.id;

    if(!jobId) return res.status(400).json({ message: "jobId required" });

    const existing = await Application.findOne({ userId, jobId });
    if(existing) return res.status(400).json({ message: "Already applied" });

    const application = await Application.create({ userId, jobId });
    res.status(201).json({ message: "Application created", application });
  } catch(error){
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * List User Applications
 */
export const listUserApplications = async (req,res) => {
  try{
    const userId = req.user.id;
    const applications = await Application.find({ userId }).populate("jobId").sort({ createdAt: -1 });
    res.status(200).json({ count: applications.length, applications });
  } catch(error){
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Update Application Status
 */
export const updateApplicationStatus = async (req,res) => {
  try{
    const { id } = req.params;
    const { status } = req.body;

    if(!status) return res.status(400).json({ message: "Status required" });

    const updated = await Application.findByIdAndUpdate(id, { status }, { new: true });
    if(!updated) return res.status(404).json({ message: "Application not found" });

    res.status(200).json({ message: "Status updated", application: updated });
  } catch(error){
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
