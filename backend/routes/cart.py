from fastapi import APIRouter, HTTPException, Depends
from services.redis_config import redis_client
from typing import Dict
from services.firebase_auth import verify_firebase_token
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

security = HTTPBearer()
router = APIRouter()


@router.post("/cart/add")
def add_to_cart(
    laptop_id: int,
    quantity: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    user = auth.verify_id_token(token)

    uid = user["uid"]
    cart_key = f"cart:{uid}"
    redis_client.hincrby(cart_key, laptop_id, quantity)

    return {
        "message": "Item added to cart",
        "laptop_id": laptop_id,
        "quantity": quantity,
    }
