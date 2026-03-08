import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  location: String,
  jobType: String,
  requiredSkills: [String],
  deadline: Date,
  applyUrl: String,
  source: String,
  status: { type: String, enum: ["OPEN","CLOSED"], default: "OPEN" }
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
