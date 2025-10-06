#!/usr/bin/env python3
"""
Helper script to set up the .env file for the AI Diagnosis API
"""

import os
import shutil
from pathlib import Path

def setup_env_file():
    """Set up the .env file from template"""
    template_file = Path("env.template")
    env_file = Path(".env")
    
    if not template_file.exists():
        print("❌ Error: env.template file not found")
        print("Please ensure env.template exists in the current directory")
        return False
    
    if env_file.exists():
        print("⚠️  .env file already exists")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("Setup cancelled")
            return False
    
    try:
        # Copy template to .env
        shutil.copy2(template_file, env_file)
        print("✓ Created .env file from template")
        print("\n📝 Next steps:")
        print("1. Edit the .env file and replace 'your_grok_api_key_here' with your actual API key")
        print("2. Get your API key from: https://console.x.ai/")
        print("3. Run: python startdiagnosis.py")
        return True
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        return False

def main():
    """Main setup function"""
    print("🔧 Setting up .env file for SageCare AI Diagnosis API")
    print("-" * 50)
    
    # Check if we're in the right directory
    if not Path("app.py").exists():
        print("❌ Error: app.py not found in current directory")
        print("Please run this script from the ai-diagnosis-api directory")
        return
    
    success = setup_env_file()
    
    if success:
        print("\n✅ Setup completed successfully!")
        print("Edit the .env file with your actual API key and run the startup script.")
    else:
        print("\n❌ Setup failed. Please try again.")

if __name__ == "__main__":
    main() 