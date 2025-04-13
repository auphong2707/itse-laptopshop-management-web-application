import os
import json
from elasticsearch import Elasticsearch
from fastapi import FastAPI, Depends, HTTPException, Query, Body, status

from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
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
from fastapi import UploadFile, File
from PIL import Image, ImageDraw, ImageFont

import shutil

from routes.cart import router as cart_router


app = FastAPI()
app.include_router(cart_router, tags=["cart"])
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


@app.post("/laptops/")
def insert_laptop(laptop: LaptopCreate, db: Session = Depends(get_db)):
    """
    Insert new laptop into database
    """
    new_laptop = Laptop(**laptop.dict())
    db.add(new_laptop)
    db.commit()
    db.refresh(new_laptop)

    return {"message": "Laptop added successfully", "laptop": new_laptop}


@app.delete("/laptops/{laptop_id}")
def delete_laptop(laptop_id: int, db: Session = Depends(get_db)):
    """
    Delete a laptop from the database and log the deletion.
    """
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")

    # Log the deletion in the delete_log table
    db.execute(
        text(
            "INSERT INTO delete_log (id, table_name, deleted_at) VALUES (:id, 'laptops', NOW())"
        ),
        {"id": laptop_id},
    )

    # Delete the laptop
    db.delete(laptop)

    # Commit both operations together
    db.commit()
    return {"message": "Laptop deleted successfully"}


@app.put("/laptops/{laptop_id}")
def update_laptop(
    laptop_id: int, laptop_update: LaptopUpdate, db: Session = Depends(get_db)
):
    """
    Update laptop in database
    """
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if laptop is None:
        raise HTTPException(status_code=404, detail="Laptop not found")

    update_data = laptop_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(laptop, key, value)

    db.commit()
    db.refresh(laptop)

    return {"message": "Laptop updated successfully", "laptop": laptop}


@app.get("/laptops/search/")
def search_laptops(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, description="Number of results to return"),
):
    """
    Full-text search based only on the 'name' and 'serial number' fields.
    """
    search_query = {
        "bool": {
            "should": [
                {"match": {"name": query}},  # Search in "name" field
                {"match": {"serial_number": query}},  # Search in "serial_number" field
            ],
            "minimum_should_match": 1,  # At least one must match
        }
    }

    results = es.search(
        index="laptops", body={"query": search_query, "size": limit}
    )  # Execute search

    return {
        "results": [hit["_source"] for hit in results["hits"]["hits"]]
    }  # Return results


