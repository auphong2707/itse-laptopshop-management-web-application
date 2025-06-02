# routes/laptops.py

import json
import os
import shutil
from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from elasticsearch import Elasticsearch
from db.models import Laptop
from schemas.laptops import LaptopCreate, LaptopUpdate
from db.session import get_db
from fastapi import UploadFile, File
from PIL import Image, ImageDraw, ImageFont
from typing import List
import time


laptops_router = APIRouter(prefix="/laptops", tags=["laptops"])
es = Elasticsearch("http://elasticsearch:9200")

@laptops_router.post("/upload-temp/{folder_name}/{filename}")
async def upload_temp_file(file: UploadFile = File(...), folder_name: str = "temp", filename: str = "temp_file"):
    """
    Upload a file to a temporary folder and return the file path.
    
    Args:
        file: The uploaded file
        folder_name: The name of the folder within the temp directory
        filename: The name of the file to be saved

    Returns:
        JSON response with the temporary file path
    """
    try:
        # Create temp directory if it doesn't exist
        os.makedirs(f"static/temp/{folder_name}", exist_ok=True)

        # Generate a unique filename using timestamp and original filename
        filepath = os.path.join("static/temp", folder_name, filename)

        # Save the file using async operations
        content = await file.read()
        with open(filepath, "wb") as buffer:
            buffer.write(content)
        
        # Return the file path as a URL
        relative_path = f"/static/temp/{folder_name}/{filename}"

        return {
            "filename": filename,
            "filepath": relative_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@laptops_router.post("/")
def insert_laptop(laptop: LaptopCreate, db: Session = Depends(get_db)):
    for i, filepath in enumerate(laptop.product_image_mini):
        # Move the image to the static folder
        if not filepath.startswith("/static/laptop_images/"):
            # Ensure the directory exists
            os.makedirs("static/laptop_images", exist_ok=True)
            # Generate a new filename
            filename = os.path.basename(filepath)
            # Move the file
            shutil.move("." + filepath, os.path.join("static/laptop_images", filename))
            # Update the filepath in the list
            laptop.product_image_mini[i] = f"/static/laptop_images/{filename}"


    new_laptop = Laptop(**laptop.dict())
    db.add(new_laptop)
    db.commit()
    db.refresh(new_laptop)
    return {"message": "Laptop added successfully", "laptop": new_laptop}


@laptops_router.delete("/{laptop_id}")
def delete_laptop(laptop_id: int, db: Session = Depends(get_db)):
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")
    db.delete(laptop)
    db.commit()
    es.delete(index="laptops", id=laptop_id)
    return {"message": "Laptop deleted successfully"}


@laptops_router.put("/{laptop_id}")
def update_laptop(
    laptop_id: int, laptop_update: LaptopUpdate, db: Session = Depends(get_db)
):
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")

    update_data = laptop_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(laptop, key, value)

    db.commit()
    db.refresh(laptop)
    return {"message": "Laptop updated successfully", "laptop": laptop}


STOP_WORDS = {"laptop", "laptops"}

@laptops_router.get("/search")
def search_laptops(
    query: str = Query(...),
    limit: int = Query(10),
    page: int = Query(1),
    sort: str = Query("relevant")
):
    terms = query.lower().split()
    filtered_terms = [t for t in terms if t not in STOP_WORDS]
    filtered_query = " ".join(filtered_terms) or query

    search_query = {
        "bool": {
            "should": [
                # 1) Khớp liên tục (boost cao)
                {"match_phrase": {"name": {"query": query, "boost": 6}}},
                {"match_phrase": {"serial_number": {"query": query, "boost": 6}}},

                # 2) Khớp rải rác trong name (tất cả token phải có)
                {
                    "match": {
                        "name": {
                            "query": filtered_query,
                            "operator": "and",
                            "boost": 4
                        }
                    }
                },

                # 3) Cross-fields trên nhiều cột (bao gồm name & serial_number)
                {
                    "multi_match": {
                        "query": filtered_query,
                        "fields": [
                            "brand^3",
                            "sub_brand^3",
                            "name^2",
                            "serial_number^3",
                            "cpu^1",
                            "vga^1"
                        ],
                        "type": "cross_fields",
                        "operator": "and" if len(filtered_terms) > 1 else "or"
                    }
                }
            ],
            "minimum_should_match": 1,
            # Vẫn ép phải match ≥1 term có nghĩa trong name
            "must": {
                "bool": {
                    "should": [
                        {"match": {"name": term}} for term in filtered_terms
                    ],
                    "minimum_should_match": 1
                }
            }
        }
    }

    sort_options = {
        "relevant": [],
        "latest":  [{"inserted_at": {"order": "desc"}}],
        "price_asc":  [{"sale_price": {"order": "asc"}}],
        "price_desc": [{"sale_price": {"order": "desc"}}],
    }
    sorting = sort_options.get(sort, [])

    query_body = {
        "query": search_query,
        "size": limit,
        "from": (page - 1) * limit,
    }
    if sorting:
        query_body["sort"] = sorting

    results = es.search(index="laptops", body=query_body, track_total_hits=True)
    return {
        "page": page,
        "limit": limit,
        "total_count": results["hits"]["total"]["value"],
        "results": [hit["_source"] for hit in results["hits"]["hits"]],
    }


@laptops_router.get("/filter")
def filter_laptops(
    price_min: int = Query(None),
    price_max: int = Query(None),
    brand: list[str] = Query([]),
    sub_brand: list[str] = Query([]),
    cpu: list[str] = Query([]),
    vga: list[str] = Query([]),
    ram_amount: list[int] = Query([]),
    storage_amount: list[int] = Query([]),
    screen_size: list[int] = Query([]),
    weight_min: float = Query(None),
    weight_max: float = Query(None),
    usage_type: list[str] = Query([]),
    limit: int = Query(None),
    page: int = Query(1),
    sort: str = Query("latest"),
):
    print(cpu)
    filter_query = {"bool": {"filter": []}}
    should_query = {"bool": {"should": []}}

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
    if cpu:
        cpu_conditions = []
        for cpu_value in cpu:
            cpu_conditions.append({"match_phrase": {"cpu": cpu_value}})
        filter_query["bool"]["filter"].append({
            "bool": {
                "should": cpu_conditions,
                "minimum_should_match": 1
            }
        })
    if vga:
        should_query["bool"]["should"].extend(
            [
                {"wildcard": {"vga.keyword": f"*{v.lower()}*"}}
                for v in vga
                if isinstance(v, str)
            ]
        )
    # Add filter for usage_type parameter
    if usage_type:
        filter_query["bool"]["filter"].append({"terms": {"usage_type.keyword": usage_type}})
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
    if weight_min is not None or weight_max is not None:
        weight_filter = {"range": {"weight": {}}}
        if weight_min is not None:
            weight_filter["range"]["weight"]["gte"] = weight_min
        if weight_max is not None:
            weight_filter["range"]["weight"]["lte"] = weight_max
        filter_query["bool"]["filter"].append(weight_filter)
    if price_min is not None or price_max is not None:
        price_filter = {"range": {"sale_price": {}}}
        if price_min is not None:
            price_filter["range"]["sale_price"]["gte"] = price_min
        if price_max is not None:
            price_filter["range"]["sale_price"]["lte"] = price_max
        filter_query["bool"]["filter"].append(price_filter)
    if should_query["bool"]["should"]:
        should_query["bool"]["minimum_should_match"] = 1
        filter_query["bool"]["filter"].append(should_query)

    sort_options = {
        "latest": [{"inserted_at": {"order": "desc"}}],
        "price_asc": [{"sale_price": {"order": "asc"}}],
        "price_desc": [{"sale_price": {"order": "desc"}}],
    }
    sorting = sort_options.get(sort, sort_options["latest"])

    query_body = {"query": filter_query, "sort": sorting}
    if limit is not None:
        query_body.update({"size": limit, "from": (page - 1) * limit})

    results = es.search(index="laptops", body=query_body, track_total_hits=True)
    total_count = results["hits"]["total"]["value"]

    return {
        "sort": sort,
        "page": page if limit is not None else None,
        "limit": limit,
        "total_count": total_count,
        "results": [hit["_source"] for hit in results["hits"]["hits"]],
    }


@laptops_router.get("/low-stock")
def get_low_stock_laptops(
    threshold: int = Query(50),
    limit: int = Query(30),
    page: int = Query(1),
):
    query_body = {
        "query": {"range": {"quantity": {"lte": threshold}}},
        "sort": [{"quantity": {"order": "asc"}}],
        "size": limit,
        "from": (page - 1) * limit,
    }
    results = es.search(index="laptops", body=query_body, track_total_hits=True)
    total_count = results["hits"]["total"]["value"]

    return {
        "page": page,
        "limit": limit,
        "total_count": total_count,
        "results": [hit["_source"] for hit in results["hits"]["hits"]],
    }


@laptops_router.get("/latest")
def get_latest_laptops(
    brand: str = Query("all"), subbrand: str = Query("all"), limit: int = Query(35)
):
    filter_query = {"bool": {"filter": []}}
    if brand.lower() != "all":
        filter_query["bool"]["filter"].append({"term": {"brand.keyword": brand}})
    if subbrand.lower() != "all":
        filter_query["bool"]["filter"].append({"term": {"sub_brand.keyword": subbrand}})

    results = es.search(
        index="laptops",
        body={
            "query": filter_query,
            "sort": [{"inserted_at": {"order": "desc"}}],
            "size": limit,
        },
    )
    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}


@laptops_router.get("/id/{laptop_id}")
def get_laptop(laptop_id: int):
    query = {"query": {"term": {"id": laptop_id}}}
    results = es.search(index="laptops", body=query)
    if not results["hits"]["hits"]:
        raise HTTPException(status_code=404, detail="Laptop not found")
    return results["hits"]["hits"][0]["_source"]


@laptops_router.post("/{laptop_id}/upload_images")
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

    existing_urls = []
    if laptop.product_image_mini:
        try:
            existing_urls = json.loads(laptop.product_image_mini)
            if not isinstance(existing_urls, list):
                existing_urls = []
        except json.JSONDecodeError:
            existing_urls = []

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
