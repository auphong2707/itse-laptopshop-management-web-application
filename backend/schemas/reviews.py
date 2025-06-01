from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    laptop_id: int
    rating: int  # Rating should be between 1 and 5
    review_text: Optional[str] = None

    class Config:
        orm_mode = True  # Tells Pydantic to treat the model as a dict for the ORM


class ReviewResponse(ReviewCreate):
    id: int
    user_id: str  # The ID of the user who created the review
    created_at: datetime  # The timestamp when the review was created

    class Config:
        orm_mode = True  # Tells Pydantic to treat the model as a dict for the ORM
