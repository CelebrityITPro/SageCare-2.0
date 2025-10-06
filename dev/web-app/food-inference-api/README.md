# Food-101 Inference Server

A Flask-based inference server that uses the Food-101 model to analyze food images and provide nutritional information with personalized health tips.

## Features

- **Food Recognition**: Uses pre-trained Food-101 model to identify 101 different food categories
- **Nutrition Analysis**: Provides detailed nutritional information (calories, protein, carbs, fat, fiber, sugar, sodium)
- **Health Tips**: Generates personalized health recommendations based on nutrition data
- **RESTful API**: Simple HTTP endpoints for easy integration
- **CORS Support**: Configured for cross-origin requests from web applications
- **Error Handling**: Comprehensive error handling and validation

## Architecture

```
food-inference-api/
├── app.py                 # Main Flask application
├── models/
│   ├── food101_model.py   # Food-101 model wrapper
│   └── nutrition_db.py    # Nutrition database
├── utils/
│   ├── image_processing.py # Image preprocessing utilities
│   └── nutrition_mapper.py # Nutrition mapping and tips generation
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
└── README.md            # This file
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone and navigate to the directory:**
   ```bash
   cd dev/food-inference-api
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5001`

### Docker Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t food-inference-api .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5001:5001 food-inference-api
   ```

## API Endpoints

### Health Check

**GET** `/health`

Check if the server and model are running properly.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "database_loaded": true,
  "timestamp": "CPU"
}
```

### Analyze Food Image

**POST** `/analyze-food-image`

Analyze a food image and return nutrition information.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file: JPG, PNG, JPEG, GIF)
- Max file size: 10MB

**Response:**
```json
{
  "success": true,
  "food_label": "pizza",
  "confidence": 0.92,
  "nutrition": {
    "calories": 285,
    "protein": 12.5,
    "carbs": 36.2,
    "fat": 10.1,
    "fiber": 2.1,
    "sugar": 3.2,
    "sodium": 640
  },
  "tips": [
    "This is a high-calorie food. Consider smaller portions or sharing.",
    "Good protein content! This can help with muscle maintenance.",
    "High in carbohydrates. Great for energy, but watch portion size."
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Model Information

### Food-101 Dataset

The server uses a model trained on the Food-101 dataset, which includes 101 food categories:

- Common foods: pizza, hamburger, sushi, steak, etc.
- Desserts: ice_cream, chocolate_cake, apple_pie, etc.
- Beverages: coffee, tea, etc.
- And many more...

### Supported Food Categories

The model can recognize 101 different food categories. Some examples:
- `pizza`, `hamburger`, `sushi`, `steak`
- `chicken_curry`, `pasta_carbonara`, `salad_caesar`
- `ice_cream`, `chocolate_cake`, `apple_pie`
- `french_fries`, `fish_and_chips`, `tacos`

## Nutrition Database

The server includes a comprehensive nutrition database with:

- **Default Mapping**: Pre-configured nutrition values for common foods
- **USDA Integration**: Optional integration with USDA FoodData Central API
- **Fallback Values**: Default nutrition values for unknown foods

### Adding Custom Nutrition Data

You can add custom nutrition data by modifying the `nutrition_mapping.json` file or using the USDA API.

## Health Tips Engine

The server generates personalized health tips based on:

- **Calorie Content**: High/low calorie recommendations
- **Macronutrients**: Protein, carbs, and fat analysis
- **Micronutrients**: Fiber, sugar, and sodium content
- **General Guidelines**: Overall nutrition recommendations

## Integration with Frontend

The server is designed to work seamlessly with the SageCare frontend:

1. **Frontend sends image** to `/analyze-food-image`
2. **Server processes image** using Food-101 model
3. **Nutrition data** is retrieved from database
4. **Health tips** are generated based on nutrition
5. **Results returned** to frontend for display

## Configuration

### Environment Variables

- `USDA_API_KEY`: Optional USDA FoodData Central API key
- `MODEL_PATH`: Path to custom model weights (optional)
- `NUTRITION_DB_PATH`: Path to nutrition database file

### CORS Configuration

The server is configured to accept requests from:
- `http://localhost:3000` (React development server)
- `http://localhost:8080` (Alternative dev server)
- `https://localhost:8443` (HTTPS development)

## Error Handling

The server includes comprehensive error handling for:

- **Invalid file types**: Only JPG, PNG, JPEG, GIF allowed
- **File size limits**: Maximum 10MB per image
- **Model errors**: Graceful handling of inference failures
- **Network errors**: Proper error responses for API failures

## Performance

- **Model Loading**: ~30 seconds on first startup
- **Inference Time**: ~1-3 seconds per image (CPU)
- **Memory Usage**: ~2-4GB RAM (depending on model size)
- **Concurrent Requests**: Limited to 1 worker for stability

## Troubleshooting

### Common Issues

1. **Model not loading**: Check if PyTorch is installed correctly
2. **CUDA errors**: The server runs on CPU by default
3. **Memory issues**: Ensure sufficient RAM (4GB+ recommended)
4. **CORS errors**: Check if frontend URL is in allowed origins

### Logs

The server provides detailed logging:
- Model loading status
- Inference results
- Error messages
- API request details

## Development

### Adding New Features

1. **New Food Categories**: Update the class names in `food101_model.py`
2. **Nutrition Data**: Add entries to the nutrition database
3. **Health Tips**: Modify the rules in `nutrition_mapper.py`
4. **API Endpoints**: Add new routes in `app.py`

### Testing

Test the API using curl:

```bash
# Health check
curl http://localhost:5000/health

# Analyze image
curl -X POST -F "file=@food_image.jpg" http://localhost:5000/analyze-food-image
```

## License

This project is part of the SageCare telemedicine application and follows the same licensing terms. 