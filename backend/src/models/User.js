import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["USER", "STAFF", "ADMIN"],
      default: "USER"
    },
    skills: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Junior", "Mid", "Senior"],
      default: "Entry"
    },
    educationLevel: {
      type: String,
      enum: ["", "DIPLOMA", "BACHELORS", "MASTERS", "PHD"], // Added empty string
      default: ""
    },
    yearsOfExperience: {
      type: Number,
      default: 0
    },
    preferredRoles: {
      type: [String],
      default: []
    },
    locationPreference: {
      type: String,
      default: ""
    },
    profileCompleted: {
      type: Boolean,
      default: false
    },
    cvUrl: {
      type: String,
      default: ""
    },
    subscriptionStatus: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;