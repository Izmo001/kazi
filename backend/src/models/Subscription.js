import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ["FREE", "BASIC", "PREMIUM"],
    default: "FREE"
  },
  status: {
    type: String,
    enum: ["ACTIVE", "EXPIRED", "PENDING", "CANCELLED"],
    default: "PENDING"
  },
  applicationsLimit: {
    type: Number,
    default: 0 // 0 = no applications for free tier
  },
  applicationsUsed: {
    type: Number,
    default: 0
  },
  applicationsRemaining: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 300 // KES
  },
  currency: {
    type: String,
    default: "KES"
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  paymentReference: String,
  paymentMethod: String,
  autoRenew: {
    type: Boolean,
    default: false
  },
  features: {
    prioritySupport: { type: Boolean, default: false },
    cvReview: { type: Boolean, default: false },
    interviewCoaching: { type: Boolean, default: false },
    whatsappNotifications: { type: Boolean, default: false }
  }
}, { timestamps: true });

subscriptionSchema.methods.canApply = function() {
  if (this.status !== 'ACTIVE') return false;
  if (this.applicationsRemaining <= 0) return false;
  if (this.endDate && new Date() > this.endDate) return false;
  return true;
};

subscriptionSchema.methods.useApplication = function() {
  if (!this.canApply()) return false;
  this.applicationsUsed += 1;
  this.applicationsRemaining -= 1;
  return true;
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;