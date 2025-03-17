from elasticsearch import Elasticsearch
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

# Initialize Elasticsearch Client
es = Elasticsearch("http://localhost:9200")
ES_INDEX = "laptops"

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

    # Index the laptop in Elasticsearch
    es.index(index=ES_INDEX, id=new_laptop.id, body={
        "brand": new_laptop.brand,
        "model": new_laptop.model,
        "ram": new_laptop.ram,
        "storage": new_laptop.storage,
        "price": new_laptop.price,
        "inserted_at": str(new_laptop.inserted_at)
    })

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

    # Remove laptop from Elasticsearch
    es.delete(index=ES_INDEX, id=laptop_id, ignore=[404])

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

    # Update in Elasticsearch
    es.update(index=ES_INDEX, id=laptop.id, body={"doc": update_data})
    
    return {"message": "Laptop updated successfully", "laptop": laptop}

@app.get("/search/")
def search_laptops(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, description="Number of results to return")
):
    """
    Full-text search based only on the 'name' and 'serial number' fields.
    """
    search_query = {
        "bool": {
            "should": [
                {"match": {"name": query}},  # Search in "name" field
                {"match": {"serial_number": query}}  # Search in "serial_number" field
            ],
            "minimum_should_match": 1  # At least one must match
        }
    }

    results = es.search(index=ES_INDEX, body={"query": search_query, "size": limit})  # Execute search

    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}  # Return results

@app.get("/filter/")
def filter_laptops(
    brand: str = Query(None, description="Filter by brand (Dell, HP, Lenovo, Asus, Apple, Acer, MSI, LG)"),
    cpu: str = Query(None, description="Filter by CPU"),
    vga: str = Query(None, description="Filter by VGA"),
    ram: int = Query(None, description="Filter by RAM (8GB, 16GB, 32GB)"),
    storage: int = Query(None, description="Filter by Storage (256GB, 512GB, 1024GB)"),
    storage_type: str = Query(None, description="Filter by Storage Type (HDD, SSD)"),
    screen_size: int = Query(None, description="Filter by Screen Size (13, 14, 15, 16 inches)"),
    weight_min: float = Query(None, description="Minimum Weight"),
    weight_max: float = Query(None, description="Maximum Weight"),
    price_min: int = Query(None, description="Minimum Price"),
    price_max: int = Query(None, description="Maximum Price"),
    limit: int = Query(10, description="Number of results to return")
):
    """
    Filters laptops based on brand, CPU, VGA, RAM, storage, storage type, screen size, weight, and price.
    """
    filter_query = {
        "bool": {
            "filter": []
        }
    }

    # Apply filters dynamically based on user input
    if brand:
        filter_query["bool"]["filter"].append({"term": {"brand.keyword": brand}})
    if cpu:
        filter_query["bool"]["filter"].append({"term": {"cpu.keyword": cpu}})
    if vga:
        filter_query["bool"]["filter"].append({"term": {"vga.keyword": vga}})
    if ram:
        filter_query["bool"]["filter"].append({"term": {"ram": ram}})
    if storage:
        filter_query["bool"]["filter"].append({"term": {"storage": storage}})
    if storage_type:
        filter_query["bool"]["filter"].append({"term": {"storage_type.keyword": storage_type}})
    if screen_size:
        filter_query["bool"]["filter"].append({"term": {"screen_size": screen_size}})
    if weight_min is not None or weight_max is not None:
        weight_filter = {"range": {"weight": {}}}
        if weight_min is not None:
            weight_filter["range"]["weight"]["gte"] = weight_min
        if weight_max is not None:
            weight_filter["range"]["weight"]["lte"] = weight_max
        filter_query["bool"]["filter"].append(weight_filter)
    if price_min is not None or price_max is not None:
        price_filter = {"range": {"price": {}}}
        if price_min is not None:
            price_filter["range"]["price"]["gte"] = price_min
        if price_max is not None:
            price_filter["range"]["price"]["lte"] = price_max
        filter_query["bool"]["filter"].append(price_filter)

    # Execute query in Elasticsearch
    results = es.search(index=ES_INDEX, body={"query": filter_query, "size": limit})

    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}

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
