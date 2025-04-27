from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from firebase_admin import auth
from decimal import Decimal, InvalidOperation
from typing import List, Optional
from pydantic import BaseModel

from db.models import Laptop, Order, OrderItem
from db.session import get_db
from schemas.orders import (
    OrderResponse,
    UpdateStatus,
)
from datetime import datetime

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
orders_router = APIRouter(prefix="/orders", tags=["orders"])


async def require_admin_role(user_id: str = Depends(get_current_user_id)):

    user = auth.get_user(user_id)
    if not user.custom_claims or user.custom_claims.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required"
        )
    return user_id


@orders_router.post("")
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
    order_total_price = 0
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

            sale_price = laptop.sale_price 
            if sale_price is None:
                 raise HTTPException(status_code=500, detail=f"Missing price for product ID {product_id}")

            item_subtotal_int = sale_price * requested_quantity
            order_total_price += item_subtotal_int 

            items_to_create.append({
                "product_id": product_id,
                "quantity": requested_quantity,
                "price_at_purchase_int": sale_price, 
            })
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
                total_price=order_total_price,
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
                    price_at_purchase=item_data["price_at_purchase"]
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


class PaginatedOrdersResponse(BaseModel):
    total_count: int
    page: int
    limit: int
    orders: List[OrderResponse]


@orders_router.get("", response_model=PaginatedOrdersResponse)
def get_my_orders(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieves a paginated list of orders for the currently authenticated user
    from the PostgreSQL database.
    """
    offset = (page - 1) * limit

    try:
        # Query for the orders with pagination and eager loading of items
        base_query = db.query(Order).filter(Order.user_id == user_id)

        # Get total count for pagination
        total_count = base_query.count()  # More efficient count

        orders = (
            base_query.order_by(Order.created_at.desc())
            .options(joinedload(Order.items))
            .offset(offset)
            .limit(limit)
            .all()
        )

        return PaginatedOrdersResponse(
            total_count=total_count, page=page, limit=limit, orders=orders
        )
    except SQLAlchemyError as e:
        print(f"Database error fetching user orders: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve orders.")


@orders_router.get("/{order_id}", response_model=OrderResponse)
def get_my_single_order(
    order_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Fetches a single order by authenticated user ID.
    """
    try:
        order = (
            db.query(Order)
            .options(joinedload(Order.items))
            .filter(Order.id == order_id, Order.user_id == user_id)
            .first()
        )
    except SQLAlchemyError as e:
        print(f"Database error fetching single order: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve order details.")

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or access denied.",
        )
    return order


@orders_router.patch("/{order_id}/cancel", response_model=OrderResponse)
def cancel_my_order(
    order_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Allows the currently authenticated user to cancel their own order,
    if it is in a cancellable state (e.g., 'pending').
    """
    try:
        order = (
            db.query(Order)
            .filter(Order.id == order_id, Order.user_id == user_id)
            .first()
        )

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found or access denied.",
            )

        cancellable_statuses = ["pending", "processing"]

        if order.status not in cancellable_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order cannot be cancelled. Current status: {order.status}",
            )

        # --- estore Stock ---
        order_items_to_restore = (
            db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        )
        for item in order_items_to_restore:
            laptop = (
                db.query(Laptop)
                .filter(Laptop.id == item.product_id)
                .with_for_update()
                .first()
            )
            if laptop:
                laptop.quantity += item.quantity
            else:
                # Log warning: Product might have been deleted?
                print(
                    f"Warning: Product ID {item.product_id} not found while restoring stock for cancelled order {order_id}"
                )

        order.status = "cancelled"
        db.commit()
        db.refresh(order)

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error cancelling order: {e}")
        raise HTTPException(
            status_code=500, detail="Could not cancel order due to a database error."
        )
    except HTTPException as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        print(f"Unexpected error cancelling order: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while cancelling the order.",
        )

    return order


# == Admin operation == #


@orders_router.get(
    "/admin/list",
    response_model=PaginatedOrdersResponse,
    dependencies=[Depends(require_admin_role)],
)
def admin_get_all_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by order status"),
    user_id_filter: Optional[str] = Query(
        None, alias="userId", description="Filter by User ID (Firebase UID)"
    ),
    start_date: Optional[datetime] = Query(
        None, description="Filter orders created on or after this date (ISO Format)"
    ),
    end_date: Optional[datetime] = Query(
        None, description="Filter orders created on or before this date (ISO Format)"
    ),
    db: Session = Depends(get_db),
):
    """
    [Admin] Retrieves a paginated list of all orders, with optional filters.
    Requires admin privileges.
    """
    offset = (page - 1) * limit
    try:
        query = db.query(Order).options(joinedload(Order.items))

        if status:
            query = query.filter(Order.status == status)
        if user_id_filter:
            query = query.filter(Order.user_id == user_id_filter)
        if start_date:
            query = query.filter(Order.created_at >= start_date)
        if end_date:
            query = query.filter(Order.created_at <= end_date)

        total_count = query.count()

        orders = (
            query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
        )

        return PaginatedOrdersResponse(
            total_count=total_count, page=page, limit=limit, orders=orders
        )
    except SQLAlchemyError as e:
        print(f"Database error fetching all orders for admin: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve orders.")


@orders_router.patch(
    "/admin/{order_id}/status",
    response_model=OrderResponse,
    dependencies=[Depends(require_admin_role)],
)
def admin_update_order_status(
    order_id: int, status_data: UpdateStatus, db: Session = Depends(get_db)
):
    """
    [Admin] Updates the status of any specific order.
    Requires admin privileges.
    """

    allowed_statuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
    ]
    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400, detail=f"Invalid status value: {status_data.status}"
        )

    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
            )

        order.status = status_data.status
        db.commit()
        db.refresh(order)

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error updating order status (Admin): {e}")
        raise HTTPException(status_code=500, detail="Could not update order status.")

    return order


@orders_router.delete(
    "/admin/{order_id}",
    dependencies=[Depends(require_admin_role)],
)
def admin_delete_order(order_id: int, db: Session = Depends(get_db)):
    """
    [Admin] Permanently deletes a specific order.
    Requires admin privileges.
    """
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
            )

        db.delete(order)
        db.commit()

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error deleting order (Admin): {e}")
        raise HTTPException(status_code=500, detail="Could not delete order.")

    return {
        "message": "Order removed successfully",
        "laptop_id": order_id,
    }
