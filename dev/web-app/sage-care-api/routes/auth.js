const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Sign up
router.post("/sign-up", async (req, res) => {
  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const fullname = `${first_name} ${last_name}`;
  const age = req.body.age;
  const gender = req.body.gender;
  const phone_number = req.body.phone_number;
  const is_patient = req.body.is_patient || false;
  const is_doctor = req.body.is_doctor || false;
  const password = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.PW_ENCRYPT_KEY
  ).toString();

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Bad request: Body must contain username, email and password",
      });
    }

    // check if user exists
    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const newUser = new User({
      email,
      password,
      first_name,
      last_name,
      fullname,
      age,
      gender,
      phone_number,
      is_patient,
      is_doctor,
      isAdmin: false, // Default value, can be set to true for admin users
    });

    const savedUser = await newUser.save();

    const accessToken = jwt.sign(
      { id: savedUser._id, isAdmin: savedUser?.isAdmin },
      process.env.JWT_SECRET_KEY,
      { algorithm: "HS256" }
    );

    const { password: userPw, ...rest } = savedUser?._doc;

    return res.status(201).json({ ...rest, accessToken });
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt with body:", req.body);
    console.log("Environment variables check:");
    console.log("PW_ENCRYPT_KEY exists:", !!process.env.PW_ENCRYPT_KEY);
    console.log("JWT_SECRET_KEY exists:", !!process.env.JWT_SECRET_KEY);
    console.log("PW_ENCRYPT_KEY first 5 chars:", process.env.PW_ENCRYPT_KEY ? process.env.PW_ENCRYPT_KEY.substring(0, 5) + "..." : "undefined");
    console.log("JWT_SECRET_KEY first 5 chars:", process.env.JWT_SECRET_KEY ? process.env.JWT_SECRET_KEY.substring(0, 5) + "..." : "undefined");
    
    // Check if environment variables are loaded
    if (!process.env.PW_ENCRYPT_KEY) {
      console.error("PW_ENCRYPT_KEY is not set!");
      return res.status(500).json({ error: "Server configuration error" });
    }
    
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is not set!");
      return res.status(500).json({ error: "Server configuration error" });
    }
    
    const user = await User.findOne({ email: req.body.email });
    console.log("User found:", !!user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Try to decrypt the password with better error handling
    let decryptedPw;
    try {
      decryptedPw = CryptoJS.AES.decrypt(
        user.password,
        process.env.PW_ENCRYPT_KEY
      ).toString(CryptoJS.enc.Utf8);
      console.log("Password decryption successful");
    } catch (decryptError) {
      console.error("Password decryption failed:", decryptError);
      return res.status(500).json({ 
        error: "Password decryption failed. This might be due to a configuration change." 
      });
    }

    if (decryptedPw !== req.body.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user?.isAdmin },
      process.env.JWT_SECRET_KEY,
      { algorithm: "HS256" }
    );
    console.log("JWT token created successfully");
    
    const { password, ...rest } = user._doc;
    return res.status(200).json({ ...rest, accessToken });
  } catch (err) {
    console.error("Login error details:", err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
