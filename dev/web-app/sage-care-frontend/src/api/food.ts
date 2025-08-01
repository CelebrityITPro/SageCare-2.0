// Food inference API client
const FOOD_INFERENCE_BASE_URL = import.meta.env.VITE_FOOD_API_URL || 'http://food-inference-api:5001';

export interface FoodAnalysisResult {
  success: boolean;
  food_label: string;
  confidence: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  tips: string[];
  error?: string;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  foodItems: string[];
  confidence: number;
}

/**
 * Analyze a food image using the Food-101 inference server
 * @param imageFile - The image file to analyze
 * @returns Promise with the analysis result
 */
export const analyzeFoodImage = async (imageFile: File): Promise<FoodAnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${FOOD_INFERENCE_BASE_URL}/analyze-food-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Food analysis error:', error);
    throw error;
  }
};

/**
 * Check the health status of the food inference server
 * @returns Promise with the health status
 */
export const checkFoodServerHealth = async (): Promise<{ status: string; model_loaded: boolean; database_loaded: boolean }> => {
  try {
    const response = await fetch(`${FOOD_INFERENCE_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Convert FoodAnalysisResult to NutritionData format for the frontend
 * @param analysisResult - The result from the food inference server
 * @returns NutritionData object
 */
export const convertToNutritionData = (analysisResult: FoodAnalysisResult): NutritionData => {
  return {
    calories: analysisResult.nutrition.calories,
    protein: analysisResult.nutrition.protein,
    carbs: analysisResult.nutrition.carbs,
    fat: analysisResult.nutrition.fat,
    fiber: analysisResult.nutrition.fiber,
    sugar: analysisResult.nutrition.sugar,
    sodium: analysisResult.nutrition.sodium,
    foodItems: [analysisResult.food_label],
    confidence: analysisResult.confidence,
  };
}; 