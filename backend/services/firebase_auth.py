from fastapi import status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from typing import Optional
from fastapi import Depends, Request, HTTPException, Header
from firebase_admin import credentials, auth, firestore, initialize_app
from firebase_admin.exceptions import FirebaseError
from firebase_admin.auth import InvalidIdTokenError

security = HTTPBearer()

try:
    cred = credentials.Certificate("secret/firebase-service-key.json")
    initialize_app(cred)
    db_firestore = firestore.client()
except FileNotFoundError:
    print("File not found. Therefore, firebase service is unavailable.")


class ExtendedUserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    phone_number: str
    first_name: str
    last_name: str
    company: Optional[str] = None
    address: Optional[str] = None
    country: str
    zip_code: str
    role: str  # <-- must be here
    secret_key: Optional[str] = None  # <-- optional for customer


def verify_firebase_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No authorization header")
    try:
        id_token = auth_header.split(" ")[1]
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=401, detail=f"Token verification failed: {str(e)}"
        )


def get_current_user(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization.split(" ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except FirebaseError:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token")

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user = auth.verify_id_token(token)
        uid = user.get("uid")
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="UID not found in verified token",
                headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
            )
        return uid
    except InvalidIdTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid ID token: {str(e)}",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )