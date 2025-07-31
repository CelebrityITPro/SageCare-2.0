from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from werkzeug.utils import secure_filename
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models.food101_model import Food101Model
from models.nutrition_db import NutritionDatabase
from utils.image_processing import preprocess_image
from utils.nutrition_mapper import NutritionMapper

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:8080", 
    "https://localhost:8443",
    "http://localhost:5173"  # Vite dev server
])

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global model and database instances
food_model = None
nutrition_db = None
nutrition_mapper = None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_model_and_data():
    """Load the Food-101 model and nutrition database"""
    global food_model, nutrition_db, nutrition_mapper
    
    try:
        # Initialize Food-101 model
        food_model = Food101Model()
        logger.info("Food-101 model loaded successfully")
        
        # Initialize nutrition database
        nutrition_db = NutritionDatabase()
        logger.info("Nutrition database loaded successfully")
        
        # Initialize nutrition mapper and connect to database
        nutrition_mapper = NutritionMapper()
        nutrition_mapper.set_nutrition_database(nutrition_db)
        logger.info("Nutrition mapper initialized successfully")
        
        return True
    except Exception as e:
        logger.error(f"Error loading model and data: {str(e)}")
        return False

# Load model and data at module level (runs when gunicorn imports the app)
logger.info("Loading Food-101 model and nutrition database...")
if not load_model_and_data():
    logger.error("Failed to load model and data. Application may not function properly.")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = food_model is not None and food_model.is_loaded()
    db_status = nutrition_db is not None
    
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_status,
        'database_loaded': db_status,
        'timestamp': str(torch.cuda.is_available() if torch.cuda.is_available() else 'CPU')
    })

@app.route('/analyze-food-image', methods=['POST'])
def analyze_food_image():
    """Analyze uploaded food image and return nutrition information"""
    
    # Check if model is loaded
    if food_model is None or not food_model.is_loaded():
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No file provided'
        }), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected'
        }), 400
    
    # Check file size
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        return jsonify({
            'success': False,
            'error': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB'
        }), 400
    
    # Check file extension
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF'
        }), 400
    
    try:
        # Read and preprocess image
        image_data = file.read()
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Preprocess image for model
        processed_image = preprocess_image(image)
        
        # Run inference
        food_label, confidence = food_model.predict(processed_image)
        
        # Get nutrition information
        nutrition_info = nutrition_mapper.get_nutrition(food_label)
        
        # Generate health tips
        tips = nutrition_mapper.generate_health_tips(nutrition_info)
        
        return jsonify({
            'success': True,
            'food_label': food_label,
            'confidence': float(confidence),
            'nutrition': nutrition_info,
            'tips': tips
        })
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error processing image'
        }), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'success': False,
        'error': 'File too large'
    }), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Load model and data on startup
    if load_model_and_data():
        logger.info("Starting Food Inference API server...")
        port = int(os.getenv('PORT', 5001))
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        logger.error("Failed to load model and data. Exiting...")
        exit(1) 