import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company:  { type: String, required: true },
  location:  { type: String, required: true },
  jobType: String,
  requiredSkills:  { type: [String], default: [] },
  deadline: Date,
  applyUrl: String,
  source: String,
  salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: "KES" }
    },
  type: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"],
      default: "FULL_TIME"
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  status: { type: String, enum: ["OPEN","CLOSED"], default: "OPEN" },
  deadline: Date


}, 
{ timestamps: true });

export default mongoose.model("Job", jobSchema);
