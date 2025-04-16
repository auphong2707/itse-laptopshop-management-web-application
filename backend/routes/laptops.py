# routes/laptops.py

from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from elasticsearch import Elasticsearch
from db.models import Laptop
from schemas.laptops import LaptopCreate, LaptopUpdate
from db.session import get_db

router = APIRouter(prefix="/laptops", tags=["laptops"])
es = Elasticsearch("http://elasticsearch:9200")

@router.post("/")
def insert_laptop(laptop: LaptopCreate, db: Session = Depends(get_db)):
    new_laptop = Laptop(**laptop.dict())
    db.add(new_laptop)
    db.commit()
    db.refresh(new_laptop)
    return {"message": "Laptop added successfully", "laptop": new_laptop}


@router.delete("/{laptop_id}")
def delete_laptop(laptop_id: int, db: Session = Depends(get_db)):
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")
    db.delete(laptop)
    db.commit()
    es.delete(index="laptops", id=laptop_id)
    return {"message": "Laptop deleted successfully"}


@router.put("/{laptop_id}")
def update_laptop(laptop_id: int, laptop_update: LaptopUpdate, db: Session = Depends(get_db)):
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")

    update_data = laptop_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(laptop, key, value)

    db.commit()
    db.refresh(laptop)
    return {"message": "Laptop updated successfully", "laptop": laptop}


@router.get("/search/")
def search_laptops(query: str = Query(...), limit: int = Query(10)):
    search_query = {
        "bool": {
            "should": [
                {"match": {"name": query}},
                {"match": {"serial_number": query}},
            ],
            "minimum_should_match": 1,
        }
    }

    results = es.search(index="laptops", body={"query": search_query, "size": limit})
    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}


@router.get("/filter")
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
    limit: int = Query(None),
    page: int = Query(1),
    sort: str = Query("latest"),
):
    filter_query = {"bool": {"filter": []}}
    should_query = {"bool": {"should": []}}

    if brand and "all" not in brand:
        filter_query["bool"]["filter"].append({"terms": {"brand.keyword": brand}})
    if sub_brand:
        filter_query["bool"]["filter"].append({"terms": {"sub_brand.keyword": sub_brand}})
    if ram_amount:
        filter_query["bool"]["filter"].append({"terms": {"ram_amount": ram_amount}})
    if storage_amount:
        filter_query["bool"]["filter"].append({"terms": {"storage_amount": storage_amount}})
    if cpu:
        should_query["bool"]["should"].extend(
            [{"wildcard": {"cpu.keyword": f"*{c.lower()}*"}} for c in cpu if isinstance(c, str)]
        )
    if vga:
        should_query["bool"]["should"].extend(
            [{"wildcard": {"vga.keyword": f"*{v.lower()}*"}} for v in vga if isinstance(v, str)]
        )
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


@router.get("/low-stock")
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


@router.get("/latest")
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
        body={"query": filter_query, "sort": [{"inserted_at": {"order": "desc"}}], "size": limit},
    )
    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}


@router.get("/id/{laptop_id}")
def get_laptop(laptop_id: int):
    query = {"query": {"term": {"id": laptop_id}}}
    results = es.search(index="laptops", body=query)
    if not results["hits"]["hits"]:
        raise HTTPException(status_code=404, detail="Laptop not found")
    return results["hits"]["hits"][0]["_source"]
