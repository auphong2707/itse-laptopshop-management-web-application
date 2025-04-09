from fastapi import APIRouter, HTTPException, Depends, status
from services.redis_config import redis_client
from typing import Dict
from services.firebase_auth import verify_firebase_token
from firebase_admin.auth import InvalidIdTokenError
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from schemas.cart import *

security = HTTPBearer()
router = APIRouter(prefix="/cart", tags=["cart"])


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Verifies the Firebase token from the Authorization header and returns the user ID (UID).
    Raises HTTPException 401 if verification fails.
    """
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


@router.post("/add")
def add_to_cart(item: CartItemAdd, uid: str = Depends(get_current_user_id)):
    cart_key = f"cart:{uid}"
    redis_client.hincrby(cart_key, str(item.laptop_id), item.quantity)
    current_quantity = redis_client.hget(cart_key, str(item.laptop_id))
    return {
        "message": "Item added to cart successfully",
        "laptop_id": item.laptop_id,
        "new_quantity": int(current_quantity) if current_quantity else item.quantity,
    }


@router.get("/view")
def view_cart(uid: str = Depends(get_current_user_id)):
    cart_key = f"cart:{uid}"
    cart_items_raw = redis_client.hgetall(cart_key)
    cart_items = {int(k): int(v) for k, v in cart_items_raw.items()}
    return cart_items
