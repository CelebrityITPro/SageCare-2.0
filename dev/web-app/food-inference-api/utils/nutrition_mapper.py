import logging
from typing import Dict, Any, List
import re

logger = logging.getLogger(__name__)

class NutritionMapper:
    """Maps food labels to nutrition data and generates health tips"""
    
    def __init__(self):
        self.nutrition_db = None
        self.tips_rules = self._setup_tips_rules()
    
    def set_nutrition_database(self, nutrition_db):
        """Set the nutrition database instance"""
        self.nutrition_db = nutrition_db
    
    def get_nutrition(self, food_label: str) -> Dict[str, Any]:
        """
        Get nutrition information for a food item
        
        Args:
            food_label: Food label from model prediction
            
        Returns:
            Dictionary with nutrition information
        """
        if self.nutrition_db is None:
            logger.error("Nutrition database not set")
            return self._get_default_nutrition()
        
        return self.nutrition_db.get_nutrition(food_label)
    
    def generate_health_tips(self, nutrition: Dict[str, Any]) -> List[str]:
        """
        Generate personalized health tips based on nutrition data
        
        Args:
            nutrition: Nutrition dictionary
            
        Returns:
            List of health tips
        """
        tips = []
        
        try:
            calories = nutrition.get('calories', 0)
            protein = nutrition.get('protein', 0)
            carbs = nutrition.get('carbs', 0)
            fat = nutrition.get('fat', 0)
            fiber = nutrition.get('fiber', 0)
            sugar = nutrition.get('sugar', 0)
            sodium = nutrition.get('sodium', 0)
            
            # Apply tips based on nutrition values
            tips.extend(self._apply_calorie_tips(calories))
            tips.extend(self._apply_macro_tips(protein, carbs, fat))
            tips.extend(self._apply_fiber_tips(fiber))
            tips.extend(self._apply_sugar_tips(sugar))
            tips.extend(self._apply_sodium_tips(sodium))
            
            # Add general tips
            tips.extend(self._get_general_tips())
            
            # Limit to 5 tips maximum
            return tips[:5]
            
        except Exception as e:
            logger.error(f"Error generating health tips: {str(e)}")
            return ["Consider portion control for balanced nutrition."]
    
    def _setup_tips_rules(self) -> Dict[str, Any]:
        """Setup rules for generating health tips"""
        return {
            'calories': {
                'high': 300,
                'medium': 200,
                'low': 100
            },
            'protein': {
                'high': 20,
                'medium': 10,
                'low': 5
            },
            'carbs': {
                'high': 50,
                'medium': 30,
                'low': 15
            },
            'fat': {
                'high': 15,
                'medium': 8,
                'low': 3
            },
            'fiber': {
                'high': 5,
                'medium': 3,
                'low': 1
            },
            'sugar': {
                'high': 15,
                'medium': 8,
                'low': 3
            },
            'sodium': {
                'high': 500,
                'medium': 300,
                'low': 100
            }
        }
    
    def _apply_calorie_tips(self, calories: float) -> List[str]:
        """Generate tips based on calorie content"""
        tips = []
        
        if calories > self.tips_rules['calories']['high']:
            tips.append("This is a high-calorie food. Consider smaller portions or sharing.")
        elif calories < self.tips_rules['calories']['low']:
            tips.append("This is a low-calorie option. You might want to add protein or healthy fats.")
        
        return tips
    
    def _apply_macro_tips(self, protein: float, carbs: float, fat: float) -> List[str]:
        """Generate tips based on macronutrient content"""
        tips = []
        
        # Protein tips
        if protein > self.tips_rules['protein']['high']:
            tips.append("Good protein content! This can help with muscle maintenance.")
        elif protein < self.tips_rules['protein']['low']:
            tips.append("Low in protein. Consider adding lean protein sources.")
        
        # Carb tips
        if carbs > self.tips_rules['carbs']['high']:
            tips.append("High in carbohydrates. Great for energy, but watch portion size.")
        elif carbs < self.tips_rules['carbs']['low']:
            tips.append("Low in carbs. Good for low-carb diets.")
        
        # Fat tips
        if fat > self.tips_rules['fat']['high']:
            tips.append("High in fat. Consider grilled or baked alternatives.")
        elif fat < self.tips_rules['fat']['low']:
            tips.append("Low in fat. You might want to add healthy fats like avocado.")
        
        return tips
    
    def _apply_fiber_tips(self, fiber: float) -> List[str]:
        """Generate tips based on fiber content"""
        tips = []
        
        if fiber > self.tips_rules['fiber']['high']:
            tips.append("Excellent fiber content! Great for digestive health.")
        elif fiber < self.tips_rules['fiber']['low']:
            tips.append("Low in fiber. Consider adding vegetables or whole grains.")
        
        return tips
    
    def _apply_sugar_tips(self, sugar: float) -> List[str]:
        """Generate tips based on sugar content"""
        tips = []
        
        if sugar > self.tips_rules['sugar']['high']:
            tips.append("High in sugar. Consider natural sweeteners or smaller portions.")
        elif sugar < self.tips_rules['sugar']['low']:
            tips.append("Low in sugar. Good choice for sugar-conscious diets.")
        
        return tips
    
    def _apply_sodium_tips(self, sodium: float) -> List[str]:
        """Generate tips based on sodium content"""
        tips = []
        
        if sodium > self.tips_rules['sodium']['high']:
            tips.append("High in sodium. Consider low-sodium alternatives or smaller portions.")
        elif sodium < self.tips_rules['sodium']['low']:
            tips.append("Low in sodium. Good for heart health.")
        
        return tips
    
    def _get_general_tips(self) -> List[str]:
        """Get general nutrition tips"""
        return [
            "Remember to stay hydrated with water throughout the day.",
            "Aim for a variety of colorful foods for optimal nutrition.",
            "Consider your overall daily nutrition goals when planning meals."
        ]
    
    def _get_default_nutrition(self) -> Dict[str, Any]:
        """Get default nutrition values"""
        return {
            'calories': 200,
            'protein': 10.0,
            'carbs': 25.0,
            'fat': 8.0,
            'fiber': 2.0,
            'sugar': 5.0,
            'sodium': 300
        }
    
    def format_food_label(self, food_label: str) -> str:
        """
        Format food label for display (convert snake_case to Title Case)
        
        Args:
            food_label: Raw food label from model
            
        Returns:
            Formatted food label
        """
        try:
            # Replace underscores with spaces and capitalize
            formatted = food_label.replace('_', ' ').title()
            
            # Handle special cases
            special_cases = {
                'Fish And Chips': 'Fish & Chips',
                'Mac And Cheese': 'Mac & Cheese',
                'Pad Thai': 'Pad Thai',
                'Pho': 'Pho',
                'Sushi': 'Sushi',
                'Tacos': 'Tacos',
                'Ramen': 'Ramen'
            }
            
            return special_cases.get(formatted, formatted)
            
        except Exception as e:
            logger.error(f"Error formatting food label: {str(e)}")
            return food_label.replace('_', ' ').title()
    
    def get_nutrition_summary(self, nutrition: Dict[str, Any]) -> str:
        """
        Generate a brief nutrition summary
        
        Args:
            nutrition: Nutrition dictionary
            
        Returns:
            Summary string
        """
        try:
            calories = nutrition.get('calories', 0)
            protein = nutrition.get('protein', 0)
            carbs = nutrition.get('carbs', 0)
            fat = nutrition.get('fat', 0)
            
            summary_parts = []
            
            if calories > 0:
                summary_parts.append(f"{calories:.0f} calories")
            
            if protein > 0:
                summary_parts.append(f"{protein:.1f}g protein")
            
            if carbs > 0:
                summary_parts.append(f"{carbs:.1f}g carbs")
            
            if fat > 0:
                summary_parts.append(f"{fat:.1f}g fat")
            
            return " • ".join(summary_parts)
            
        except Exception as e:
            logger.error(f"Error generating nutrition summary: {str(e)}")
            return "Nutrition information available" 