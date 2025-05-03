const User = require("../../models/user");
const bcrypt = require("bcrypt");
const { sendOtp, verifyOtp } = require("../../services/otpService");
const { generateRandomPassword } = require('../../utils/generatePassword');
const { sendPasswordResetEmail } = require('../../services/emailService');

const layout = "layouts/user-layout";

exports.renderLogin = async (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("client/auth/login", { layout, user: false });
};

exports.renderRegister = async (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("client/auth/register", { layout, user: false });
};

exports.renderForgotPassword = async (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("client/auth/forgot-password", { layout, user: false});
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username,
    };

    res.status(200).json({ success: true, message: "Login successful" });
  } catch {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

exports.register = async (req, res) => {
  const { name, email, username, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email or phone already in use" });
    }

    req.session.pendingUser = { name, email, username, password, phone };
    await sendOtp(phone);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!req.session.pendingUser || req.session.pendingUser.phone !== phone) {
    return res.status(400).json({ success: false, message: "No matching registration found" });
  }

  const result = verifyOtp(phone, otp);
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.message || "Invalid OTP" });
  }

  try {
    const { password, ...userData } = req.session.pendingUser;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ ...userData, password: hashedPassword });
    await newUser.save();

    req.session.pendingUser = null;
    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

exports.googleAuthCallback = (req, res) => {
  req.session.user = {
    id: req.user._id,
    email: req.user.email,
    username: req.user.username,
  };
  res.redirect("/");
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    await user.save();

    await sendPasswordResetEmail(email, newPassword);

    res.status(200).json({ success: true, message: "New password sent to your email" });
  } catch {
    res.status(500).json({ success: false, message: "Password reset failed" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};
