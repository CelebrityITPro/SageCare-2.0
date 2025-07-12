const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const AppointmentSchema = mongoose.Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "missed"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    jitsiLink: {
      type: String,
    },
    timezone: {
      type: String,
      required: false,
    },
    // Third party fields
    thirdParty: {
      email: {
        type: String,
      },
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
    },
    // Participation tracking fields
    participation: {
      patientJoined: {
        type: Boolean,
        default: false,
      },
      doctorJoined: {
        type: Boolean,
        default: false,
      },
      patientJoinTime: {
        type: Date,
      },
      doctorJoinTime: {
        type: Date,
      },
      meetingDuration: {
        type: Number, // in minutes
      },
      lastActivity: {
        type: Date,
      },
    },
    // Meeting outcome tracking
    meetingOutcome: {
      type: String,
      enum: ["completed", "missed", "cancelled", "rescheduled"],
      default: "missed",
    },
    // Notes about the meeting
    meetingNotes: {
      type: String,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
