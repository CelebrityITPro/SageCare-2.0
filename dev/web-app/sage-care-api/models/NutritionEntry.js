const mongoose = require("mongoose");

const NutritionEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    mealType: { 
      type: String, 
      required: true, 
      enum: ["breakfast", "lunch", "dinner", "snack"] 
    },
    imageData: {
      data: { type: Buffer, required: true },
      contentType: { type: String, required: true },
      filename: { type: String, required: true }
    },
    nutrition: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
      fiber: { type: Number, required: true },
      sugar: { type: Number, required: true },
      sodium: { type: Number, required: true }
    },
    foodItems: [{ type: String }],
    confidence: { type: Number, required: true },
    recommendations: [{ type: String }],
    notes: { type: String },
    individualFoods: [{
      name: { type: String },
      calories: { type: Number },
      protein: { type: Number },
      carbs: { type: Number },
      fat: { type: Number },
      fiber: { type: Number },
      sugar: { type: Number },
      sodium: { type: Number },
      confidence: { type: Number }
    }]
  },
  { timestamps: true }
);

// Index for efficient queries
NutritionEntrySchema.index({ userId: 1, date: -1 });
NutritionEntrySchema.index({ userId: 1, mealType: 1 });

module.exports = mongoose.model("NutritionEntry", NutritionEntrySchema); 