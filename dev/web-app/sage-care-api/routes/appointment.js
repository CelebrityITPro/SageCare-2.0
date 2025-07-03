const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const { sendAppointmentNotifications } = require("../utils/emailService");

// GET /api/appointments
router.get("/", async (req, res) => {
  try {
    const { patient, doctor } = req.query;
    let filter = {};
    
    // Filter by patient if provided (for user's appointments)
    if (patient) {
      filter.patient = patient;
    }
    
    // Filter by doctor if provided (for doctor's appointments)
    if (doctor) {
      filter.doctor = doctor;
    }
    
    const appointments = await Appointment.find(filter).sort({ date: 1, startTime: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch appointments" });
  }
});

// GET /api/appointments/:id
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }
    
    res.json({ success: true, appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch appointment" });
  }
});

// POST /api/appointments
router.post("/", async (req, res) => {
  function parseLocalDateTime(dateStr, timeStr) {
    // dateStr: "2024-07-11", timeStr: "14:00"
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour || 0, minute || 0);
  }
  try {
    console.log("Appointment creation - Request body:", req.body);
    
    const { doctor, patient, startTime, endTime, notes, thirdParty, timezone } = req.body;

    console.log("Appointment creation - Extracted data:", {
      doctor, patient, startTime, endTime, notes
    });

    // Validate required fields
    if (!doctor || !patient || !startTime || !endTime) {
      console.error("Appointment creation - Missing required fields");
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: doctor, patient, startTime, endTime" 
      });
    }

    // Generate unique Jitsi room name
    const roomName = `consult-${patient}-${Date.now()}`;
    const jitsiLink = `https://meet.jit.si/${roomName}`;

    console.log("Appointment creation - Generated Jitsi link:", jitsiLink);

    // Create appointment with UTC times
    const date = new Date(startTime);
    date.setUTCHours(0, 0, 0, 0); // Set to midnight UTC for the date only
    const appointment = new Appointment({
      doctor,
      patient,
      date,
      startTime,
      endTime,
      notes,
      jitsiLink,
      timezone,
    });

    console.log("Appointment creation - Appointment object created:", appointment);

    await appointment.save();
    console.log("Appointment creation - Appointment saved successfully");

    // Send email notifications
    try {
      const notificationResults = await sendAppointmentNotifications({
        doctor,
        patient,
        thirdParty: thirdParty || null,
        jitsiLink,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        notes,
        timezone: appointment.timezone,
      });
      
      console.log('Email notifications sent:', notificationResults);
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError);
      // Don't fail the appointment creation if emails fail
    }

    res.status(201).json({ 
      success: true, 
      appointment,
      message: "Appointment created successfully. Email notifications sent."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to create appointment" });
  }
});

module.exports = router; 