#!/usr/bin/env python3
"""
Script to install backend dependencies
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    print("🎨 Art Therapy Backend - Installing Dependencies")
    print("=" * 50)
    
    # Check if we're in a virtual environment
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Virtual environment detected")
    else:
        print("⚠️  Warning: No virtual environment detected. Consider using one:")
        print("   python -m venv venv")
        print("   source venv/bin/activate  # On Windows: venv\\Scripts\\activate")
        print()
        
        response = input("Continue without virtual environment? (y/N): ")
        if response.lower() != 'y':
            print("👋 Installation cancelled")
            return
    
    # Read requirements
    requirements_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
    
    if not os.path.exists(requirements_file):
        print(f"❌ Requirements file not found: {requirements_file}")
        return
    
    print(f"📦 Installing packages from {requirements_file}...")
    
    try:
        # Install all requirements
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ])
        print("✅ All dependencies installed successfully!")
        
        print("\n🚀 Ready to run the backend!")
        print("Run: python run_dev.py")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        print("\n🔧 Try installing individual packages that failed:")
        print("pip install fastapi uvicorn python-multipart pillow opencv-python numpy scikit-learn")
        
        # Try to install core packages individually
        core_packages = [
            "fastapi",
            "uvicorn", 
            "python-multipart",
            "pillow",
            "numpy",
            "scikit-learn"
        ]
        
        print("\n🔄 Attempting to install core packages individually...")
        for package in core_packages:
            print(f"Installing {package}...", end=" ")
            if install_package(package):
                print("✅")
            else:
                print("❌")

if __name__ == "__main__":
    main() 