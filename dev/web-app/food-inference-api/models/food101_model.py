import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import logging
import os

logger = logging.getLogger(__name__)

class Food101Model:
    """Food-101 model wrapper for food classification"""
    
    def __init__(self, model_path=None):
        self.model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.transform = None
        self.class_names = []
        self.model_path = model_path
        
        # Food-101 class names (101 food categories)
        self.class_names = [
            'apple_pie', 'baby_back_ribs', 'baklava', 'beef_carpaccio', 'beef_tartare',
            'beet_salad', 'beignets', 'bibimbap', 'bread_pudding', 'breakfast_burrito',
            'bruschetta', 'caesar_salad', 'cannoli', 'caprese_salad', 'carrot_cake',
            'ceviche', 'cheesecake', 'cheese_plate', 'chicken_curry', 'chicken_quesadilla',
            'chicken_wings', 'chocolate_cake', 'chocolate_mousse', 'churros', 'clam_chowder',
            'club_sandwich', 'crab_cakes', 'creme_brulee', 'croque_madame', 'cup_cakes',
            'deviled_eggs', 'donuts', 'dumplings', 'edamame', 'eggs_benedict',
            'escargots', 'falafel', 'filet_mignon', 'fish_and_chips', 'foie_gras',
            'french_fries', 'french_onion_soup', 'french_toast', 'fried_calamari',
            'fried_rice', 'frozen_yogurt', 'garlic_bread', 'gnocchi', 'greek_salad',
            'grilled_cheese_sandwich', 'grilled_salmon', 'guacamole', 'gyoza', 'hamburger',
            'hot_and_sour_soup', 'hot_dog', 'huevos_rancheros', 'hummus', 'ice_cream',
            'lasagna', 'lobster_bisque', 'lobster_roll_sandwich', 'macaroni_and_cheese',
            'macarons', 'miso_soup', 'mussels', 'nachos', 'omelette', 'onion_rings',
            'oysters', 'pad_thai', 'paella', 'pancakes', 'panna_cotta', 'peking_duck',
            'pho', 'pizza', 'pork_chop', 'poutine', 'prime_rib', 'pulled_pork_sandwich',
            'ramen', 'ravioli', 'red_velvet_cake', 'risotto', 'samosa', 'sashimi',
            'scallops', 'seaweed_salad', 'shrimp_and_grits', 'spaghetti_bolognese',
            'spaghetti_carbonara', 'spring_rolls', 'steak', 'strawberry_shortcake',
            'sushi', 'tacos', 'takoyaki', 'tiramisu', 'tuna_tartare', 'waffles'
        ]
        
        self._load_model()
        self._setup_transforms()
    
    def _load_model(self):
        """Load the pre-trained Food-101 model"""
        try:
            # Use ResNet50 pre-trained on ImageNet as base
            self.model = models.resnet50(pretrained=True)
            
            # Modify the final layer for Food-101 (101 classes)
            num_classes = 101
            self.model.fc = nn.Linear(self.model.fc.in_features, num_classes)
            
            # Load pre-trained weights if available
            if self.model_path and os.path.exists(self.model_path):
                logger.info(f"Loading model from {self.model_path}")
                checkpoint = torch.load(self.model_path, map_location=self.device)
                self.model.load_state_dict(checkpoint['model_state_dict'])
            else:
                logger.warning("No pre-trained Food-101 weights found. Using ImageNet weights.")
            
            self.model = self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"Food-101 model loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"Error loading Food-101 model: {str(e)}")
            raise
    
    def _setup_transforms(self):
        """Setup image transformations for the model"""
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def predict(self, image):
        """
        Predict food class from image
        
        Args:
            image: PIL Image object
            
        Returns:
            tuple: (food_label, confidence_score)
        """
        try:
            # Apply transformations
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                confidence, predicted_idx = torch.max(probabilities, 1)
                
                # Get predicted class name
                predicted_class = self.class_names[predicted_idx.item()]
                confidence_score = confidence.item()
                
                logger.info(f"Predicted: {predicted_class} with confidence: {confidence_score:.3f}")
                
                return predicted_class, confidence_score
                
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            raise
    
    def is_loaded(self):
        """Check if model is loaded"""
        return self.model is not None
    
    def get_class_names(self):
        """Get list of all class names"""
        return self.class_names.copy() 