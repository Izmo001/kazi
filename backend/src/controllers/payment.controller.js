import Payment from "../models/payment.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import axios from "axios";
import crypto from "crypto";
import moment from "moment";

// Helper: Get M-PESA Access Token
const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return response.data.access_token;
};

// Helper: Generate Password
const generatePassword = (timestamp) => {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const str = `${shortcode}${passkey}${timestamp}`;
  return crypto.createHash("sha256").update(str).digest("hex");
};

// Helper: Format Phone Number
const formatPhoneNumber = (phone) => {
  let formatted = phone.toString().replace(/\D/g, "");
  if (formatted.startsWith("0")) {
    formatted = "254" + formatted.substring(1);
  } else if (!formatted.startsWith("254")) {
    formatted = "254" + formatted;
  }
  return formatted;
};

// Initiate Payment
export const initiatePayment = async (req, res) => {
  try {
    const { plan, phoneNumber } = req.body;
    const userId = req.user.id;

    const plans = {
      BASIC: { price: 300, applicationsLimit: 30 },
      PREMIUM: { price: 600, applicationsLimit: 100 },
    };

    if (!plans[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const amount = plans[plan].price;
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = generatePassword(timestamp);
    const accessToken = await getAccessToken();

    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `JobAssist-${plan}`,
        TransactionDesc: `${plan} subscription payment`,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // Create pending payment record
    const payment = await Payment.create({
      user: userId,
      amount,
      currency: "KES",
      phoneNumber,
      paymentMethod: "MPESA",
      plan,
      status: "PENDING",
      checkoutRequestId: stkResponse.data.CheckoutRequestID,
      merchantRequestId: stkResponse.data.MerchantRequestID,
    });

    res.json({
      success: true,
      message: "STK Push sent to your phone",
      paymentId: payment._id,
      checkoutRequestId: stkResponse.data.CheckoutRequestID,
    });
  } catch (error) {
    console.error("Initiate payment error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.errorMessage || "Failed to initiate payment",
    });
  }
};

// M-PESA Callback Handler
export const paymentCallback = async (req, res) => {
  try {
    console.log("📞 M-PESA Callback received");
    const { Body } = req.body;
    const { stkCallback } = Body;

    const payment = await Payment.findOne({ checkoutRequestId: stkCallback.CheckoutRequestID });
    if (!payment) {
      return res.status(200).json({ message: "Payment not found" });
    }

    if (stkCallback.ResultCode === 0) {
      payment.status = "SUCCESS";
      payment.paidAt = new Date();
      await payment.save();

      // Activate subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const plans = {
        BASIC: { applicationsLimit: 30 },
        PREMIUM: { applicationsLimit: 100 },
      };

      await Subscription.findOneAndUpdate(
        { user: payment.user },
        {
          plan: payment.plan,
          status: "ACTIVE",
          applicationsLimit: plans[payment.plan].applicationsLimit,
          applicationsUsed: 0,
          applicationsRemaining: plans[payment.plan].applicationsLimit,
          price: payment.amount,
          startDate: new Date(),
          endDate,
        },
        { upsert: true }
      );

      await User.findByIdAndUpdate(payment.user, { subscriptionStatus: "ACTIVE" });
      console.log(`✅ Subscription activated for user ${payment.user}`);
    } else {
      payment.status = "FAILED";
      await payment.save();
    }

    res.status(200).json({ message: "Callback processed" });
  } catch (error) {
    console.error("Callback error:", error);
    res.status(200).json({ message: "Callback processed with error" });
  }
};

// Check Payment Status
export const checkPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ status: payment.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};