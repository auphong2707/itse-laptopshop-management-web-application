from pydantic import BaseModel
from typing import Optional


class ReviewCreate(BaseModel):
    laptop_id: int
    rating: int  # Rating should be between 1 and 5
    review_text: Optional[str] = None

    class Config:
        orm_mode = True  # Tells Pydantic to treat the model as a dict for the ORM


class ReviewResponse(ReviewCreate):
    id: int
    created_at: str  # The timestamp when the review was created

    class Config:
        orm_mode = True  # Tells Pydantic to treat the model as a dict for the ORM
