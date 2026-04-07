import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function testMpesaCredentials() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  console.log("Testing M-PESA credentials...");
  console.log("Consumer Key exists:", !!consumerKey);
  console.log("Consumer Secret exists:", !!consumerSecret);

  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    console.log("✅ Credentials are valid!");
    console.log("Access Token:", response.data.access_token);
  } catch (error) {
    console.error("❌ Credentials are invalid!");
    console.error("Error:", error.response?.data || error.message);
  }
}

testMpesaCredentials();