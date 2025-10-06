const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const DiagnosisHistorySchema = new mongoose.Schema(
  {
    // Patient reference
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Symptom input
    symptoms: {
      description: { type: String, required: true },
      severity: { 
        type: String, 
        enum: ["mild", "moderate", "severe"], 
        default: "moderate" 
      },
      duration: { type: String }, // e.g., "2 days", "1 week"
      onset: { type: String }, // e.g., "sudden", "gradual"
      triggers: [{ type: String }], // e.g., ["stress", "food", "exercise"]
      associatedSymptoms: [{ type: String }]
    },

    // Patient context
    patientContext: {
      age: { type: Number },
      gender: { type: String },
      medicalHistory: { type: String },
      currentMedications: [{ type: String }],
      allergies: [{ type: String }],
      lifestyleFactors: [{ type: String }] // e.g., ["smoking", "sedentary", "stress"]
    },

    // AI Diagnosis Results
    aiDiagnosis: {
      preliminaryDiagnosis: { type: String, required: true },
      confidence: { type: Number, min: 0, max: 1, required: true },
      possibleConditions: [{ type: String }],
      urgencyLevel: { 
        type: String, 
        enum: ["low", "medium", "high", "emergency"], 
        required: true 
      },
      aiModel: { type: String, default: "ollama-llama2" },
      processingTime: { type: Number }, // in milliseconds
      modelVersion: { type: String, default: "v1.0" }
    },

    // Medical Recommendations
    recommendations: {
      primarySpecialty: { type: String, required: true },
      secondarySpecialties: [{ type: String }],
      immediateActions: [{ type: String }],
      generalAdvice: { type: String },
      followUpTimeline: { type: String }, // e.g., "within 24 hours", "within a week"
      selfCareInstructions: [{ type: String }]
    },

    // Doctor Recommendations (if available)
    recommendedDoctors: [{
      doctor: {
        type: Schema.Types.ObjectId,
        ref: "Doctor"
      },
      specialty: { type: String },
      reason: { type: String }, // why this doctor was recommended
      availability: { type: String } // "available", "limited", "unavailable"
    }],

    // User Actions & Follow-up
    userActions: {
      bookedAppointment: { type: Boolean, default: false },
      appointmentId: {
        type: Schema.Types.ObjectId,
        ref: "Appointment"
      },
      consultedDoctor: { type: Boolean, default: false },
      doctorFeedback: { type: String },
      symptomsResolved: { type: Boolean },
      resolutionDate: { type: Date }
    },

    // User Feedback
    userFeedback: {
      diagnosisAccuracy: { type: Number, min: 1, max: 5 },
      recommendationHelpfulness: { type: Number, min: 1, max: 5 },
      overallSatisfaction: { type: Number, min: 1, max: 5 },
      comments: { type: String },
      wouldRecommend: { type: Boolean }
    },

    // Privacy & Sharing
    privacy: {
      isPublic: { type: Boolean, default: false },
      sharedWithDoctors: [{ type: Schema.Types.ObjectId, ref: "Doctor" }],
      anonymizedForResearch: { type: Boolean, default: false }
    },

    // Metadata
    tags: [{ type: String }], // for categorization
    category: { 
      type: String, 
      enum: ["general", "cardiology", "dermatology", "neurology", "pediatrics", "other"] 
    },
    status: { 
      type: String, 
      enum: ["active", "resolved", "follow_up_needed", "archived"], 
      default: "active" 
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    // Add TTL index for automatic cleanup of old records (optional)
    // expires: 60 * 60 * 24 * 365 * 5 // 5 years
  }
);

// Indexes for efficient queries
DiagnosisHistorySchema.index({ patient: 1, createdAt: -1 });
DiagnosisHistorySchema.index({ "aiDiagnosis.urgencyLevel": 1 });
DiagnosisHistorySchema.index({ "recommendations.primarySpecialty": 1 });
DiagnosisHistorySchema.index({ status: 1 });
DiagnosisHistorySchema.index({ "userActions.bookedAppointment": 1 });

module.exports = mongoose.model("DiagnosisHistory", DiagnosisHistorySchema); 