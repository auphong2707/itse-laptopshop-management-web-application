# routes/reviews.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from elasticsearch import Elasticsearch

from db.models import Review, Laptop
from schemas.reviews import ReviewCreate  # adjust import if necessary
from db.session import get_db

reviews_router = APIRouter(prefix="/reviews", tags=["reviews"])
es = Elasticsearch("http://elasticsearch:9200")


@reviews_router.post("/", response_model=ReviewCreate)
async def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    # Check if the laptop with the provided laptop_id exists
    laptop = db.query(Laptop).filter(Laptop.id == review.laptop_id).first()

    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")

    new_review = Review(
        laptop_id=review.laptop_id,
        user_name=review.user_name,
        email=review.email,
        rating=review.rating,
        review_text=review.review_text,
        created_at=datetime.utcnow().isoformat(),
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review


@reviews_router.get("/")
def get_reviews(rating: list = Query([1, 2, 3, 4, 5]), limit: int = Query(5)):
    """
    Get reviews with optional rating filter
    """
    filter_query = {"bool": {"filter": [{"terms": {"rating": rating}}]}}

    results = es.search(index="reviews", body={"query": filter_query, "size": limit})
    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}
