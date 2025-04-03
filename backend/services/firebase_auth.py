from pydantic import BaseModel, EmailStr
from typing import Optional
from fastapi import Request, HTTPException, Header
from firebase_admin import credentials, auth, firestore, initialize_app
from firebase_admin.exceptions import FirebaseError


try :
    cred = credentials.Certificate("secret/firebase-service-key.json")
    initialize_app(cred)
    db = firestore.client()
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
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

def get_current_user(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization.split(" ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except FirebaseError:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token")