const express = require("express");
const router = express.Router();
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");
const NutritionEntry = require("../models/NutritionEntry");
const Recommendation = require("../models/Recommendation");
const UserNutritionProfile = require("../models/UserNutritionProfile");

// Configure multer for memory storage (no file system)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Mock AI analysis function (replace with actual AI service)
const analyzeFoodImage = async (imageBuffer) => {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock analysis results - replace with actual AI analysis
  const possibleFoods = [
    {
      name: "Grilled Chicken Breast",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      confidence: 0.92
    },
    {
      name: "Mixed Vegetables",
      calories: 70,
      protein: 4,
      carbs: 12,
      fat: 0.5,
      fiber: 6,
      sugar: 4,
      sodium: 45,
      confidence: 0.88
    },
    {
      name: "Brown Rice",
      calories: 216,
      protein: 4.5,
      carbs: 45,
      fat: 1.8,
      fiber: 3.5,
      sugar: 0.4,
      sodium: 10,
      confidence: 0.85
    },
    {
      name: "Salmon Fillet",
      calories: 208,
      protein: 25,
      carbs: 0,
      fat: 12,
      fiber: 0,
      sugar: 0,
      sodium: 59,
      confidence: 0.90
    },
    {
      name: "Greek Salad",
      calories: 120,
      protein: 8,
      carbs: 8,
      fat: 8,
      fiber: 3,
      sugar: 4,
      sodium: 400,
      confidence: 0.87
    }
  ];
  
  // Randomly select 1-3 food items
  const numItems = Math.floor(Math.random() * 3) + 1;
  const selectedFoods = [];
  const usedIndices = new Set();
  
  for (let i = 0; i < numItems; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * possibleFoods.length);
    } while (usedIndices.has(index));
    
    usedIndices.add(index);
    selectedFoods.push(possibleFoods[index]);
  }
  
  // Calculate totals
  const totals = selectedFoods.reduce((acc, food) => ({
    calories: acc.calories + food.calories,
    protein: acc.protein + food.protein,
    carbs: acc.carbs + food.carbs,
    fat: acc.fat + food.fat,
    fiber: acc.fiber + food.fiber,
    sugar: acc.sugar + food.sugar,
    sodium: acc.sodium + food.sodium,
  }), {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
  });
  
  return {
    foodItems: selectedFoods.map(food => food.name),
    nutrition: totals,
    individualFoods: selectedFoods,
    confidence: selectedFoods.reduce((acc, food) => acc + food.confidence, 0) / selectedFoods.length,
    recommendations: generateRecommendations(totals)
  };
};

const generateRecommendations = (nutrition) => {
  const recommendations = [];
  
  if (nutrition.calories < 300) {
    recommendations.push("Consider adding more food to meet your energy needs");
  } else if (nutrition.calories > 800) {
    recommendations.push("This meal is quite high in calories. Consider portion control");
  }
  
  if (nutrition.protein < 20) {
    recommendations.push("Add more protein-rich foods for better muscle health");
  }
  
  if (nutrition.fiber < 5) {
    recommendations.push("Include more fiber-rich foods for better digestion");
  }
  
  if (nutrition.sugar > 15) {
    recommendations.push("Consider reducing sugar intake for better health");
  }
  
  if (nutrition.sodium > 500) {
    recommendations.push("This meal is high in sodium. Consider lower-sodium options");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Great choice! This meal appears to be well-balanced");
  }
  
  return recommendations;
};

// Analyze food image and save to database
router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Get user ID from request (you might want to get this from JWT token)
    const userId = req.body.userId || "default-user";
    const mealType = req.body.mealType || "lunch";
    const notes = req.body.notes || "";

    // Call the Food Inference API
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
    
    const foodInferenceResponse = await fetch('http://localhost:5001/analyze-food-image', {
      method: 'POST',
      body: formData
    });

    if (!foodInferenceResponse.ok) {
      throw new Error('Food inference API failed');
    }

    const foodAnalysis = await foodInferenceResponse.json();
    
    if (!foodAnalysis.success) {
      throw new Error(foodAnalysis.error || 'Food analysis failed');
    }

    // Create nutrition entry in database with enhanced metadata
    const nutritionEntry = new NutritionEntry({
      userId,
      mealType,
      imageData: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      },
      nutrition: foodAnalysis.nutrition,
      foodItems: [foodAnalysis.food_label],
      confidence: foodAnalysis.confidence,
      recommendations: foodAnalysis.tips || [],
      notes,
      analysisMetadata: {
        modelVersion: "food-101-v1",
        processingTime: Date.now(), // You could track actual processing time
        foodLabel: foodAnalysis.food_label
      },
      tags: [foodAnalysis.food_label, mealType]
    });

    await nutritionEntry.save();

    // Create recommendations from the analysis
    if (foodAnalysis.tips && foodAnalysis.tips.length > 0) {
      const recommendations = foodAnalysis.tips.map((tip, index) => ({
        userId,
        sourceEntryId: nutritionEntry._id,
        category: index === 0 ? "health_tip" : "dietary_advice",
        content: tip,
        priority: index === 0 ? 4 : 3,
        tags: [foodAnalysis.food_label, mealType]
      }));

      await Recommendation.insertMany(recommendations);
    }

    res.json({
      success: true,
      analysis: {
        foodItems: [foodAnalysis.food_label],
        nutrition: foodAnalysis.nutrition,
        confidence: foodAnalysis.confidence,
        recommendations: foodAnalysis.tips || []
      },
      entryId: nutritionEntry._id,
      message: "Food analyzed and saved successfully"
    });
  } catch (error) {
    console.error("Food analysis error:", error);
    res.status(500).json({ 
      error: "Failed to analyze food image",
      details: error.message 
    });
  }
});

