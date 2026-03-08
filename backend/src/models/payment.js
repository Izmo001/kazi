import mongoose from "mongoose";

const payment = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  phoneNumber: String,
  mpesaReceiptNumber: String,
  transactionId: String,
  status: {
    type: String,
    enum: ["Pending", "Success", "Failed"],
    default: "Pending"
  }
}, { timestamps: true });

export default mongoose.model("Payment", payment);