@app.get("/laptops/filter")
def filter_laptops(
    price_min: int = Query(None, description="Minimum Price"),
    price_max: int = Query(None, description="Maximum Price"),
    brand: list[str] = Query(
        [], description="Filter by brands (Dell, HP, Lenovo, Asus, Apple, Acer, MSI)"
    ),
    sub_brand: list[str] = Query(
        [], description="Filter by sub-brands (e.g., ROG, TUF, ZenBook, VivoBook)"
    ),
    cpu: list[str] = Query(
        [], description="Filter by CPUs (AMD Ryzen, Intel Core, Apple M1, M2, etc.)"
    ),
    vga: list[str] = Query(
        [], description="Filter by VGAs (Nvidia GTX, RTX, AMD Radeon RX, etc.)"
    ),
    ram_amount: list[int] = Query(
        [], description="Filter by RAM (8GB, 16GB, 32GB, 64GB)"
    ),
    storage_amount: list[int] = Query(
        [], description="Filter by Storage (256GB, 512GB, 1024GB)"
    ),
    screen_size: list[int] = Query(
        [], description="Filter by Screen Sizes (13, 14, 15, 16, 17 inches)"
    ),
    weight_min: float = Query(None, description="Minimum Weight"),
    weight_max: float = Query(None, description="Maximum Weight"),
    limit: int = Query(None, description="Number of results to return (default: all)"),
    page: int = Query(1, description="Page number for pagination (default: 1)"),
    sort: str = Query(
        "latest", description="Sort by 'latest' (default), 'price_asc', or 'price_desc'"
    ),
):
    """
    Filters laptops based on brand, CPU, VGA, RAM, storage, screen size, weight, and price.
    Supports sorting by latest (default) or price.
    Supports pagination if `limit` is specified.
    """

    filter_query = {"bool": {"filter": []}}
    should_query = {"bool": {"should": []}}

    # Apply strict filters
    if brand and "all" not in brand:
        filter_query["bool"]["filter"].append({"terms": {"brand.keyword": brand}})
    if sub_brand:
        filter_query["bool"]["filter"].append(
            {"terms": {"sub_brand.keyword": sub_brand}}
        )
    if ram_amount:
        filter_query["bool"]["filter"].append({"terms": {"ram_amount": ram_amount}})
    if storage_amount:
        filter_query["bool"]["filter"].append(
            {"terms": {"storage_amount": storage_amount}}
        )

    # Make CPU and VGA flexible (wildcard matching)
    if cpu:
        should_query["bool"]["should"].extend(
            [
                {"wildcard": {"cpu.keyword": f"*{c.lower()}*"}}
                for c in cpu
                if isinstance(c, str)
            ]
        )
    if vga:
        should_query["bool"]["should"].extend(
            [
                {"wildcard": {"vga.keyword": f"*{v.lower()}*"}}
                for v in vga
                if isinstance(v, str)
            ]
        )

    # Screen size: allow a range (e.g., 15 → 15 - 15.6)
    if screen_size:
        filter_query["bool"]["filter"].append(
            {
                "bool": {
                    "should": [
                        {"range": {"screen_size": {"gte": size, "lte": size + 0.6}}}
                        for size in screen_size
                    ],
                    "minimum_should_match": 1,
                }
            }
        )

    # Weight filter
    if weight_min is not None or weight_max is not None:
        weight_filter = {"range": {"weight": {}}}
        if weight_min is not None:
            weight_filter["range"]["weight"]["gte"] = weight_min
        if weight_max is not None:
            weight_filter["range"]["weight"]["lte"] = weight_max
        filter_query["bool"]["filter"].append(weight_filter)

    # Price filter
    if price_min is not None or price_max is not None:
        price_filter = {"range": {"sale_price": {}}}
        if price_min is not None:
            price_filter["range"]["sale_price"]["gte"] = price_min
        if price_max is not None:
            price_filter["range"]["sale_price"]["lte"] = price_max
        filter_query["bool"]["filter"].append(price_filter)

    # Merge should_query into filter_query (if there are CPU/VGA conditions)
    if should_query["bool"]["should"]:
        should_query["bool"]["minimum_should_match"] = 1  # Ensure at least one match
        filter_query["bool"]["filter"].append(should_query)

    # Sorting options
    sort_options = {
        "latest": [{"inserted_at": {"order": "desc"}}],
        "price_asc": [{"sale_price": {"order": "asc"}}],
        "price_desc": [{"sale_price": {"order": "desc"}}],
    }
    sorting = sort_options.get(sort, sort_options["latest"])

    # Pagination
    query_body = {"query": filter_query, "sort": sorting}
    if limit is not None:
        query_body.update({"size": limit, "from": (page - 1) * limit})

    # Execute Elasticsearch query
    results = es.search(index="laptops", body=query_body, track_total_hits=True)

    total_count = results["hits"]["total"]["value"]

    return {
        "sort": sort,
        "page": page if limit is not None else None,
        "limit": limit,
        "total_count": total_count,
        "results": [hit["_source"] for hit in results["hits"]["hits"]],
    }


@app.get("/laptops/latest")
def get_latest_laptops(
    brand: str = Query("all"), subbrand: str = Query("all"), limit: int = Query(35)
):
    """
    Get latest laptops from Elasticsearch, optionally filtering by brand and sub-brand.
    """
    filter_query = {"bool": {"filter": []}}

    # Filter by brand if not "all"
    if brand.lower() != "all":
        filter_query["bool"]["filter"].append({"term": {"brand.keyword": brand}})

    # Filter by sub-brand if not "all"
    if subbrand.lower() != "all":
        filter_query["bool"]["filter"].append({"term": {"sub_brand.keyword": subbrand}})

    # Execute query and return results
    results = es.search(
        index="laptops",
        body={
            "query": filter_query,
            "sort": [{"inserted_at": {"order": "desc"}}],
            "size": limit,
        },
    )

    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}


@app.get("/laptops/id/{laptop_id}")
def get_laptop(laptop_id: int):
    """
    Get laptop by id using Elasticsearch
    """
    query = {"query": {"term": {"id": laptop_id}}}

    results = es.search(index="laptops", body=query)
    if not results["hits"]["hits"]:
        raise HTTPException(status_code=404, detail="Laptop not found")

    return results["hits"]["hits"][0]["_source"]


@app.post("/reviews/", response_model=ReviewCreate)
async def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    # Check if the laptop with the provided laptop_id exists
    laptop = db.query(Laptop).filter(Laptop.id == review.laptop_id).first()

    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")

    # Create the review entry
    new_review = Review(
        laptop_id=review.laptop_id,
        user_name=review.user_name,
        email=review.email,
        rating=review.rating,
        review_text=review.review_text,
        created_at=datetime.utcnow().isoformat()
    )

    db.add(new_review)
    db.commit()  # Commit the transaction
    db.refresh(new_review)  # Refresh the object to get the updated state from the DB

    return new_review  # Return the review that was created

