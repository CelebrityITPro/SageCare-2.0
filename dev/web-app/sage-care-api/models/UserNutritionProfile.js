const mongoose = require("mongoose");

const UserNutritionProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    dietaryPreferences: [{ type: String }], // e.g., ["vegetarian", "gluten-free"]
    healthGoals: [{ type: String }], // e.g., ["weight_loss", "muscle_gain", "heart_health"]
    restrictions: [{ type: String }], // e.g., ["dairy", "nuts", "shellfish"]
    targetCalories: { type: Number },
    targetMacros: {
      protein: { type: Number }, // grams
      carbs: { type: Number }, // grams
      fat: { type: Number } // grams
    },
    activityLevel: { 
      type: String, 
      enum: ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"],
      default: "moderately_active"
    },
    weightGoal: {
      type: String,
      enum: ["lose_weight", "maintain_weight", "gain_weight"],
      default: "maintain_weight"
    },
    currentWeight: { type: Number }, // kg
    targetWeight: { type: Number }, // kg
    height: { type: Number }, // cm
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    preferences: {
      mealReminders: { type: Boolean, default: true },
      nutritionAlerts: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserNutritionProfile", UserNutritionProfileSchema); 