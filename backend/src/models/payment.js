import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription"
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "KES"
  },
  paymentMethod: {
    type: String,
    enum: ["MPESA", "CARD", "BANK"],
    required: true
  },
  transactionId: {
    type: String,
    unique: true
  },
  mpesaCode: String,
  phoneNumber: String,
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
    default: "COMPLETED"
  },
  plan: {
    type: String,
    enum: ["BASIC", "PREMIUM"]
  },
  period: {
    start: Date,
    end: Date
  },
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

// Index for faster queries
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;