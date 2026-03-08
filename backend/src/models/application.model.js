import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  status: { type: String, enum: ["PENDING","APPLIED","INTERVIEW","REJECTED"], default: "PENDING" },
  appliedDate: Date,
  notes: String // internal notes e.g., "Applied via careers@safaricom.co.ke"
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);
