require('dotenv').config();
const twilio = require('twilio');
const generateOTP = require('../utils/generateOtp');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const otpStore = new Map();
const OTP_EXPIRY_MS = 60 * 1000;

const sendOtp = async (phone) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  otpStore.set(phone, { otp, expiresAt });

  try {
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+91' + phone,
    });
  } catch (error) {
    throw new Error('OTP send failed');
  }
};

const verifyOtp = (phone, otp) => {
  const entry = otpStore.get(phone);
  if (entry && entry.otp === otp && Date.now() <= entry.expiresAt) {
    otpStore.delete(phone);
    return { success: true, message: 'OTP verified successfully' };
  }

  otpStore.delete(phone);
  return { success: false, message: 'Invalid or expired OTP' };
};

module.exports = { sendOtp, verifyOtp };

