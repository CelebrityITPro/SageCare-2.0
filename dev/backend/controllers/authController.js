const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcryptjs');
const User      = require('../models/User');
const { sendOTP } = require('../utils/otpService');

const OTP_EXP_MS = (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000;

function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.signup = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    if (await User.findOne({ $or: [{ email }, { phone }] }))
      return res.status(400).json({ msg: 'Email or phone already in use' });

    const hash = await bcrypt.hash(password, 12);
    const otp = genOTP();
    const otpExpiry = Date.now() + OTP_EXP_MS;

    const user = new User({ name, email, password: hash, phone, otp, otpExpiry });
    await user.save();
    await sendOTP(phone, otp);

    res.json({ msg: 'OTP sent', phone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ msg: 'Invalid phone' });
    if (user.isVerified) return res.status(400).json({ msg: 'Already verified' });
    if (user.otp !== otp || Date.now() > user.otpExpiry)
      return res.status(400).json({ msg: 'OTP invalid or expired' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ msg: 'Verified', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified)
      return res.status(400).json({ msg: 'Invalid credentials or not verified' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ msg: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.logout = (req, res) => {
  // Client just drops the token
  res.json({ msg: 'Logged out' });
};

// controllers/authController.js
// … existing signup, verifyOtp, login, logout …

/**
 * List all users (for dev only — excludes sensitive fields)
 */
exports.listUsers = async (req, res) => {
    try {
      const users = await User.find({}, '-password -otp -otpExpiry');
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  };
  