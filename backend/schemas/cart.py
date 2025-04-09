from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class CartItemAdd(BaseModel):
    laptop_id: int = Field(..., description="ID of the laptop to add to the cart")
    quantity: int = Field(
        ..., gt=0, description="Quantity of the laptop to add to the cart"
    )


class CartItemUpdate(BaseModel):
    laptop_id: int = Field(..., description="ID of the laptop to update in the cart")
    new_quantity: int = Field(
        ..., ge=0, description="New quantity of the laptop in the cart"
    )


class CartViewResponse(BaseModel):
    cart: Dict[int, int] = Field(
        ..., description="Dictionary of laptop IDs and their quantities in the cart"
    )
