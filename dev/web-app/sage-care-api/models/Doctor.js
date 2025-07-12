const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    specialty: { type: String, required: true },
    experience: { type: String },
    education: [{ type: String }],
    qualifications: [{ type: String }],
    certifications: [{ type: String }],
    languages: [{ type: String }],
    location: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", DoctorSchema);
