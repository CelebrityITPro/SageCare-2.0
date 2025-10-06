const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    fullname: { type: String, required: true },
    // username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phone_number: { type: String, required: true },
    is_patient: { type: Boolean, default: false },
    is_doctor: { type: Boolean, default: false },
    profilePic: { type: Buffer },
    profilePicType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
