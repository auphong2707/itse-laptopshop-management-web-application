import os
import json
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

import shutil

from routes.laptops import laptops_router
from routes.cart import cart_router
from routes.orders import orders_router
from routes.reviews import reviews_router

app = FastAPI()
app.include_router(laptops_router, tags=["laptops"])
app.include_router(reviews_router, tags=["reviews"])
app.include_router(cart_router, tags=["cart"])
app.include_router(orders_router, tags=["orders"])
security = HTTPBearer()


@app.get("/secure")
def secure_endpoint(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    return {"token": token}


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


@app.get("/")
def read_root():
    return {"message": "Welcome to Laptop Management API!"}


@app.get("/posts")
def get_posts(limit: int = Query(12)):
    """
    Get posts
    """
    results = es.search(index="posts", body={"query": {"match_all": {}}, "size": limit})
    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}


@app.post("/accounts/check")
def check_email_and_phone(data: dict = Body(...)):
    email = data.get("email")
    phone = data.get("phone_number")

    users_ref = firestore.client().collection("users")
    email_exists = False
    phone_exists = False

    if email:
        query = users_ref.where("email", "==", email).limit(1).stream()
        email_exists = any(query)

    if phone:
        query = users_ref.where("phone_number", "==", phone).limit(1).stream()
        phone_exists = any(query)

    return {"email_exists": email_exists, "phone_exists": phone_exists}


@app.post("/accounts")
def create_account(user_data: ExtendedUserCreate):
    try:
        # 1. Role validation
        if user_data.role not in ["admin", "customer"]:
            raise HTTPException(status_code=400, detail="Invalid role.")

        # 2. If admin, require secret key
        if user_data.role == "admin":
            if user_data.secret_key != os.getenv("ADMIN_CREATION_SECRET"):
                raise HTTPException(
                    status_code=403, detail="Unauthorized to create admin account."
                )

        # 3. Create Firebase user
        user_record = auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.display_name,
            phone_number=user_data.phone_number,
        )

        # 4. Set custom claim
        auth.set_custom_user_claims(user_record.uid, {"role": user_data.role})

        # 5. Store extended profile in Firestore
        firestore.client().collection("users").document(user_record.uid).set(
            {
                "email": user_data.email,
                "phone_number": user_data.phone_number,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "company": user_data.company,
                "address": user_data.address,
                "country": user_data.country,
                "zip_code": user_data.zip_code,
                "role": user_data.role,
            }
        )

        return {
            "message": f"{user_data.role.capitalize()} account created successfully",
            "uid": user_record.uid,
            "email": user_record.email,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/accounts/{uid}")
def delete_account(uid: str):
    """
    Delete the user from Firebase by UID.
    """
    try:
        auth.delete_user(uid)
        return {"message": f"Account with UID {uid} deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/login")
def login_user(user_data=Depends(verify_firebase_token)):
    # user_data contains info like uid, email, etc.
    return {"message": "Login successful", "user": user_data}


@app.get("/admin/dashboard")
def admin_dashboard(user=Depends(verify_firebase_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return {"message": "Welcome Admin!"}


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
