const express = require("express");
const router = express.Router();
const { verifyAdmin, verifyAuth } = require("./verifyToken");

const Doctor = require("../models/Doctor");

router.post("/", async (req, res) => {
  const doctor = new Doctor(req.body);
  if (
    !doctor.first_name ||
    !doctor.last_name ||
    !doctor.username ||
    !doctor.email ||
    !doctor.specialty
  ) {
    return res.status(400).json({
      message: "Bad request: Body must contain fullname, username and email",
    });
  }
  try {
    const newDoctor = await doctor.save();
    res.status(201).json(newDoctor);
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      return res.status(200).json(doctor);
    } else {
      return res.status(404).json({ message: "doctor not found." });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    return res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true, runValidators: true }
    );
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    return res.status(200).json(updatedDoctor);
  } catch (err) {
    res.status(400).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "success" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
