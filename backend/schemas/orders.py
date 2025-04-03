from pydantic import BaseModel
from typing import List
from datetime import datetime


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    total_price: float


class OrderResponse(BaseModel):
    order_id: int
    items: List[OrderItemBase]
    total_price: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UpdateStatus(BaseModel):
    status: str
