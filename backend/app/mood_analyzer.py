import numpy as np
import cv2
from PIL import Image
import torch
import clip
from typing import Tuple, Dict, List
import logging
from io import BytesIO

logger = logging.getLogger(__name__)

class CLIPMoodAnalyzer:
    """
    CLIP-based mood analyzer that uses cosine similarity between image and text embeddings
    to classify the sentiment/mood of artwork.
    """
    
    def __init__(self):
        # Prioritize MPS (Metal Performance Shaders) for Apple Silicon, then CUDA, then CPU
        if torch.backends.mps.is_available():
            self.device = "mps"
            logger.info("Using Apple Silicon GPU (MPS) for CLIP inference")
        elif torch.cuda.is_available():
            self.device = "cuda"
            logger.info("Using NVIDIA GPU (CUDA) for CLIP inference")
        else:
            self.device = "cpu"
            logger.info("Using CPU for CLIP inference")
        
        logger.info(f"Initializing CLIP model on device: {self.device}")
        
        # Load CLIP model
        try:
            self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)
            logger.info("CLIP model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load CLIP model: {e}")
            raise
        
        # Define mood categories with detailed descriptions
        self.mood_descriptions = {
            "Happy": [
                "a joyful and cheerful artwork",
                "bright and vibrant colors expressing happiness",
                "optimistic and uplifting art",
                "artwork showing joy and contentment",
                "colorful and energetic drawing expressing happiness"
            ],
            "Sad": [
                "a melancholic and sorrowful artwork",
                "dark and muted colors expressing sadness",
                "artwork showing grief and sorrow",
                "depressing and gloomy art",
                "artwork expressing loneliness and sadness"
            ],
            "Calm": [
                "a peaceful and tranquil artwork",
                "serene and balanced composition",
                "artwork showing relaxation and peace",
                "meditative and calming art",
                "harmonious and gentle artwork"
            ],
            "Angry": [
                "an aggressive and intense artwork",
                "chaotic and turbulent composition",
                "artwork showing anger and frustration",
                "violent and aggressive art",
                "artwork with sharp and harsh elements expressing rage"
            ],
            "Anxious": [
                "a nervous and worried artwork",
                "chaotic and scattered composition",
                "artwork showing stress and anxiety",
                "tense and uncomfortable art",
                "artwork expressing fear and nervousness"
            ],
            "Excited": [
                "an energetic and dynamic artwork",
                "bold and vibrant composition",
                "artwork showing enthusiasm and energy",
                "dynamic and lively art",
                "artwork expressing excitement and vigor"
            ]
        }
        
        # Precompute text embeddings for efficiency
        self._precompute_text_embeddings()
    
    def _precompute_text_embeddings(self):
        """Precompute embeddings for all mood descriptions"""
        self.mood_embeddings = {}
        
        with torch.no_grad():
            for mood, descriptions in self.mood_descriptions.items():
                # Tokenize all descriptions for this mood
                text_tokens = clip.tokenize(descriptions).to(self.device)
                
                # Get embeddings for all descriptions
                text_embeddings = self.model.encode_text(text_tokens)
                text_embeddings = text_embeddings / text_embeddings.norm(dim=-1, keepdim=True)
                
                # Average the embeddings for this mood
                avg_embedding = text_embeddings.mean(dim=0)
                avg_embedding = avg_embedding / avg_embedding.norm()
                
                self.mood_embeddings[mood] = avg_embedding
        
        logger.info(f"Precomputed embeddings for {len(self.mood_embeddings)} moods")
    
    def _prepare_image(self, image_array: np.ndarray) -> torch.Tensor:
        """
        Convert numpy image array to PIL Image and preprocess for CLIP
        """
        try:
            # Convert BGR to RGB if needed
            if len(image_array.shape) == 3 and image_array.shape[2] == 3:
                image_array = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
            
            # Convert to PIL Image
            if image_array.dtype != np.uint8:
                image_array = (image_array * 255).astype(np.uint8)
            
            pil_image = Image.fromarray(image_array)
            
            # Preprocess for CLIP
            image_tensor = self.preprocess(pil_image).unsqueeze(0).to(self.device)
            
            return image_tensor
            
        except Exception as e:
            logger.error(f"Error preparing image: {e}")
            raise
    
    def _calculate_cosine_similarities(self, image_embedding: torch.Tensor) -> Dict[str, float]:
        """
        Calculate cosine similarity between image embedding and each mood embedding
        """
        similarities = {}
        
        for mood, mood_embedding in self.mood_embeddings.items():
            # Calculate cosine similarity
            similarity = torch.cosine_similarity(
                image_embedding.squeeze(), 
                mood_embedding, 
                dim=0
            ).item()
            
            similarities[mood] = max(0.0, similarity)  # Ensure non-negative
        
        return similarities
    
    def analyze_mood(self, image_array: np.ndarray) -> Tuple[str, float]:
        """
        Analyze mood using CLIP embeddings and cosine similarity
        
        Args:
            image_array: Input image as numpy array
            
        Returns:
            Tuple of (predicted_mood, confidence_score)
        """
        try:
            # Prepare image for CLIP
            image_tensor = self._prepare_image(image_array)
            
            # Get image embedding
            with torch.no_grad():
                image_embedding = self.model.encode_image(image_tensor)
                image_embedding = image_embedding / image_embedding.norm(dim=-1, keepdim=True)
            
            # Calculate similarities with all moods
            similarities = self._calculate_cosine_similarities(image_embedding)
            
            # Find the mood with highest similarity
            predicted_mood = max(similarities.keys(), key=lambda k: similarities[k])
            confidence = similarities[predicted_mood]
            
            # Convert similarity to confidence percentage
            # CLIP similarities are typically in range [0, 1], so we can use them directly
            confidence_percentage = min(confidence * 100, 100.0)
            
            logger.info(f"CLIP Analysis - Mood: {predicted_mood}, Confidence: {confidence_percentage:.2f}%")
            logger.debug(f"All similarities: {similarities}")
            
            return predicted_mood, confidence_percentage / 100.0
            
        except Exception as e:
            logger.error(f"Error in CLIP mood analysis: {e}")
            # Fallback to a default mood
            return "Calm", 0.5
    
    def get_mood_analysis_details(self, image_array: np.ndarray) -> Dict:
        """
        Get detailed analysis including similarities for all moods
        """
        try:
            image_tensor = self._prepare_image(image_array)
            
            with torch.no_grad():
                image_embedding = self.model.encode_image(image_tensor)
                image_embedding = image_embedding / image_embedding.norm(dim=-1, keepdim=True)
            
            similarities = self._calculate_cosine_similarities(image_embedding)
            
            # Sort by similarity score
            sorted_moods = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
            
            return {
                "method": "CLIP_cosine_similarity",
                "model": "ViT-B/32",
                "device": self.device,
                "all_scores": similarities,
                "ranked_moods": sorted_moods,
                "top_prediction": sorted_moods[0][0] if sorted_moods else "Calm"
            }
            
        except Exception as e:
            logger.error(f"Error getting analysis details: {e}")
            return {
                "method": "CLIP_cosine_similarity",
                "model": "ViT-B/32",
                "device": self.device,
                "error": str(e),
                "fallback": True
            }
    
    def get_available_moods(self) -> List[str]:
        """Return list of available mood categories"""
        return list(self.mood_descriptions.keys())


