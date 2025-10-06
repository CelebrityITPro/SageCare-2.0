import cv2
import numpy as np
from PIL import Image, ImageEnhance
import logging

logger = logging.getLogger(__name__)

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Preprocess image for Food-101 model
    
    Args:
        image: PIL Image object
        
    Returns:
        Preprocessed PIL Image
    """
    try:
        # Convert to RGB if not already
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to standard size (224x224 for most CNN models)
        image = image.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Optional: Apply basic image enhancements
        image = enhance_image(image)
        
        return image
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise

def enhance_image(image: Image.Image) -> Image.Image:
    """
    Apply basic image enhancements for better recognition
    
    Args:
        image: PIL Image object
        
    Returns:
        Enhanced PIL Image
    """
    try:
        # Convert to numpy array for OpenCV processing
        img_array = np.array(image)
        
        # Apply slight contrast enhancement
        lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # Enhance lightness channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        
        # Merge channels back
        lab = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        # Convert back to PIL Image
        enhanced_image = Image.fromarray(enhanced)
        
        return enhanced_image
        
    except Exception as e:
        logger.warning(f"Error enhancing image: {str(e)}")
        # Return original image if enhancement fails
        return image

def validate_image(image: Image.Image) -> bool:
    """
    Validate if image is suitable for food recognition
    
    Args:
        image: PIL Image object
        
    Returns:
        True if image is valid, False otherwise
    """
    try:
        # Check image size
        width, height = image.size
        if width < 50 or height < 50:
            logger.warning("Image too small for reliable recognition")
            return False
        
        # Check if image is too dark or too bright
        img_array = np.array(image)
        mean_brightness = np.mean(img_array)
        
        if mean_brightness < 30:
            logger.warning("Image too dark for reliable recognition")
            return False
        elif mean_brightness > 220:
            logger.warning("Image too bright for reliable recognition")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error validating image: {str(e)}")
        return False

def crop_to_square(image: Image.Image) -> Image.Image:
    """
    Crop image to square aspect ratio (center crop)
    
    Args:
        image: PIL Image object
        
    Returns:
        Square cropped PIL Image
    """
    try:
        width, height = image.size
        
        # Find the smaller dimension
        min_dim = min(width, height)
        
        # Calculate crop coordinates (center crop)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        
        # Crop the image
        cropped = image.crop((left, top, right, bottom))
        
        return cropped
        
    except Exception as e:
        logger.error(f"Error cropping image: {str(e)}")
        return image

def normalize_image(image: Image.Image) -> Image.Image:
    """
    Normalize image for better model performance
    
    Args:
        image: PIL Image object
        
    Returns:
        Normalized PIL Image
    """
    try:
        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Normalize to [0, 1] range
        img_array = img_array / 255.0
        
        # Convert back to PIL Image (scale back to [0, 255])
        normalized = Image.fromarray((img_array * 255).astype(np.uint8))
        
        return normalized
        
    except Exception as e:
        logger.warning(f"Error normalizing image: {str(e)}")
        return image 