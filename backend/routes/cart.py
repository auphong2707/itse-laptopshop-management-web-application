from fastapi import APIRouter, HTTPException, Depends, status
from services.redis_config import redis_client
from fastapi.security import HTTPBearer

from schemas.cart import *
from services.auth import get_current_user_id

security = HTTPBearer()
cart_router = APIRouter(prefix="/cart", tags=["cart"])


@cart_router.post("/add")
def add_to_cart(item: CartItemAdd, uid: int = Depends(get_current_user_id)):
    cart_key = f"cart:{uid}"
    redis_client.hincrby(cart_key, str(item.laptop_id), item.quantity)
    current_quantity = redis_client.hget(cart_key, str(item.laptop_id))
    return {
        "message": "Item added to cart successfully",
        "laptop_id": item.laptop_id,
        "new_quantity": int(current_quantity) if current_quantity else item.quantity,
    }


@cart_router.get("/view")
def view_cart(uid: int = Depends(get_current_user_id)):
    cart_key = f"cart:{uid}"
    cart_items_raw = redis_client.hgetall(cart_key)
    cart_items = {int(k): int(v) for k, v in cart_items_raw.items()}
    return cart_items


@cart_router.put("/update")
def update_cart_item(
    item: CartItemUpdate,
    uid: int = Depends(get_current_user_id),
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


@cart_router.delete("/remove/{laptop_id}")
def remove_from_cart(laptop_id: int, uid: int = Depends(get_current_user_id)):
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


@cart_router.delete("/clear")
def clear_cart(uid: int = Depends(get_current_user_id)):
    """
    Clear all items from the cart
    """
    cart_key = f"cart:{uid}"
    redis_client.delete(cart_key)
    return {"message": "Cart cleared successfully"}
