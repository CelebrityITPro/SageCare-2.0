from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import requests
import json
import time
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file if it exists
env_file = Path(".env")
if env_file.exists():
    load_dotenv(env_file)
else:
    load_dotenv()  # Try to load from default location

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
HUGGINGFACE_API_URL = os.getenv("HUGGINGFACE_API_URL", "https://api-inference.huggingface.co/models/HuggingFaceTB/SmolLM3-3B")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")  # Optional for some models
SAGECARE_API_URL = os.getenv("SAGECARE_API_URL", "http://sagecare-api:5000/api")

class BioGPTMedicalService:
    def __init__(self):
        self.api_url = HUGGINGFACE_API_URL
        self.api_key = HUGGINGFACE_API_KEY
    
    def _build_medical_prompt(self, symptoms: str, patient_info: dict) -> str:
        """Build a structured medical prompt for symptom analysis"""
        
        age = patient_info.get('age', 'Not specified')
        gender = patient_info.get('gender', 'Not specified')
        medical_history = patient_info.get('medical_history', 'None')
        current_medications = patient_info.get('current_medications', [])
        allergies = patient_info.get('allergies', [])
        
        medications_text = ", ".join(current_medications) if current_medications else "None"
        allergies_text = ", ".join(allergies) if allergies else "None"
        
        prompt = f"""
Patient Information:
- Age: {age}
- Gender: {gender}
- Medical History: {medical_history}
- Current Medications: {medications_text}
- Allergies: {allergies_text}

Symptoms: {symptoms}

Based on the above patient information and symptoms, provide a medical analysis in the following JSON format:

{{
  "diagnosis": {{
    "preliminary_diagnosis": "Brief description of possible condition",
    "confidence": 0.85,
    "possible_conditions": ["condition1", "condition2", "condition3"],
    "urgency_level": "low|medium|high|emergency",
    "disclaimer": "This is a preliminary AI analysis and should not replace professional medical advice"
  }},
  "recommendations": {{
    "primary_specialty": "cardiology|dermatology|neurology|pediatrics|internal_medicine|orthopedics|psychiatry|gastroenterology|endocrinology|other",
    "secondary_specialties": ["specialty1", "specialty2"],
    "immediate_actions": ["action1", "action2"],
    "general_advice": "General advice for the patient",
    "follow_up_timeline": "within 24 hours|within a week|within a month|as needed"
  }},
                       "analysis_metadata": {{
      "model_used": "HuggingFaceTB/SmolLM3-3B",
      "processing_time": 0,
      "confidence_factors": ["factor1", "factor2"]
    }}
}}

Important: Be conservative in assessment, always recommend professional medical advice for serious symptoms, consider patient demographics, provide clear actionable advice, use standard medical terminology, and respond ONLY with valid JSON.
"""

        return prompt.strip()
    
    def _call_huggingface_api(self, symptoms: str, patient_info: dict) -> dict:
        """Call Hugging Face BioGPT API for symptom analysis"""
        try:
            # Build the medical prompt
            prompt = self._build_medical_prompt(symptoms, patient_info)
            
            # Prepare headers for Hugging Face API
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Prepare the request payload
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 512,
                    "temperature": 0.7,
                    "do_sample": True,
                    "return_full_text": False
                }
            }
            
            # Make the API call
            logger.info(f"Calling Hugging Face API: {self.api_url}")
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                # Parse the response
                response_data = response.json()
                generated_text = response_data[0].get('generated_text', '')
                
                # Parse the medical response
                result = self._parse_medical_response(generated_text)
                return result
            else:
                logger.error(f"Hugging Face API error: {response.status_code} - {response.text}")
                raise Exception(f"API call failed with status {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error calling Hugging Face API: {str(e)}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"Error calling Hugging Face API: {str(e)}")
            raise Exception(f"API error: {str(e)}")
    
    def _get_mock_response(self, symptoms: str, patient_info: dict) -> dict:
        """Generate a realistic mock response for testing when API is not available"""
        
        # Simple keyword-based diagnosis logic
        symptoms_lower = symptoms.lower()
        
        # Determine diagnosis based on symptoms
        if any(word in symptoms_lower for word in ['chest pain', 'heart', 'cardiac']):
            diagnosis = {
                "preliminary_diagnosis": "Possible angina or musculoskeletal chest pain",
                "confidence": 0.75,
                "possible_conditions": ["angina", "musculoskeletal pain", "anxiety"],
                "urgency_level": "high",
                "disclaimer": "This is a preliminary AI analysis and should not replace professional medical advice. Chest pain requires immediate medical evaluation."
            }
            recommendations = {
                "primary_specialty": "cardiology",
                "secondary_specialties": ["internal_medicine", "emergency_medicine"],
                "immediate_actions": ["Seek immediate medical attention", "Call emergency services if pain is severe"],
                "general_advice": "Chest pain should be evaluated by a healthcare professional immediately. Do not delay seeking medical care.",
                "follow_up_timeline": "immediately"
            }
        elif any(word in symptoms_lower for word in ['headache', 'head pain', 'migraine']):
            diagnosis = {
                "preliminary_diagnosis": "Tension headache or migraine",
                "confidence": 0.80,
                "possible_conditions": ["tension headache", "migraine", "sinus headache"],
                "urgency_level": "medium",
                "disclaimer": "This is a preliminary AI analysis and should not replace professional medical advice."
            }
            recommendations = {
                "primary_specialty": "neurology",
                "secondary_specialties": ["internal_medicine"],
                "immediate_actions": ["Rest in a quiet, dark room", "Stay hydrated"],
                "general_advice": "Consider over-the-counter pain relievers and rest. If headaches are severe or frequent, consult a neurologist.",
                "follow_up_timeline": "within a week"
            }
        elif any(word in symptoms_lower for word in ['fever', 'temperature', 'hot']):
            diagnosis = {
                "preliminary_diagnosis": "Viral infection or fever of unknown origin",
                "confidence": 0.70,
                "possible_conditions": ["viral infection", "bacterial infection", "inflammatory condition"],
                "urgency_level": "medium",
                "disclaimer": "This is a preliminary AI analysis and should not replace professional medical advice."
            }
            recommendations = {
                "primary_specialty": "internal_medicine",
                "secondary_specialties": ["infectious_disease"],
                "immediate_actions": ["Monitor temperature", "Stay hydrated", "Rest"],
                "general_advice": "Monitor your fever and symptoms. If fever is high (>103°F) or persistent, seek medical attention.",
                "follow_up_timeline": "within 24 hours"
            }
        elif any(word in symptoms_lower for word in ['stomach', 'abdominal', 'nausea', 'vomiting']):
            diagnosis = {
                "preliminary_diagnosis": "Gastroenteritis or digestive upset",
                "confidence": 0.75,
                "possible_conditions": ["gastroenteritis", "food poisoning", "irritable bowel syndrome"],
                "urgency_level": "medium",
                "disclaimer": "This is a preliminary AI analysis and should not replace professional medical advice."
            }
            recommendations = {
                "primary_specialty": "gastroenterology",
                "secondary_specialties": ["internal_medicine"],
                "immediate_actions": ["Stay hydrated", "Avoid solid foods initially", "Rest"],
                "general_advice": "Follow a bland diet and stay hydrated. If symptoms are severe or persistent, consult a gastroenterologist.",
                "follow_up_timeline": "within 48 hours"
            }
        else:
            # Default response for other symptoms
            diagnosis = {
                "preliminary_diagnosis": "General symptoms requiring medical evaluation",
                "confidence": 0.60,
                "possible_conditions": ["various conditions", "need for medical evaluation"],
                "urgency_level": "medium",
                "disclaimer": "This is a preliminary AI analysis and should not replace professional medical advice."
            }
            recommendations = {
                "primary_specialty": "internal_medicine",
                "secondary_specialties": ["general_practice"],
                "immediate_actions": ["Monitor symptoms", "Seek medical advice"],
                "general_advice": "Please consult with a healthcare professional for proper evaluation and diagnosis.",
                "follow_up_timeline": "within a week"
            }
        
        return {
            "diagnosis": diagnosis,
            "recommendations": recommendations,
                         "analysis_metadata": {
                 "model_used": "HuggingFaceTB/SmolLM3-3B",
                 "processing_time": 0.5,
                 "confidence_factors": ["symptom_analysis", "patient_history"]
             }
        }
    
    def _parse_medical_response(self, response_text: str) -> dict:
        """Parse the LLM response and extract structured data"""
        try:
            # Try to extract JSON from the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in response")
            
            json_str = response_text[start_idx:end_idx]
            parsed_response = json.loads(json_str)
            
            # Validate required fields
            required_fields = ['diagnosis', 'recommendations']
            for field in required_fields:
                if field not in parsed_response:
                    raise ValueError(f"Missing required field: {field}")
            
            return parsed_response
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"Raw response: {response_text}")
            
            # Return a fallback response
            return {
                "diagnosis": {
                    "preliminary_diagnosis": "Unable to provide specific diagnosis",
                    "confidence": 0.0,
                    "possible_conditions": [],
                    "urgency_level": "medium",
                    "disclaimer": "AI analysis failed. Please consult a healthcare professional."
                },
                "recommendations": {
                    "primary_specialty": "internal_medicine",
                    "secondary_specialties": [],
                    "immediate_actions": ["Consult a healthcare professional"],
                    "general_advice": "Please seek professional medical advice for proper diagnosis.",
                    "follow_up_timeline": "as soon as possible"
                },
                                 "analysis_metadata": {
                     "model_used": "HuggingFaceTB/SmolLM3-3B",
                     "processing_time": 0,
                     "confidence_factors": ["parsing_error"]
                 }
            }
    
    def analyze_symptoms(self, symptoms: str, patient_info: dict) -> dict:
        """Analyze symptoms using BioGPT API or fallback to mock"""
        start_time = time.time()
        
        try:
            # Check if Hugging Face API is configured
            if not self.api_key:
                logger.warning("Hugging Face API key not configured, using mock response")
                result = self._get_mock_response(symptoms, patient_info)
            else:
                # Use real Hugging Face API
                logger.info("Using Hugging Face BioGPT API for symptom analysis")
                result = self._call_huggingface_api(symptoms, patient_info)
            
            # Add processing time
            processing_time = time.time() - start_time
            result["analysis_metadata"]["processing_time"] = processing_time
            
            logger.info(f"Symptom analysis completed in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Error in symptom analysis: {str(e)}")
            # Fallback to mock response on error
            logger.info("Falling back to mock response due to API error")
            result = self._get_mock_response(symptoms, patient_info)
            processing_time = time.time() - start_time
            result["analysis_metadata"]["processing_time"] = processing_time
            return result

