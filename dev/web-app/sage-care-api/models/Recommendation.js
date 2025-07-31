const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    sourceEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "NutritionEntry", required: true },
    category: { 
      type: String, 
      required: true,
      enum: ["health_tip", "dietary_advice", "portion_control", "nutrition_insight", "meal_suggestion"]
    },
    content: { type: String, required: true },
    priority: { type: Number, min: 1, max: 5, default: 3 },
    isFollowed: { type: Boolean, default: false },
    isIgnored: { type: Boolean, default: false },
    followDate: { type: Date },
    ignoreDate: { type: Date },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

// Indexes for efficient queries
RecommendationSchema.index({ userId: 1, category: 1 });
RecommendationSchema.index({ userId: 1, isFollowed: 1 });
RecommendationSchema.index({ userId: 1, isIgnored: 1 });
RecommendationSchema.index({ sourceEntryId: 1 });

module.exports = mongoose.model("Recommendation", RecommendationSchema); 