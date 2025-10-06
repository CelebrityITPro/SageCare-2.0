const express = require("express");
const router = express.Router();
const DiagnosisHistory = require("../models/DiagnosisHistory");
const Doctor = require("../models/Doctor");
const { verifyToken } = require("./verifyToken");

// Get all diagnosis history for a patient
router.get("/patient/:patientId", verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10, status, specialty } = req.query;

    const query = { patient: patientId };
    if (status) query.status = status;
    if (specialty) query["recommendations.primarySpecialty"] = specialty;

    const diagnosisHistory = await DiagnosisHistory.find(query)
      .populate("recommendedDoctors.doctor", "first_name last_name specialty")
      .populate("userActions.appointmentId", "date startTime doctor")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await DiagnosisHistory.countDocuments(query);

    res.json({
      success: true,
      diagnosisHistory,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Error fetching diagnosis history:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch diagnosis history" 
    });
  }
});

// Get specific diagnosis entry
router.get("/:diagnosisId", verifyToken, async (req, res) => {
  try {
    const diagnosis = await DiagnosisHistory.findById(req.params.diagnosisId)
      .populate("recommendedDoctors.doctor", "first_name last_name specialty")
      .populate("userActions.appointmentId", "date startTime doctor");

    if (!diagnosis) {
      return res.status(404).json({ 
        success: false,
        error: "Diagnosis not found" 
      });
    }

    res.json({
      success: true,
      diagnosis
    });
  } catch (error) {
    console.error("Error fetching diagnosis:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch diagnosis" 
    });
  }
});

// Create new diagnosis entry
router.post("/", verifyToken, async (req, res) => {
  try {
    const diagnosisData = {
      ...req.body,
      patient: req.user.id // from token
    };

    const diagnosis = new DiagnosisHistory(diagnosisData);
    await diagnosis.save();

    res.status(201).json({
      success: true,
      diagnosis
    });
  } catch (error) {
    console.error("Error creating diagnosis:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create diagnosis entry" 
    });
  }
});

// Update diagnosis entry (for feedback, status changes)
router.patch("/:diagnosisId", verifyToken, async (req, res) => {
  try {
    const diagnosis = await DiagnosisHistory.findByIdAndUpdate(
      req.params.diagnosisId,
      req.body,
      { new: true }
    );

    if (!diagnosis) {
      return res.status(404).json({ 
        success: false,
        error: "Diagnosis not found" 
      });
    }

    res.json({
      success: true,
      diagnosis
    });
  } catch (error) {
    console.error("Error updating diagnosis:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update diagnosis" 
    });
  }
});

// Get diagnosis statistics
router.get("/stats/:patientId", verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    const stats = await DiagnosisHistory.aggregate([
      { $match: { patient: require("mongoose").Types.ObjectId(patientId) } },
      {
        $group: {
          _id: null,
          totalDiagnoses: { $sum: 1 },
          urgentCases: {
            $sum: { $cond: [{ $eq: ["$aiDiagnosis.urgencyLevel", "high"] }, 1, 0] }
          },
          emergencyCases: {
            $sum: { $cond: [{ $eq: ["$aiDiagnosis.urgencyLevel", "emergency"] }, 1, 0] }
          },
          resolvedCases: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          averageConfidence: { $avg: "$aiDiagnosis.confidence" },
          topSpecialties: {
            $push: "$recommendations.primarySpecialty"
          }
        }
      }
    ]);

    // Process top specialties
    let topSpecialties = [];
    if (stats[0] && stats[0].topSpecialties) {
      const specialtyCount = {};
      stats[0].topSpecialties.forEach(specialty => {
        specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
      });
      topSpecialties = Object.entries(specialtyCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([specialty, count]) => ({ specialty, count }));
    }

    const result = stats[0] || {};
    result.topSpecialties = topSpecialties;

    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error("Error fetching diagnosis stats:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch diagnosis statistics" 
    });
  }
});

// Get doctors by specialty for recommendations
router.get("/doctors/specialty/:specialty", verifyToken, async (req, res) => {
  try {
    const { specialty } = req.params;
    const { limit = 5 } = req.query;

    const doctors = await Doctor.find({ 
      specialty: { $regex: specialty, $options: 'i' } 
    })
    .limit(parseInt(limit))
    .select('first_name last_name specialty experience location');

    res.json({
      success: true,
      doctors,
      specialty,
      count: doctors.length
    });
  } catch (error) {
    console.error("Error fetching doctors by specialty:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch doctors" 
    });
  }
});

// Book appointment from diagnosis
router.post("/:diagnosisId/book-appointment", verifyToken, async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    const { doctorId, appointmentData } = req.body;

    // Find the diagnosis
    const diagnosis = await DiagnosisHistory.findById(diagnosisId);
    if (!diagnosis) {
      return res.status(404).json({ 
        success: false,
        error: "Diagnosis not found" 
      });
    }

    // Update diagnosis with appointment booking
    diagnosis.userActions.bookedAppointment = true;
    diagnosis.userActions.appointmentId = appointmentData.appointmentId; // This will be set after appointment creation
    await diagnosis.save();

    res.json({
      success: true,
      message: "Appointment booked successfully",
      diagnosis
    });
  } catch (error) {
    console.error("Error booking appointment from diagnosis:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to book appointment" 
    });
  }
});

// Provide feedback on diagnosis
router.post("/:diagnosisId/feedback", verifyToken, async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    const { diagnosisAccuracy, recommendationHelpfulness, overallSatisfaction, comments, wouldRecommend } = req.body;

    const diagnosis = await DiagnosisHistory.findById(diagnosisId);
    if (!diagnosis) {
      return res.status(404).json({ 
        success: false,
        error: "Diagnosis not found" 
      });
    }

    // Update user feedback
    diagnosis.userFeedback = {
      diagnosisAccuracy,
      recommendationHelpfulness,
      overallSatisfaction,
      comments,
      wouldRecommend
    };

    await diagnosis.save();

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      diagnosis
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to submit feedback" 
    });
  }
});

// Mark diagnosis as resolved
router.patch("/:diagnosisId/resolve", verifyToken, async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    const { symptomsResolved, resolutionDate } = req.body;

    const diagnosis = await DiagnosisHistory.findById(diagnosisId);
    if (!diagnosis) {
      return res.status(404).json({ 
        success: false,
        error: "Diagnosis not found" 
      });
    }

    diagnosis.status = "resolved";
    diagnosis.userActions.symptomsResolved = symptomsResolved;
    if (resolutionDate) {
      diagnosis.userActions.resolutionDate = new Date(resolutionDate);
    }

    await diagnosis.save();

    res.json({
      success: true,
      message: "Diagnosis marked as resolved",
      diagnosis
    });
  } catch (error) {
    console.error("Error resolving diagnosis:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to resolve diagnosis" 
    });
  }
});

module.exports = router; 