@app.get("/reviews")
def get_reviews(rating: list = Query([1, 2, 3, 4, 5]), limit: int = Query(5)):
    """
    Get reviews
    """
    filter_query = {"bool": {"filter": [{"terms": {"rating": rating}}]}}

    results = es.search(index="reviews", body={"query": filter_query, "size": limit})
    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}


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


def deep_json_load(s):
    """Recursively load JSON until the result is not a string."""
    try:
        result = json.loads(s)
        while isinstance(result, str):
            result = json.loads(result)
        return result
    except Exception:
        return None


@app.post("/laptops/{laptop_id}/upload_images")
def upload_images_to_laptop(
    laptop_id: int, files: list[UploadFile] = File(...), db: Session = Depends(get_db)
):
    """
    Upload new images for a laptop. If the laptop already has images,
    the new images are appended. For example, if there are already 3 images,
    the next file will be saved as id_img4.jpg and added to the URL list.
    """
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")

    # Use deep_json_load to fully decode any nested JSON encoding.
    existing_urls = []
    if laptop.product_image_mini:
        decoded = deep_json_load(laptop.product_image_mini)
        if isinstance(decoded, list):
            existing_urls = decoded
        elif decoded is not None:
            existing_urls = [decoded]

    os.makedirs("static/laptop_images", exist_ok=True)

    try:
        font = ImageFont.truetype("arial.ttf", 150)
    except Exception:
        font = ImageFont.load_default()

    new_urls = []
    starting_index = len(existing_urls)
    for i, file in enumerate(files):
        new_index = starting_index + i + 1
        filename = f"{laptop_id}_img{new_index}.jpg"
        filepath = os.path.join("static/laptop_images", filename)

        # Save the uploaded file
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Reopen image to draw watermark
        with Image.open(filepath) as img:
            draw = ImageDraw.Draw(img)
            draw.text(
                (30, 30),
                f"ID: {laptop_id}",
                fill="black",
                stroke_fill="white",
                stroke_width=3,
                font=font,
            )
            img.save(filepath)

        new_urls.append(f"/static/laptop_images/{filename}")

    # Append new URLs to the existing list and update DB
    all_urls = existing_urls + new_urls
    laptop.product_image_mini = json.dumps(all_urls)
    db.commit()

    return {"message": "Images uploaded successfully", "image_urls": all_urls}


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


@app.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    # Create the order
    new_order = Order(
        user_id=user_id,
        total_price=order_data.total_price,
    )
    db.add(new_order)
    db.flush()  # Ensures new_order.id is available before committing

    # Create and link order items
    for item in order_data.items:
        order_item = OrderItem(
            order_id=new_order.id, laptop_id=item.product_id, quantity=item.quantity
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)

    # Prepare response
    return OrderResponse(
        order_id=new_order.id,
        user_id=new_order.user_id,
        items=order_data.items,
        total_price=new_order.total_price,
        status=new_order.status,
        created_at=new_order.created_at,
        updated_at=new_order.updated_at,
    )


@app.get("/orders")
def get_orders(limit: int = Query(10), page: int = Query(1)):
    """
    Get all orders for the current user using Elasticsearch.
    """
    query_body = {
        "sort": [{"created_at": {"order": "desc"}}],
        "size": limit,
        "from": (page - 1) * limit,
    }

    results = es.search(index="orders", body=query_body, track_total_hits=True)
    total_count = results["hits"]["total"]["value"]
    orders = results["hits"]["hits"]

    for key, value in enumerate(orders):
        orders[key]["_source"]["items"] = json.loads(value["_source"]["items"])

    return {"total_count": total_count, "page": page, "limit": limit, "orders": orders}


@app.get("/orders/{order_id}")
def get_order(order_id: int):
    """
    Get a specific order by ID for the current user using Elasticsearch.
    """
    query_body = {"query": {"bool": {"must": [{"term": {"id": order_id}}]}}}

    results = es.search(index="orders", body=query_body)
    if not results["hits"]["hits"]:
        raise HTTPException(status_code=404, detail="Order not found")

    order = results["hits"]["hits"][0]["_source"]
    order["items"] = json.loads(order["items"])

    return order


@app.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int, status_data: UpdateStatus, db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_data.status
    db.commit()
    db.refresh(order)

    print(order)

    return OrderResponse(
        order_id=order.id,
        items=[
            OrderItemBase(product_id=item.id, quantity=item.quantity)
            for item in order.items
        ],
        total_price=order.total_price,
        status=order.status,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@app.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """
    Delete an order from the database and log the deletion.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Log the deletion in the delete_log table
    db.execute(
        text(
            "INSERT INTO delete_log (id, table_name, deleted_at) VALUES (:id, 'orders', NOW())"
        ),
        {"id": order_id},
    )

    # Delete the order
    db.delete(order)

    # Commit both operations together
    db.commit()
    return {"message": "Order deleted successfully"}


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
