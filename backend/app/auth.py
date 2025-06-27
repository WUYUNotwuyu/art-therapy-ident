from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import os
import logging
from .config import get_firebase_credentials

logger = logging.getLogger(__name__)

try:
    import firebase_admin
    from firebase_admin import credentials, auth
    from .models import User
    
    # Initialize Firebase Admin SDK
    if not firebase_admin._apps:
        firebase_creds = get_firebase_credentials()
        
        if firebase_creds:
            # Use service account credentials
            cred = credentials.Certificate(firebase_creds)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized with service account credentials")
        else:
            # Try default credentials as fallback
            try:
                firebase_admin.initialize_app()
                logger.info("Firebase Admin SDK initialized with default credentials")
            except Exception as e:
                logger.error(f"Could not initialize Firebase Admin SDK: {e}")
                raise Exception("Firebase authentication is required for production")
    
    FIREBASE_AVAILABLE = True
    
except ImportError:
    logger.error("Firebase Admin SDK not available - authentication required for production")
    raise ImportError("Firebase Admin SDK is required for production")
except Exception as e:
    logger.error(f"Firebase initialization failed: {e}")
    raise Exception("Firebase authentication setup failed")

security = HTTPBearer(auto_error=True)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Get current user from Firebase token.
    Requires valid authentication token.
    """
    if not credentials:
        raise HTTPException(
            status_code=401, 
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        # Verify the token with Firebase
        decoded_token = auth.verify_id_token(credentials.credentials)
        
        return User(
            uid=decoded_token['uid'],
            email=decoded_token.get('email'),
            name=decoded_token.get('name')
        )
        
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Authentication token expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def require_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Require a valid user to be authenticated.
    """
    return current_user

# Optional user dependency for endpoints that work with or without auth
async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[User]:
    """
    Get current user if token is provided, otherwise return None.
    """
    if not credentials:
        return None
    
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        return User(
            uid=decoded_token['uid'],
            email=decoded_token.get('email'),
            name=decoded_token.get('name')
        )
    except Exception:
        return None 