# Initialize the medical service
medical_service = BioGPTMedicalService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check if Hugging Face API is configured
        hf_configured = bool(HUGGINGFACE_API_KEY)
        
        return jsonify({
            'status': 'healthy' if hf_configured else 'degraded',
            'huggingface_configured': hf_configured,
            'model': 'HuggingFaceTB/SmolLM3-3B',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'huggingface_configured': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 503

@app.route('/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    """Analyze symptoms and provide diagnosis recommendations"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        symptoms = data.get('symptoms')
        if not symptoms:
            return jsonify({"error": "Symptoms are required"}), 400
        
        patient_info = data.get('patient_info', {})
        
        # Validate patient info
        if not isinstance(patient_info, dict):
            return jsonify({"error": "patient_info must be an object"}), 400
        
        # Analyze symptoms
        result = medical_service.analyze_symptoms(symptoms, patient_info)
        
        return jsonify({
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_symptoms: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/available-specialties', methods=['GET'])
def get_available_specialties():
    """Get list of available medical specialties"""
    specialties = [
        "cardiology",
        "dermatology", 
        "neurology",
        "pediatrics",
        "internal_medicine",
        "orthopedics",
        "psychiatry",
        "gastroenterology",
        "endocrinology",
        "ophthalmology",
        "otolaryngology",
        "urology",
        "gynecology",
        "emergency_medicine",
        "radiology",
        "pathology"
    ]
    
    return jsonify({
        "success": True,
        "specialties": specialties
    })

@app.route('/models', methods=['GET'])
def get_available_models():
    """Get available models"""
    try:
        return jsonify({
            "success": True,
            "models": ["HuggingFaceTB/SmolLM3-3B"],
            "current_model": "HuggingFaceTB/SmolLM3-3B"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 503

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True) 