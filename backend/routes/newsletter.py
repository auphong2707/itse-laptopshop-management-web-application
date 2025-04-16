from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.models import NewsletterSubscription  # adjust import if needed
from schemas.newsletter import NewsletterCreate  # adjust import if needed
from db.session import get_db  # your session dependency

newsletter_router = APIRouter(prefix="/newsletter", tags=["newsletter"])

@newsletter_router.post("/subscribe")
def subscribe_to_newsletter(data: NewsletterCreate, db: Session = Depends(get_db)):
    """
    Subscribe an email to the newsletter
    """
    existing = db.query(NewsletterSubscription).filter_by(email=data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")

    subscription = NewsletterSubscription(email=data.email)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return {"message": "Subscribed successfully", "email": subscription.email}
