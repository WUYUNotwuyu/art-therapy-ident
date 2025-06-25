import os
from typing import List
from pydantic import BaseSettings

class Settings(BaseSettings):
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # CORS Configuration
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Firebase Configuration
    firebase_project_id: str = ""
    firebase_private_key_id: str = ""
    firebase_private_key: str = ""
    firebase_client_email: str = ""
    firebase_client_id: str = ""
    firebase_auth_uri: str = "https://accounts.google.com/o/oauth2/auth"
    firebase_token_uri: str = "https://oauth2.googleapis.com/token"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create global settings instance
settings = Settings()

def get_firebase_credentials():
    """Get Firebase credentials dictionary"""
    if not settings.firebase_project_id:
        return None
        
    return {
        "type": "service_account",
        "project_id": settings.firebase_project_id,
        "private_key_id": settings.firebase_private_key_id,
        "private_key": settings.firebase_private_key.replace('\\n', '\n'),
        "client_email": settings.firebase_client_email,
        "client_id": settings.firebase_client_id,
        "auth_uri": settings.firebase_auth_uri,
        "token_uri": settings.firebase_token_uri,
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{settings.firebase_client_email}"
    } 