import json
import logging
import os
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class NutritionDatabase:
    """Nutrition database for Food-101 items"""
    
    def __init__(self, nutrition_file_path=None):
        self.nutrition_data = {}
        self.usda_api_key = os.getenv('USDA_API_KEY', None)
        self.nutrition_file_path = nutrition_file_path or 'data/nutrition_mapping.json'
        
        self._load_nutrition_data()
    
    def _load_nutrition_data(self):
        """Load nutrition data from file or create default mapping"""
        try:
            if os.path.exists(self.nutrition_file_path):
                with open(self.nutrition_file_path, 'r') as f:
                    self.nutrition_data = json.load(f)
                logger.info(f"Loaded nutrition data from {self.nutrition_file_path}")
            else:
                logger.warning(f"Nutrition file not found: {self.nutrition_file_path}")
                logger.info("Creating default nutrition mapping...")
                self._create_default_nutrition_mapping()
                
        except Exception as e:
            logger.error(f"Error loading nutrition data: {str(e)}")
            self._create_default_nutrition_mapping()
    
    def _create_default_nutrition_mapping(self):
        """Create a default nutrition mapping for Food-101 items"""
        # Default nutrition values per 100g for common foods
        self.nutrition_data = {
            'pizza': {
                'calories': 285,
                'protein': 12.5,
                'carbs': 36.2,
                'fat': 10.1,
                'fiber': 2.1,
                'sugar': 3.2,
                'sodium': 640
            },
            'hamburger': {
                'calories': 295,
                'protein': 17.2,
                'carbs': 30.1,
                'fat': 12.8,
                'fiber': 1.5,
                'sugar': 4.2,
                'sodium': 580
            },
            'sushi': {
                'calories': 150,
                'protein': 6.5,
                'carbs': 25.8,
                'fat': 2.1,
                'fiber': 0.8,
                'sugar': 0.5,
                'sodium': 320
            },
            'steak': {
                'calories': 271,
                'protein': 26.0,
                'carbs': 0.0,
                'fat': 18.0,
                'fiber': 0.0,
                'sugar': 0.0,
                'sodium': 72
            },
            'chicken_curry': {
                'calories': 180,
                'protein': 15.2,
                'carbs': 8.5,
                'fat': 10.8,
                'fiber': 2.1,
                'sugar': 3.2,
                'sodium': 450
            },
            'pasta_carbonara': {
                'calories': 320,
                'protein': 12.5,
                'carbs': 45.2,
                'fat': 12.8,
                'fiber': 2.5,
                'sugar': 2.1,
                'sodium': 680
            },
            'salad_caesar': {
                'calories': 120,
                'protein': 8.5,
                'carbs': 6.2,
                'fat': 8.1,
                'fiber': 2.8,
                'sugar': 1.5,
                'sodium': 420
            },
            'ice_cream': {
                'calories': 207,
                'protein': 3.5,
                'carbs': 24.0,
                'fat': 11.0,
                'fiber': 0.0,
                'sugar': 21.0,
                'sodium': 80
            },
            'apple_pie': {
                'calories': 237,
                'protein': 2.4,
                'carbs': 34.0,
                'fat': 11.0,
                'fiber': 1.8,
                'sugar': 18.0,
                'sodium': 266
            },
            'chocolate_cake': {
                'calories': 371,
                'protein': 5.4,
                'carbs': 50.0,
                'fat': 18.0,
                'fiber': 1.5,
                'sugar': 30.0,
                'sodium': 300
            },
            'french_fries': {
                'calories': 365,
                'protein': 3.4,
                'carbs': 63.0,
                'fat': 14.0,
                'fiber': 4.4,
                'sugar': 0.3,
                'sodium': 246
            },
            'fish_and_chips': {
                'calories': 290,
                'protein': 12.0,
                'carbs': 35.0,
                'fat': 12.0,
                'fiber': 2.0,
                'sugar': 1.0,
                'sodium': 450
            },
            'tacos': {
                'calories': 226,
                'protein': 12.0,
                'carbs': 20.0,
                'fat': 12.0,
                'fiber': 3.0,
                'sugar': 2.0,
                'sodium': 400
            },
            'ramen': {
                'calories': 188,
                'protein': 7.0,
                'carbs': 27.0,
                'fat': 7.0,
                'fiber': 1.0,
                'sugar': 1.0,
                'sodium': 891
            },
            'pad_thai': {
                'calories': 357,
                'protein': 14.0,
                'carbs': 45.0,
                'fat': 16.0,
                'fiber': 2.0,
                'sugar': 8.0,
                'sodium': 600
            }
        }
        
        # Save the default mapping
        os.makedirs(os.path.dirname(self.nutrition_file_path), exist_ok=True)
        with open(self.nutrition_file_path, 'w') as f:
            json.dump(self.nutrition_data, f, indent=2)
        
        logger.info(f"Created default nutrition mapping with {len(self.nutrition_data)} items")
    
    def get_nutrition(self, food_label: str) -> Dict[str, Any]:
        """
        Get nutrition information for a food item
        
        Args:
            food_label: Food label from Food-101 model
            
        Returns:
            Dictionary with nutrition information
        """
        # Try to get from local database first
        if food_label in self.nutrition_data:
            return self.nutrition_data[food_label].copy()
        
        # If not found, try USDA API (if available)
        if self.usda_api_key:
            usda_nutrition = self._get_usda_nutrition(food_label)
            if usda_nutrition:
                return usda_nutrition
        
        # Return default nutrition for unknown foods
        logger.warning(f"No nutrition data found for: {food_label}")
        return {
            'calories': 200,
            'protein': 10.0,
            'carbs': 25.0,
            'fat': 8.0,
            'fiber': 2.0,
            'sugar': 5.0,
            'sodium': 300
        }
    
    def _get_usda_nutrition(self, food_label: str) -> Optional[Dict[str, Any]]:
        """
        Get nutrition from USDA FoodData Central API
        
        Args:
            food_label: Food label to search for
            
        Returns:
            Nutrition dictionary or None if not found
        """
        try:
            # Search for the food item
            search_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
            params = {
                'api_key': self.usda_api_key,
                'query': food_label,
                'pageSize': 1
            }
            
            response = requests.get(search_url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            if data.get('foods') and len(data['foods']) > 0:
                food = data['foods'][0]
                
                # Extract nutrition values
                nutrition = {
                    'calories': 0,
                    'protein': 0,
                    'carbs': 0,
                    'fat': 0,
                    'fiber': 0,
                    'sugar': 0,
                    'sodium': 0
                }
                
                # Map USDA nutrients to our format
                nutrient_mapping = {
                    'Protein': 'protein',
                    'Total lipid (fat)': 'fat',
                    'Carbohydrate, by difference': 'carbs',
                    'Fiber, total dietary': 'fiber',
                    'Sugars, total including NLEA': 'sugar',
                    'Sodium, Na': 'sodium'
                }
                
                for nutrient in food.get('foodNutrients', []):
                    nutrient_name = nutrient.get('nutrientName', '')
                    value = nutrient.get('value', 0)
                    
                    if nutrient_name in nutrient_mapping:
                        nutrition[nutrient_mapping[nutrient_name]] = value
                
                # Calculate calories (if not provided)
                if nutrition['calories'] == 0:
                    nutrition['calories'] = (
                        nutrition['protein'] * 4 + 
                        nutrition['carbs'] * 4 + 
                        nutrition['fat'] * 9
                    )
                
                logger.info(f"Retrieved nutrition from USDA for: {food_label}")
                return nutrition
                
        except Exception as e:
            logger.warning(f"Error fetching from USDA API: {str(e)}")
        
        return None
    
    def add_nutrition_data(self, food_label: str, nutrition: Dict[str, Any]):
        """
        Add or update nutrition data for a food item
        
        Args:
            food_label: Food label
            nutrition: Nutrition dictionary
        """
        self.nutrition_data[food_label] = nutrition
        
        # Save to file
        try:
            with open(self.nutrition_file_path, 'w') as f:
                json.dump(self.nutrition_data, f, indent=2)
            logger.info(f"Added nutrition data for: {food_label}")
        except Exception as e:
            logger.error(f"Error saving nutrition data: {str(e)}")
    
    def get_all_foods(self) -> list:
        """Get list of all foods with nutrition data"""
        return list(self.nutrition_data.keys()) 