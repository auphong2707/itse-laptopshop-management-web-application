from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import firebase_admin
from firebase_admin import credentials, auth, firestore

from db.models import *
from db.session import *
from schemas.laptops import *

from services.firebase_auth import ExtendedUserCreate
try :
    cred = credentials.Certificate("secret/firebase-service-key.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except FileNotFoundError:
    print("File not found. Therefore, firebase service is unavailable.")

app = FastAPI()

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

@app.get("/")
def read_root():
    return {"message": "Welcome to Laptop Management API!"}

@app.post("/laptops/")
def insert_laptop(laptop: LaptopCreate, db: Session = Depends(get_db)):
    '''
    Insert new laptop into database
    '''
    new_laptop = Laptop(**laptop.dict())
    db.add(new_laptop)
    db.commit()
    db.refresh(new_laptop)
    return {"message": "Laptop added successfully", "laptop": new_laptop}

@app.delete("/laptops/{laptop_id}")
def delete_laptop(laptop_id: int, db: Session = Depends(get_db)):
    '''
    Delete laptop from database
    '''
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if laptop is None:
        raise HTTPException(status_code=404, detail="Laptop not found")

    db.delete(laptop)
    db.commit()
    return {"message": "Laptop deleted successfully"}

@app.put("/laptops/{laptop_id}")
def update_laptop(laptop_id: int, laptop_update: LaptopUpdate, db: Session = Depends(get_db)):
    '''
    Update laptop in database
    '''
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if laptop is None:
        raise HTTPException(status_code=404, detail="Laptop not found")

    update_data = laptop_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(laptop, key, value)

    db.commit()
    db.refresh(laptop)

    return {"message": "Laptop updated successfully", "laptop": laptop}

@app.get("/laptops/latest")
def get_latest_laptops(
    projection: str = Query("all"),
    brand: str = Query("all"),
    subbrand: str = Query("all"),
    limit: int = Query(10),
    db: Session = Depends(get_db),
):
    """
    Get latest laptops from database, optionally filtering by brand,
    and returning either full objects or partial "product-card" fields.
    """
    if projection == "product-card":
        type = LaptopCardView
    else:
        type = Laptop

    # 1) Select all fields if projection is "all"
    query = db.query(type)
    
    # 2) Filter by brand if not "all"
    if brand.lower() != "all":
        query = query.filter(type.brand == brand)
    
    # 3) Filter by sub_brand if not "all"
    if subbrand.lower() != "all":
        query = query.filter(type.sub_brand == subbrand)

    # 4) Execute query and return results
    if projection == "product-card":
        laptops = (
            query.order_by(type.inserted_at.desc())
            .limit(limit).
            all()
        )
    else:
        # "all" or anything else -> select entire Laptop model
        laptops = (
            query.order_by(type.inserted_at.desc())
            .limit(limit)
            .all()
        )

    return laptops

@app.get("/laptops/id/{laptop_id}")
def get_laptop(laptop_id: int, db: Session = Depends(get_db)):
    '''
    Get laptop by id
    '''
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if laptop is None:
        raise HTTPException(status_code=404, detail="Laptop not found")

    return laptop

@app.get("/reviews")
def get_reviews(rating: list = Query([1, 2, 3, 4, 5]), limit: int = Query(5), db: Session = Depends(get_db)):
    '''
    Get reviews
    '''
    testimonials = (
        db.query(Review)
          .filter(Review.rating.in_(rating))
          .order_by(Review.created_at.desc())
          .limit(limit).all()
        )

    return testimonials

@app.get("/posts")
def get_posts(limit: int = Query(12), db: Session = Depends(get_db)):
    '''
    Get posts
    '''
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(limit).all()
    return posts

@app.post("/accounts")
def create_account(user_data: ExtendedUserCreate):
    """
    Create a new Firebase user and store extended profile data in Firestore.
    """
    try:
        # 1) Create user in Firebase Authentication
        user_record = auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.display_name,
            phone_number=user_data.phone_number,
        )

        # 2) Store extra profile fields in Firestore, keyed by the user's UID
        db.collection("users").document(user_record.uid).set({
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "company": user_data.company,   
            "address": user_data.address,
            "country": user_data.country,
            "zip_code": user_data.zip_code,
            # Add as many fields as you need
        })

        return {
            "message": "Account and profile created successfully",
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