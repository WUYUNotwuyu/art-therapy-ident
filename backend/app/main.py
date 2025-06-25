from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from PIL import Image
import io
import logging
from typing import Optional
import random

from .models import MoodPrediction, PingResponse
from .mood_analyzer import MoodAnalyzer
from .auth import get_current_user, require_user, get_optional_user, User

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Art Therapy Mood Analyzer API",
    description="An AI-powered API that analyzes artwork to predict emotional states",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize mood analyzer
mood_analyzer = MoodAnalyzer()

@app.get("/ping", response_model=PingResponse)
async def ping():
    """Health check endpoint"""
    return PingResponse(
        message="Art Therapy API is running!",
        status="healthy",
        version="1.0.0"
    )

@app.post("/predict", response_model=MoodPrediction)
async def predict_mood(
    image: UploadFile = File(...),
    user: User = Depends(require_user)
):
    """
    Analyze an artwork image and predict the mood
    """
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process the image
        contents = await image.read()
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Convert to numpy array for analysis
        image_array = np.array(pil_image)
        
        # Analyze the mood
        mood, confidence = mood_analyzer.analyze_mood(image_array)
        
        logger.info(f"User {user.uid} - Predicted mood: {mood} with confidence: {confidence}")
        
        return MoodPrediction(
            mood=mood,
            confidence=confidence,
            analysis_details={
                "color_dominance": mood_analyzer.get_color_analysis(image_array),
                "stroke_complexity": mood_analyzer.get_stroke_analysis(image_array),
                "composition": mood_analyzer.get_composition_analysis(image_array)
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

@app.get("/moods")
async def get_available_moods():
    """Get list of available mood categories"""
    return {
        "moods": ["Happy", "Sad", "Calm", "Angry"],
        "descriptions": {
            "Happy": "Positive, joyful emotions expressed through bright colors and energetic strokes",
            "Sad": "Melancholic feelings shown through cooler tones and slower movements", 
            "Calm": "Peaceful, serene state reflected in balanced composition and gentle colors",
            "Angry": "Intense emotions displayed through aggressive strokes and bold colors"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    from datetime import datetime
    return {
        "status": "healthy",
        "services": {
            "mood_analyzer": mood_analyzer.is_ready(),
            "api": True
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 