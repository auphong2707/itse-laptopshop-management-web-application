from fastapi import APIRouter, HTTPException, Depends, status
from services.redis_config import redis_client
from firebase_admin.auth import InvalidIdTokenError
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from schemas.cart import *

security = HTTPBearer()
router = APIRouter(prefix="/cart", tags=["cart"])


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


@router.put("/update")
def update_cart_item(
    item: CartItemUpdate,
    uid: str = Depends(get_current_user_id),
):

    cart_key = f"cart:{uid}"
    laptop_id_str = str(item.laptop_id)

    if not redis_client.hexists(cart_key, laptop_id_str):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Laptop ID {item.laptop_id} not found in cart.",
        )

    if item.new_quantity == 0:
        redis_client.hdel(cart_key, laptop_id_str)
        return {
            "message": "Item removed from cart due to zero quantity",
            "laptop_id": item.laptop_id,
        }
    else:
        redis_client.hset(cart_key, laptop_id_str, item.new_quantity)
        return {
            "message": "Cart item quantity updated successfully",
            "laptop_id": item.laptop_id,
            "new_quantity": item.new_quantity,
        }


@router.delete("/remove/{laptop_id}")
def remove_from_cart(laptop_id: int, uid: str = Depends(get_current_user_id)):
    """
    Remove specific item from cart
    """
    cart_key = f"cart:{uid}"
    laptop_id_str = str(laptop_id)

    deleted_count = redis_client.hdel(cart_key, laptop_id_str)
    if deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Laptop ID {laptop_id} not found in cart.",
        )
    return {
        "message": "Item removed from cart successfully",
        "laptop_id": laptop_id,
    }


@router.delete("/clear")
def clear_cart(uid: str = Depends(get_current_user_id)):
    """
    Clear all items from the cart
    """
    cart_key = f"cart:{uid}"
    redis_client.delete(cart_key)
    return {"message": "Cart cleared successfully"}
