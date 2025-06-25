#!/usr/bin/env python3
"""
Development script to run the FastAPI backend locally
"""

import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🎨 Starting Art Therapy Backend Development Server...")
    print("📍 API will be available at: http://localhost:8000")
    print("📚 Interactive docs at: http://localhost:8000/docs")
    print("🔄 Auto-reload enabled for development")
    print("-" * 50)
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 Backend server stopped!")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1) 