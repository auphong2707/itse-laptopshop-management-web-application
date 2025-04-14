from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from firebase_admin import auth, firestore
from firebase_admin.auth import InvalidIdTokenError
from decimal import Decimal, InvalidOperation
from typing import List, Dict  #

from db.models import Laptop, Order, OrderItem
from db.session import get_db
from schemas.orders import (
    OrderResponse,
    OrderItemBase,
    UpdateStatus,
)

from routes.cart import get_current_user_id

from services.redis_config import redis_client

# --- Initialize Firestore Client ---
try:
    from services.firebase_auth import db_firestore
except ImportError:
    print(
        "Warning: Firestore client (db_firestore) not found in services.firebase_auth. User profile fetch will fail."
    )
    db_firestore = None
except Exception as e:
    print(f"Warning: Firestore client could not be initialized. Error: {e}")
    db_firestore = None

# --- Create Router ---
router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("")
def create_order_from_cart(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Creates a new order from the user's cart.
    """
    cart_key = f"cart:{user_id}"
    cart_items_raw = redis_client.hgetall(cart_key)

    if not cart_items_raw:
        raise HTTPException(status_code=400, detail="Cart is empty.")

    # --- 1. Fetch User Profile from Firestore ---
    user_profile_data = {}
    if db_firestore:
        try:
            user_profile_ref = db_firestore.collection("users").document(user_id)
            user_profile_doc = user_profile_ref.get()
            if user_profile_doc.exists:
                user_profile_data = user_profile_doc.to_dict()
            else:
                print(f"User profile not found in Firestore for UID: {user_id}")
        except Exception as e:
            print(f"Error fetching user profile from Firestore: {e}")

    # --- 2. Process Cart Items & Validate Stock (keep as before) ---
    order_total_price = Decimal("0.00")
    items_to_create = []
    laptops_to_update = {}
    try:
        cart_items = {}
        product_ids = []
        for p_id_str, qty_str in cart_items_raw.items():
            try:
                p_id = int(p_id_str)
                qty = int(qty_str)
                if qty <= 0:
                    continue
                cart_items[p_id] = qty
                product_ids.append(p_id)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid cart item: ID {p_id_str} or Qty {qty_str}",
                )
        if not product_ids:
            raise HTTPException(status_code=400, detail="Cart has no valid items.")

        stmt = select(Laptop).where(Laptop.id.in_(product_ids))
        laptops_in_db = db.scalars(stmt).all()
        laptops_map = {laptop.id: laptop for laptop in laptops_in_db}

        for product_id, requested_quantity in cart_items.items():
            laptop = laptops_map.get(product_id)
            if not laptop:
                raise HTTPException(
                    status_code=404, detail=f"Product ID {product_id} not found."
                )
            if laptop.quantity < requested_quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {laptop.name} (ID: {product_id}).",
                )
            try:
                sale_price = (
                    Decimal(laptop.sale_price) / Decimal("100")
                    if isinstance(laptop.sale_price, int)
                    else Decimal(laptop.sale_price)
                )
            except (TypeError, ValueError, InvalidOperation):
                raise HTTPException(
                    status_code=500,
                    detail=f"Invalid sale price for product ID {product_id}",
                )

            item_subtotal = sale_price * Decimal(requested_quantity)
            order_total_price += item_subtotal
            items_to_create.append(
                {
                    "product_id": product_id,
                    "quantity": requested_quantity,
                    "price_at_purchase": sale_price,
                }
            )
            laptops_to_update[product_id] = requested_quantity

        # --- 3. Database Transaction: Create Order, Items, Update Stock ---
        try:
            f_name = user_profile_data.get("first_name")
            l_name = user_profile_data.get("last_name")
            constructed_user_name = (
                f"{f_name} {l_name}".strip() if f_name or l_name else None
            )

            new_order = Order(
                user_id=user_id,
                total_price=order_total_price.quantize(Decimal("0.01")),
                status="pending",
                first_name=f_name,
                last_name=l_name,
                user_name=constructed_user_name,
                user_email=user_profile_data.get("email"),
                shipping_address=user_profile_data.get("address"),
                phone_number=user_profile_data.get("phone_number"),
                company=user_profile_data.get("company"),
                country=user_profile_data.get("country"),
                zip_code=user_profile_data.get("zip_code"),
            )
            db.add(new_order)
            # It's generally better to flush AFTER adding dependent items
            # if you need the order ID for them immediately, but here we add order first.
            db.flush()  # Flush maybe needed here if you need the ID *before* commit

            order_items_obj_list = []
            for item_data in items_to_create:
                order_item = OrderItem(
                    product_id=item_data["product_id"],
                    quantity=item_data["quantity"],
                    price_at_purchase=item_data["price_at_purchase"].quantize(
                        Decimal("0.01")
                    ),
                )
                # Associate item with order - SQLAlchemy handles FK assignment
                order_item.order = new_order
                db.add(order_item)
                order_items_obj_list.append(order_item)

            # Update Laptop Stock
            for laptop_id, quantity_to_decrement in laptops_to_update.items():
                laptop_to_update = laptops_map.get(laptop_id)
                if laptop_to_update:
                    laptop_to_update.quantity -= quantity_to_decrement
                else:
                    raise IntegrityError(
                        f"Laptop {laptop_id} missing in transaction.",
                        params=None,
                        orig=None,
                    )

            # Now commit everything
            db.commit()
            # Manually assign items list if backref doesn't auto-populate immediately for response
            new_order.items = order_items_obj_list

        except (SQLAlchemyError, IntegrityError) as e:
            db.rollback()
            print(f"Database error during order creation: {e}")

            if "violates unique constraint" in str(e) and "orders_pkey" in str(e):
                detail_msg = "Failed to save order due to duplicate ID. Sequence might be out of sync."
            else:
                detail_msg = f"Failed to save order to database: {e}"

            raise HTTPException(status_code=500, detail=detail_msg)

        # --- 4. Clear Redis Cart ---
        try:
            redis_client.delete(cart_key)
        except Exception as e:
            print(
                f"Warning: Failed to clear Redis cart '{cart_key}' for order {new_order.id}: {e}"
            )

        # --- 5. Return Response ---
        db.refresh(new_order)

        for item in new_order.items:
            db.refresh(item)

        return new_order

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error during order creation: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )
