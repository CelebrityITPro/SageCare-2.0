const express = require("express");
const router = express.Router();
const multer = require("multer");
const NutritionEntry = require("../models/NutritionEntry");

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

    // Analyze the food image
    const analysis = await analyzeFoodImage(req.file.buffer);

    // Create nutrition entry in database
    const nutritionEntry = new NutritionEntry({
      userId,
      mealType,
      imageData: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      },
      nutrition: analysis.nutrition,
      foodItems: analysis.foodItems,
      confidence: analysis.confidence,
      recommendations: analysis.recommendations,
      notes,
      individualFoods: analysis.individualFoods
    });

    await nutritionEntry.save();

    res.json({
      success: true,
      analysis,
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

// Get diet recommendations
router.get("/recommendations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's recent nutrition data
    const recentEntries = await NutritionEntry.find({ userId })
      .sort({ date: -1 })
      .limit(10)
      .select('nutrition mealType');
    
    // Calculate average nutrition
    const avgNutrition = recentEntries.reduce((acc, entry) => ({
      calories: acc.calories + entry.nutrition.calories,
      protein: acc.protein + entry.nutrition.protein,
      carbs: acc.carbs + entry.nutrition.carbs,
      fat: acc.fat + entry.nutrition.fat,
      fiber: acc.fiber + entry.nutrition.fiber,
      sugar: acc.sugar + entry.nutrition.sugar,
      sodium: acc.sodium + entry.nutrition.sodium,
    }), {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
    });
    
    // Calculate averages
    const count = recentEntries.length || 1;
    Object.keys(avgNutrition).forEach(key => {
      avgNutrition[key] = avgNutrition[key] / count;
    });
    
    // Generate personalized recommendations
    const recommendations = [];
    
    if (avgNutrition.calories < 1500) {
      recommendations.push({
        type: "nutrition",
        title: "Increase Calorie Intake",
        description: "Your average daily calorie intake is low. Consider adding more nutrient-dense foods.",
        priority: "high"
      });
    } else if (avgNutrition.calories > 2500) {
      recommendations.push({
        type: "nutrition",
        title: "Consider Portion Control",
        description: "Your calorie intake is high. Focus on portion control and balanced meals.",
        priority: "medium"
      });
    }
    
    if (avgNutrition.protein < 50) {
      recommendations.push({
        type: "nutrition",
        title: "Increase Protein Intake",
        description: "Add more protein-rich foods like lean meats, fish, eggs, or legumes.",
        priority: "high"
      });
    }
    
    if (avgNutrition.fiber < 25) {
      recommendations.push({
        type: "nutrition",
        title: "Add More Fiber",
        description: "Include more fiber-rich foods like whole grains, fruits, and vegetables.",
        priority: "medium"
      });
    }
    
    if (avgNutrition.sugar > 50) {
      recommendations.push({
        type: "nutrition",
        title: "Reduce Sugar Intake",
        description: "Consider reducing processed foods and added sugars.",
        priority: "medium"
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        type: "lifestyle",
        title: "Great Job!",
        description: "Your nutrition is well-balanced. Keep up the good work!",
        priority: "low"
      });
    }
    
    res.json({
      success: true,
      recommendations,
      avgNutrition
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({ 
      error: "Failed to get recommendations",
      details: error.message 
    });
  }
});

module.exports = router; 