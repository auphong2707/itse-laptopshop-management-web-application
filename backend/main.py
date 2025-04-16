import os
from elasticsearch import Elasticsearch
from fastapi import FastAPI, Depends, HTTPException, Query, Body

from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from firebase_admin import auth
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from db.models import *
from db.session import *
from schemas.laptops import *
from schemas.newsletter import *
from schemas.orders import *
from schemas.refund_tickets import *
from schemas.reviews import *

from services.firebase_auth import *
from fastapi.staticfiles import StaticFiles

from routes.laptops import laptops_router
from routes.reviews import reviews_router
from routes.posts import posts_router
from routes.cart import cart_router
from routes.orders import orders_router
from routes.accounts import accounts_router

app = FastAPI()
app.include_router(laptops_router, tags=["laptops"])
app.include_router(reviews_router, tags=["reviews"])
app.include_router(posts_router, tags=["posts"])
app.include_router(cart_router, tags=["cart"])
app.include_router(orders_router, tags=["orders"])
app.include_router(accounts_router, tags=["accounts"])
security = HTTPBearer()


load_dotenv()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize Elasticsearch Client
es = Elasticsearch("http://elasticsearch:9200")


@app.get("/secure")
def secure_endpoint(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    return {"token": token}


@app.get("/")
def read_root():
    return {"message": "Welcome to Laptop Management API!"}


@app.post("/newsletter/subscribe")
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


# Create a refund ticket
@app.post("/refund_tickets/", response_model=RefundTicketResponse)
async def create_refund_ticket(
    refund_ticket: RefundTicketCreate, db: Session = Depends(get_db)
):
    # Check if refund ticket for this email & phone number already exists
    existing_ticket = (
        db.query(RefundTicket)
        .filter_by(email=refund_ticket.email, phone_number=refund_ticket.phone_number)
        .first()
    )

    if existing_ticket:
        raise HTTPException(
            status_code=400,
            detail="Refund ticket already exists for this email and phone number combination.",
        )

    # Create a new RefundTicket instance
    new_refund_ticket = RefundTicket(
        email=refund_ticket.email,
        phone_number=refund_ticket.phone_number,
        order_id=refund_ticket.order_id,
        reason=refund_ticket.reason,
        amount=refund_ticket.amount,
        status=refund_ticket.status,
    )

    try:
        # Add the new refund ticket to the database
        db.add(new_refund_ticket)
        db.commit()  # Commit the transaction
        db.refresh(
            new_refund_ticket
        )  # Refresh the object to get the updated state from the DB

        # Return the success message and the ticket data
        return {
            "message": "Refund ticket created successfully",
            "ticket": new_refund_ticket,
        }

    except IntegrityError:
        db.rollback()  # Rollback in case of an error
        raise HTTPException(status_code=500, detail="Error creating the refund ticket.")


# Refund tickets (with optional filters)
@app.get("/refund_tickets/", response_model=List[RefundTicketResponse])
async def get_refund_tickets(
    email: Optional[str] = None,
    phone_number: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(RefundTicket)

    if email:
        query = query.filter(RefundTicket.email == email)
    if phone_number:
        query = query.filter(RefundTicket.phone_number == phone_number)
    if status:
        query = query.filter(RefundTicket.status == status)

    refund_tickets = query.all()  # Fetch all matching refund tickets

    return refund_tickets


# Update the refund ticket (like change status or mark as resolved)
@app.put("/refund_tickets/{refund_ticket_id}", response_model=RefundTicketResponse)
async def update_refund_ticket(
    refund_ticket_id: int,
    refund_ticket_update: RefundTicketUpdate,
    db: Session = Depends(get_db),
):
    # Fetch the refund ticket to update
    refund_ticket = (
        db.query(RefundTicket).filter(RefundTicket.id == refund_ticket_id).first()
    )

    if not refund_ticket:
        raise HTTPException(status_code=404, detail="Refund ticket not found")

    # Update fields
    if refund_ticket_update.status:
        refund_ticket.status = refund_ticket_update.status
    if refund_ticket_update.resolved_at:
        refund_ticket.resolved_at = refund_ticket_update.resolved_at

    # Commit the changes to the database
    db.commit()
    db.refresh(refund_ticket)  # Refresh the object to get the updated state from the DB

    return refund_ticket
