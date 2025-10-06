#!/usr/bin/env python3
"""
SageCare AI Diagnosis API Startup Script
This script starts the AI Diagnosis API service locally.
"""

import os
import sys
import subprocess
from pathlib import Path

def load_env_file():
    """Load environment variables from .env file if it exists"""
    env_file = Path(".env")
    if env_file.exists():
        print("✓ Found .env file, loading environment variables...")
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value
        print("✓ Environment variables loaded from .env file")
    else:
        print("⚠️  No .env file found. Using default environment variables.")
        print("   Create a .env file from env.template for better configuration.")

def main():
    """Start the AI Diagnosis API service"""
    print("🚀 Starting SageCare AI Diagnosis API...")
    
    # Check if we're in the right directory
    if not Path("app.py").exists():
        print("❌ Error: app.py not found in current directory")
        print("Please run this script from the ai-diagnosis-api directory")
        sys.exit(1)
    
    # Load environment variables from .env file
    load_env_file()
    
    # Check if requirements are installed
    try:
        import flask
        import requests
        print("✓ Dependencies are installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        sys.exit(1)
    
    # Set default environment variables (only if not already set)
    os.environ.setdefault('FLASK_APP', 'app.py')
    os.environ.setdefault('FLASK_ENV', 'development')
    os.environ.setdefault('PORT', '5002')
    os.environ.setdefault('HUGGINGFACE_API_URL', 'https://api-inference.huggingface.co/models/microsoft/biogpt')
    os.environ.setdefault('SAGECARE_API_URL', 'http://localhost:5000/api')
    
    # Check if Hugging Face API key is set
    hf_api_key = os.environ.get('HUGGINGFACE_API_KEY')
    if not hf_api_key or hf_api_key == 'your_huggingface_api_key_here':
        print("⚠️  Note: HUGGINGFACE_API_KEY not set - using mock responses")
        print("   This is fine for testing. For real AI analysis, get a free API key from:")
        print("   https://huggingface.co/settings/tokens")
    else:
        print("✓ Hugging Face API key is configured")
    
    print("✓ Environment variables configured")
    print("✓ Starting Flask development server...")
    print("📡 AI Diagnosis API will be available at: http://localhost:5002")
    print("🔍 Health check: http://localhost:5002/health")
    print("📝 API documentation: http://localhost:5002/docs")
    print("\nPress Ctrl+C to stop the server")
    print("-" * 50)
    
    # Start the Flask application
    try:
        subprocess.run([sys.executable, "-m", "flask", "run", "--host=0.0.0.0", "--port=5002"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 