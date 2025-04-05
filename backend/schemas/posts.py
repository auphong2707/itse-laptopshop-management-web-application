from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class PostCreate(BaseModel):
    image_url: Optional[HttpUrl] = None
    description: str
    link: Optional[HttpUrl] = None


class PostResponse(PostCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
