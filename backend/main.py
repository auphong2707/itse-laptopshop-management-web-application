from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from db.models import *
from db.session import *
from schemas.laptops import *

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
    # 1) Start with a base query
    query = db.query(Laptop)
    
    # 2) Filter by brand if not "all"
    if brand.lower() != "all":
        query = query.filter(Laptop.brand == brand)
    
    # 3) Filter by sub_brand if not "all"
    if subbrand.lower() != "all":
        query = query.filter(Laptop.sub_brand == subbrand)

    # 4) If projection == "product-card", select only certain fields
    if projection == "product-card":
        # 'with_entities' returns tuples by default
        query = query.with_entities(
            Laptop.quantity,
            Laptop.product_image_mini,
            Laptop.rate,
            Laptop.num_rate,
            Laptop.name,
            Laptop.original_price,
            Laptop.sale_price
        )
        
        laptops = query.order_by(Laptop.inserted_at.desc()).limit(limit).all()
        
        laptops = [
            {
                "quantity": row[0],
                "product_image_mini": row[1],
                "rate": row[2],
                "num_rate": row[3],
                "name": row[4],
                "original_price": row[5],
                "sale_price": row[6],
            }
            for row in laptops
        ]
    else:
        # "all" or anything else -> select entire Laptop model
        laptops = (
            query.order_by(Laptop.inserted_at.desc())
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
    