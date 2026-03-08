import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["USER","STAFF","ADMIN"], default: "USER" },
  skills: [String],
  experienceLevel: { type: String, enum: ["Entry","Junior","Mid","Senior"], default: "Entry" },
  educationLevel: {
    type: String,
    enum: ["DIPLOMA", "BACHELORS", "MASTERS", "PHD"]
  },
  preferredRoles: [{ type: String }],
  yearsOfExperience: { type: Number },
  locationPreference: { type: String },
  cv: {
    url: String,
    originalName: String,
    uploadedAt: Date
  },
  subscriptionStatus: { type: Boolean, default: false },
  subscriptionExpiry: { type: Date },
  mpesaReceiptNumber: { type: String }
  },
 { timestamps: true });

export default mongoose.model("User", userSchema);