# Global instance
mood_analyzer = None

def get_mood_analyzer() -> CLIPMoodAnalyzer:
    """Get global mood analyzer instance (singleton pattern)"""
    global mood_analyzer
    if mood_analyzer is None:
        mood_analyzer = CLIPMoodAnalyzer()
    return mood_analyzer

# Legacy compatibility functions
def analyze_mood(image_array: np.ndarray) -> Tuple[str, float]:
    """Legacy function for backward compatibility"""
    analyzer = get_mood_analyzer()
    return analyzer.analyze_mood(image_array)

def get_color_analysis(image_array: np.ndarray) -> Dict:
    """Legacy function - now returns CLIP analysis"""
    analyzer = get_mood_analyzer()
    details = analyzer.get_mood_analysis_details(image_array)
    return {
        "method": "CLIP_color_semantic",
        "color_mood_correlation": details.get("all_scores", {}),
        "primary_color_influence": "semantic_understanding"
    }

def get_stroke_analysis(image_array: np.ndarray) -> Dict:
    """Legacy function - now returns CLIP confidence metrics"""
    analyzer = get_mood_analyzer()
    details = analyzer.get_mood_analysis_details(image_array)
    return {
        "method": "CLIP_stroke_semantic", 
        "stroke_mood_correlation": details.get("all_scores", {}),
        "stroke_pattern_influence": "semantic_understanding"
    }

def get_composition_analysis(image_array: np.ndarray) -> Dict:
    """Legacy function - now returns CLIP ranking"""
    analyzer = get_mood_analyzer()
    details = analyzer.get_mood_analysis_details(image_array)
    return {
        "method": "CLIP_ranking",
        "mood_ranking": details.get("ranked_moods", []),
        "model": "ViT-B/32"
    } 