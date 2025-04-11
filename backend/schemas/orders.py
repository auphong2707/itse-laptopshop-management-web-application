from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: Decimal = Field(..., decimal_places=2)

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    user_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    shipping_address: Optional[str] = None
    phone_number: Optional[str] = None
    total_price: Decimal = Field(..., decimal_places=2)
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderResponse(OrderBase):
    id: int
    items: List[OrderItemBase]

    class Config:
        from_attributes = True


class UpdateStatus(BaseModel):
    status: str
