import axios from "axios";
import crypto from "crypto";

/**
 * Get M-PESA OAuth token
 */
export const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('M-PESA Token Error:', error.response?.data || error.message);
    throw new Error('Failed to get M-PESA access token');
  }
};

/**
 * Generate password for STK Push
 */
export const generatePassword = (timestamp) => {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const str = `${shortcode}${passkey}${timestamp}`;
  const password = crypto.createHash('sha256').update(str).digest('hex');
  return password;
};