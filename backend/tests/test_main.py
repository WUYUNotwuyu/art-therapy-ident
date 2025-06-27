import pytest
from fastapi.testclient import TestClient
from PIL import Image
import io
import numpy as np

from app.main import app

client = TestClient(app)

def create_test_image():
    """Create a simple test image"""
    # Create a 100x100 RGB image with some colors
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    img[20:80, 20:80] = [255, 100, 100]  # Red square
    img[40:60, 40:60] = [100, 255, 100]  # Green square
    
    pil_img = Image.fromarray(img)
    img_byte_arr = io.BytesIO()
    pil_img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr

def test_ping():
    """Test the ping endpoint"""
    response = client.get("/ping")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "message" in data
    assert "version" in data

def test_health():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data
    assert "timestamp" in data

def test_get_moods():
    """Test the moods endpoint"""
    response = client.get("/moods")
    assert response.status_code == 200
    data = response.json()
    assert "moods" in data
    assert "descriptions" in data
    assert len(data["moods"]) == 6
    assert "Happy" in data["moods"]
    assert "Sad" in data["moods"]
    assert "Calm" in data["moods"]
    assert "Angry" in data["moods"]
    assert "Anxious" in data["moods"]
    assert "Excited" in data["moods"]

def test_predict_mood():
    """Test mood prediction with a test image"""
    test_image = create_test_image()
    
    response = client.post(
        "/predict",
        files={"image": ("test.png", test_image, "image/png")}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Check response structure
    assert "mood" in data
    assert "confidence" in data
    assert "analysis_details" in data
    
    # Check mood is valid
    assert data["mood"] in ["Happy", "Sad", "Calm", "Angry", "Anxious", "Excited"]
    
    # Check confidence is valid
    assert 0.0 <= data["confidence"] <= 1.0
    
    # Check analysis details structure
    details = data["analysis_details"]
    assert "method" in details

def test_predict_mood_invalid_file():
    """Test mood prediction with invalid file type"""
    # Create a text file instead of image
    text_content = b"This is not an image"
    
    response = client.post(
        "/predict",
        files={"image": ("test.txt", io.BytesIO(text_content), "text/plain")}
    )
    
    assert response.status_code == 400
    assert "File must be an image" in response.json()["detail"]

def test_predict_mood_no_file():
    """Test mood prediction without uploading a file"""
    response = client.post("/predict")
    assert response.status_code == 422  # Validation error

def test_api_docs():
    """Test that API documentation is accessible"""
    response = client.get("/docs")
    assert response.status_code == 200
    
    response = client.get("/openapi.json")
    assert response.status_code == 200 