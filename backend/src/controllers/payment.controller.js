import axios from "axios";
import moment from "moment";
import Payment from "../models/payment.js";
import User from "../models/User.js";
import { getAccessToken, generatePassword } from "../utils/mpesa.js";

export const initiateSubscription = async (req, res) => {
  try {
    const { phone } = req.body;
    const amount = 500; // Subscription price

    const accessToken = await getAccessToken();
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = generatePassword(timestamp);

    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "JobApp Premium",
        TransactionDesc: "Subscription Payment"
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    await Payment.create({
      user: req.user._id,
      amount,
      phoneNumber: phone,
      transactionId: stkResponse.data.CheckoutRequestID
    });

    res.json({ message: "STK Push sent to phone" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};


export const mpesaCallback = async (req, res) => {
  try {
    const callback = req.body.Body.stkCallback;
    const checkoutId = callback.CheckoutRequestID;

    const payment = await Payment.findOne({ transactionId: checkoutId });
    if (!payment) return res.sendStatus(404);

    if (callback.ResultCode === 0) {
      const receipt = callback.CallbackMetadata.Item.find(
        item => item.Name === "MpesaReceiptNumber"
      ).Value;

      payment.status = "Success";
      payment.mpesaReceiptNumber = receipt;
      await payment.save();

      const user = await User.findById(payment.user);
      user.subscriptionStatus = true;
      user.subscriptionExpiry = moment().add(30, "days");
      await user.save();

    } else {
      payment.status = "Failed";
      await payment.save();
    }

    res.json({ message: "Callback processed" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Callback error" });
  }
};