// Get nutrition history for a user
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, limit = 50 } = req.query;
    
    let query = { userId };
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    const entries = await NutritionEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .select('-imageData'); // Don't send image data in list view
    
    res.json({
      success: true,
      history: entries
    });
  } catch (error) {
    console.error("Get nutrition history error:", error);
    res.status(500).json({ 
      error: "Failed to get nutrition history",
      details: error.message 
    });
  }
});

// Get specific nutrition entry with image
router.get("/entry/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;
    
    const entry = await NutritionEntry.findById(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: "Nutrition entry not found" });
    }
    
    res.json({
      success: true,
      entry
    });
  } catch (error) {
    console.error("Get nutrition entry error:", error);
    res.status(500).json({ 
      error: "Failed to get nutrition entry",
      details: error.message 
    });
  }
});

// Get nutrition entry image
router.get("/entry/:entryId/image", async (req, res) => {
  try {
    const { entryId } = req.params;
    
    const entry = await NutritionEntry.findById(entryId).select('imageData');
    
    if (!entry) {
      return res.status(404).json({ error: "Nutrition entry not found" });
    }
    
    res.set('Content-Type', entry.imageData.contentType);
    res.send(entry.imageData.data);
  } catch (error) {
    console.error("Get nutrition entry image error:", error);
    res.status(500).json({ 
      error: "Failed to get nutrition entry image",
      details: error.message 
    });
  }
});

// Save nutrition entry manually (without image)
router.post("/entry", async (req, res) => {
  try {
    const { userId, mealType, nutrition, foodItems, notes, confidence, recommendations, individualFoods } = req.body;
    
    const nutritionEntry = new NutritionEntry({
      userId,
      mealType,
      nutrition,
      foodItems,
      confidence,
      recommendations,
      notes,
      individualFoods
    });
    
    await nutritionEntry.save();
    
    res.json({
      success: true,
      entry: nutritionEntry
    });
  } catch (error) {
    console.error("Save nutrition entry error:", error);
    res.status(500).json({ 
      error: "Failed to save nutrition entry",
      details: error.message 
    });
  }
});

// Delete nutrition entry
router.delete("/entry/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;
    
    const result = await NutritionEntry.findByIdAndDelete(entryId);
    
    if (!result) {
      return res.status(404).json({ error: "Nutrition entry not found" });
    }
    
    res.json({
      success: true,
      message: "Nutrition entry deleted successfully"
    });
  } catch (error) {
    console.error("Delete nutrition entry error:", error);
    res.status(500).json({ 
      error: "Failed to delete nutrition entry",
      details: error.message 
    });
  }
});

// Get all recommendations for a user
router.get("/recommendations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, isFollowed, isIgnored, limit = 100 } = req.query;
    
    let query = { userId };
    
    if (category) query.category = category;
    if (isFollowed !== undefined) query.isFollowed = isFollowed === 'true';
    if (isIgnored !== undefined) query.isIgnored = isIgnored === 'true';
    
    const recommendations = await Recommendation.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sourceEntryId', 'foodItems date mealType');
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({ 
      error: "Failed to get recommendations",
      details: error.message 
    });
  }
});

// Save user feedback for nutrition entry
router.post("/entry/:entryId/feedback", async (req, res) => {
  try {
    const { entryId } = req.params;
    const { accuracyRating, helpfulRecommendations, ignoredRecommendations } = req.body;
    
    const updateData = {
      'userFeedback.accuracyRating': accuracyRating,
      'userFeedback.helpfulRecommendations': helpfulRecommendations,
      'userFeedback.ignoredRecommendations': ignoredRecommendations
    };
    
    const entry = await NutritionEntry.findByIdAndUpdate(
      entryId,
      updateData,
      { new: true }
    );
    
    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        error: "Nutrition entry not found" 
      });
    }
    
    res.json({
      success: true,
      entry
    });
  } catch (error) {
    console.error("Save feedback error:", error);
    res.status(500).json({ 
      error: "Failed to save feedback",
      details: error.message 
    });
  }
});

// Get nutrition analytics for a user
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const query = { userId, ...dateQuery };
    
    const entries = await NutritionEntry.find(query);
    
    // Calculate analytics
    const totalEntries = entries.length;
    const totalCalories = entries.reduce((sum, entry) => sum + entry.nutrition.calories, 0);
    const avgCalories = totalEntries > 0 ? totalCalories / totalEntries : 0;
    
    const mealTypeBreakdown = entries.reduce((acc, entry) => {
      acc[entry.mealType] = (acc[entry.mealType] || 0) + 1;
      return acc;
    }, {});
    
    const avgConfidence = entries.reduce((sum, entry) => sum + entry.confidence, 0) / totalEntries || 0;
    
    res.json({
      success: true,
      analytics: {
        totalEntries,
        totalCalories,
        avgCalories: Math.round(avgCalories),
        mealTypeBreakdown,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });
  } catch (error) {
    console.error("Get nutrition analytics error:", error);
    res.status(500).json({ 
      error: "Failed to get nutrition analytics",
      details: error.message 
    });
  }
});

module.exports = router; 