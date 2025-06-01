from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: int

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    user_id: str
    total_price: int
    status: str
    created_at: datetime
    updated_at: datetime

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    user_email: Optional[str] = None
    shipping_address: Optional[str] = None
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True


class OrderResponse(OrderBase):
    id: int
    items: List[OrderItemBase]

    class Config:
        from_attributes = True


class UpdateStatus(BaseModel):
    status: str
