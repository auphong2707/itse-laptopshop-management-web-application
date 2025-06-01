from pydantic import BaseModel, Field
from typing import Optional, ForwardRef
from datetime import datetime
from sqlalchemy.orm import relationship

# Import the OrderResponse or use a forward reference
from schemas.orders import OrderResponse


class RefundTicketCreate(BaseModel):
    email: str
    phone_number: str
    order_id: int
    reason: str
    status: str = "pending"  # Default to pending
    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )  # Auto-set current timestamp
    resolved_at: Optional[datetime] = (
        None  # This can be set later when the refund is resolved
    )

    class Config:
        orm_mode = True  # Tell Pydantic to treat the model as a dict


class RefundTicketUpdate(BaseModel):
    email: Optional[str] = None
    phone_number: Optional[str] = None
    order_id: Optional[int] = None
    reason: Optional[str] = None
    status: Optional[str] = (
        None  # You can update the status (pending, resolved)
    )
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True  # Tell Pydantic to treat the model as a dict

class RefundTicketResponse(RefundTicketCreate):
    id: int
    order: Optional[OrderResponse] = None  # Relationship to the Order

    class Config:
        orm_mode = True  # Tell Pydantic to treat the model as a dict
        from_attributes = True  # New in Pydantic v2, equivalent to orm_mode
        arbitrary_types_allowed = True  # Allow arbitrary SQLAlchemy relationship types
    class Config:
        orm_mode = True  # Tell Pydantic to treat the model as a dict
        from_attributes = True  # New in Pydantic v2, equivalent to orm_mode
