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
from .mood_analyzer import get_mood_analyzer
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

# Mood analyzer will be initialized lazily when first used

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
    user: Optional[User] = Depends(get_optional_user)
):
    """Analyze an artwork image and predict the mood"""
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
        
        # Get CLIP mood analyzer instance
        analyzer = get_mood_analyzer()
        
        # Analyze the mood using CLIP
        mood, confidence = analyzer.analyze_mood(image_array)
        
        user_id = user.uid if user else "anonymous"
        logger.info(f"User {user_id} - CLIP Analysis - Mood: {mood} with confidence: {confidence:.2f}")
        
        return MoodPrediction(
            mood=mood,
            confidence=confidence,
            analysis_details=analyzer.get_mood_analysis_details(image_array)
        )
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

@app.get("/moods")
async def get_available_moods():
    """Get list of available mood categories"""
    analyzer = get_mood_analyzer()
    available_moods = analyzer.get_available_moods()
    
    return {
        "moods": available_moods,
        "method": "CLIP Semantic Analysis",
        "descriptions": {
            "Happy": "Joyful emotions detected through semantic understanding of visual content",
            "Sad": "Melancholic feelings identified via AI visual-text correlation", 
            "Calm": "Peaceful states recognized through CLIP's multimodal analysis",
            "Angry": "Intense emotions detected using advanced semantic similarity",
            "Anxious": "Nervous energy identified through AI pattern recognition",
            "Excited": "Dynamic enthusiasm detected via multimodal AI analysis"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    from datetime import datetime
    import torch
    
    try:
        analyzer = get_mood_analyzer()
        clip_ready = True
    except Exception as e:
        logger.error(f"CLIP model not ready: {e}")
        clip_ready = False
    
    return {
        "status": "healthy",
        "services": {
            "clip_model": clip_ready,
            "pytorch": True,
            "gpu_acceleration": torch.backends.mps.is_available() or torch.cuda.is_available(),
            "api": True
        },
        "model_info": {
            "type": "OpenAI CLIP ViT-B/32",
            "method": "Cosine Similarity Analysis",
            "device": analyzer.device if clip_ready else "unknown",
            "mps_available": torch.backends.mps.is_available(),
            "cuda_available": torch.cuda.is_available()
        } if clip_ready else {},
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 