const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js");
const { verifyAdmin, verifyAuth } = require("./verifyToken");

const User = require("../models/User");

router.get("/", verifyAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ id: -1 }).limit(10);
    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...rest } = user._doc;
    res.status(200).json({ ...rest });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", verifyAuth, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PW_ENCRYPT_KEY
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(500).json({ message: "error" });
  }
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(res.params.id);
    res.status(200).json({ message: "User was successfully deleted." });
  } catch (err) {
    return res.status(500).json("Server error");
  }
});

module.exports = router;
