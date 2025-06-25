from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import os
import logging

try:
    import firebase_admin
    from firebase_admin import credentials, auth
    from .models import User
    
    # Initialize Firebase Admin SDK
    if not firebase_admin._apps:
        # In production, use a service account key file
        # For development, you can use the default credentials
        try:
            # Try to initialize with default credentials
            firebase_admin.initialize_app()
            logger = logging.getLogger(__name__)
            logger.info("Firebase Admin SDK initialized with default credentials")
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not initialize Firebase Admin SDK: {e}")
            firebase_admin = None
    
    FIREBASE_AVAILABLE = True
    
except ImportError:
    logger = logging.getLogger(__name__)
    logger.warning("Firebase Admin SDK not available")
    FIREBASE_AVAILABLE = False
    firebase_admin = None

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """
    Get current user from Firebase token.
    Returns None if no token provided or Firebase not available (for development).
    """
    if not credentials or not FIREBASE_AVAILABLE:
        # Return None for development mode without Firebase
        return None
    
    try:
        # Verify the token with Firebase
        decoded_token = auth.verify_id_token(credentials.credentials)
        
        return User(
            uid=decoded_token['uid'],
            email=decoded_token.get('email'),
            name=decoded_token.get('name')
        )
        
    except Exception as e:
        # For development, we'll be lenient with auth errors
        logger = logging.getLogger(__name__)
        logger.warning(f"Authentication error (development mode): {e}")
        return None

async def require_user(current_user: Optional[User] = Depends(get_current_user)) -> User:
    """
    Require a valid user to be authenticated.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user 