const User = require("../../models/user");
const bcrypt = require("bcrypt");
const { sendOtp, verifyOtp } = require("../../services/otpService");
const { generateRandomPassword } = require('../../utils/generatePassword');
const { sendPasswordResetEmail } = require('../../services/emailService');

const layout = "layouts/user-layout";

// Render Pages
exports.renderLogin = async (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("client/auth/login", { layout: "layouts/user-layout", user: false, message: "" });
};

exports.renderRegister = async (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("client/auth/register", { layout, user: false, message: "" });
};

exports.renderForgotPassword = async (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("client/auth/forgot-password", { layout, user: false, message: "" });
};

// Authentication Handlers
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    req.session.user = { id: user._id, email: user.email, username: user.username };

    res.status(200).json({
      success: true,
      message: 'Login successful',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error during login', error: err.message });
  }
};

exports.register = async (req, res) => {
  const { name, email, username, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) return res.status(400).json({ success: false, message: 'Email or phone already exists' });

    req.session.pendingUser = { name, email, username, password, phone };
    await sendOtp(phone);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error sending OTP', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!req.session.pendingUser || req.session.pendingUser.phone !== phone) {
    return res.status(400).json({ success: false, message: 'No pending registration found for this phone' });
  }

  const otpResult = verifyOtp(phone, otp);
  if (!otpResult.success) {
    return res.status(400).json({ success: false, message: otpResult.message || 'Invalid OTP' });
  }

  try {
    const { password } = req.session.pendingUser;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ ...req.session.pendingUser, password: hashedPassword });

    await user.save();
    req.session.pendingUser = null;
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
};

exports.googleAuthCallback = (req, res) => {
  req.session.user = { id: req.user._id, email: req.user.email, username: req.user.username };
  res.redirect("/");
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    await user.save();

    await sendPasswordResetEmail(user.email, newPassword );

    res.status(200).json({ success: true, message: 'A new password has been sent to your email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error during password reset', error: err.message });
  }
};

exports.logout = async (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};
