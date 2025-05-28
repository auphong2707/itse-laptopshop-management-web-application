from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RefundTicketCreate(BaseModel):
    email: str
    phone_number: str
    order_id: int
    reason: str
    status: str = "pending"  # Default to pending, can be 'approved' or 'rejected'
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
        None  # You can update the status (pending, approved, rejected)
    )
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True  # Tell Pydantic to treat the model as a dict


class RefundTicketResponse(RefundTicketCreate):
    id: int
    updated_at: datetime  # We will include an updated_at field in the response

    class Config:
        orm_mode = True  # Tell Pydantic to treat the model as a dict
