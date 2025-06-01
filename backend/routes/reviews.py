# routes/reviews.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from db.models import Review, Laptop
from schemas.reviews import ReviewCreate, ReviewResponse
from services.firebase_auth import get_current_user_id
from db.session import get_db

reviews_router = APIRouter(prefix="/reviews", tags=["reviews"])


@reviews_router.post("/", response_model=ReviewCreate)
async def create_review(review: ReviewCreate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    # Check if the laptop with the provided laptop_id exists
    laptop = db.query(Laptop).filter(Laptop.id == review.laptop_id).first()

    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")

    new_review = Review(
        user_id=user_id,
        laptop_id=review.laptop_id,
        rating=review.rating,
        review_text=review.review_text,
        created_at=datetime.utcnow().isoformat(),
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review

@reviews_router.get("/user", response_model=list[ReviewCreate])
async def get_reviews_by_user(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    reviews = db.query(Review).filter(Review.user_id == user_id).offset(skip).limit(limit).all()
    
    if not reviews:
        return []
    
    return reviews
