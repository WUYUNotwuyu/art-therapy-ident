from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from enum import Enum

class MoodType(str, Enum):
    HAPPY = "Happy"
    SAD = "Sad"
    CALM = "Calm"
    ANGRY = "Angry"

class PingResponse(BaseModel):
    message: str
    status: str
    version: str

class MoodPrediction(BaseModel):
    mood: MoodType
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    analysis_details: Optional[Dict[str, Any]] = None

class User(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None

class MoodHistoryEntry(BaseModel):
    id: Optional[str] = None
    user_id: str
    mood: MoodType
    confidence: float
    timestamp: str
    image_url: Optional[str] = None
    analysis_details: Optional[Dict[str, Any]] = None 