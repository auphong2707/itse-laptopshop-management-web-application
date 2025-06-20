from fastapi.testclient import TestClient
from main import app
from elasticsearch import Elasticsearch

client = TestClient(app)

TEST_SAMPLE = {
    "brand": "Dell",
    "sub_brand": "XPS",
    "name": "XPS 15",
    "cpu": "Intel Core i7",
    "vga": "NVIDIA RTX 3050",
    "ram_amount": 16,
    "ram_type": "DDR4",
    "storage_amount": 512,
    "storage_type": "SSD",
    "webcam_resolution": "1080p",
    "screen_size": 15.6,
    "screen_resolution": "1920x1080",
    "screen_refresh_rate": 144,
    "screen_brightness": 400,
    "battery_capacity": 86.0,
    "battery_cells": 6,
    "weight": 1.8,
    "default_os": "Windows 11",
    "warranty": 2,
    "width": 35.7,
    "depth": 23.5,
    "height": 1.7,
    "number_usb_a_ports": 2,
    "number_usb_c_ports": 2,
    "number_hdmi_ports": 1,
    "number_ethernet_ports": 1,
    "number_audio_jacks": 1,
    "product_image_mini": "https://example.com/xps15.jpg",
    "quantity": 10,
    "original_price": 2000,
    "sale_price": 1800,
}


# [CRUD TESTING]
def test_create_laptop():
    global laptop_id
    response = client.post("/laptops/", json=TEST_SAMPLE)
    assert response.status_code == 200
    response_data = response.json()

    laptop_id = response_data["laptop"]["id"]
    assert laptop_id is not None

    es = Elasticsearch("http://elasticsearch:9200")
    doc = response_data["laptop"]
    es.index(index="laptops", id=laptop_id, document=doc)

    es.indices.refresh(index="laptops")


def test_get_laptop_by_id():
    response = client.get(f"/laptops/id/{laptop_id}")
    assert response.status_code == 200
    assert response.json()["id"] == laptop_id


def test_update_laptop():
    updated_data = {"sale_price": 20000000, "ram_amount": 32}

    response = client.put(f"/laptops/{laptop_id}", json=updated_data)
    assert response.status_code == 200
    response_data = response.json()

    assert response_data["message"] == "Laptop updated successfully"
    assert response_data["laptop"]["sale_price"] == updated_data["sale_price"]
    assert response_data["laptop"]["ram_amount"] == updated_data["ram_amount"]


def test_delete_laptop():
    response = client.delete(f"/laptops/{laptop_id}")
    es = Elasticsearch("http://elasticsearch:9200")
    es.delete(index="laptops", id=laptop_id, ignore=[400, 404])
    es.indices.refresh(index="laptops")
    assert response.status_code == 200
    assert response.json()["message"] == "Laptop deleted successfully"


def test_get_delete_laptop():
    response = client.get(f"/laptops/id/{laptop_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Laptop not found"


def test_get_latest_laptops():
    response = client.get("/laptops/latest")
    assert response.status_code == 200
    json_data = response.json()
    assert "results" in json_data
    assert isinstance(json_data["results"], list)


def test_filter_laptops_by_brand_and_price():
    response = client.get(
        "/laptops/filter",
        params={"brand": ["Dell"], "price_min": 1000, "price_max": 3000, "limit": 5},
    )
    assert response.status_code == 200
    data = response.json()

    assert "results" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) <= 5

    for laptop in data["results"]:
        assert laptop["brand"].lower() == "dell"
        assert 1000 <= laptop["sale_price"] <= 3000


def test_search_laptops_by_name():
    response = client.get("/laptops/search/", params={"query": "xps", "limit": 5})
    assert response.status_code == 200
    data = response.json()

    assert "results" in data
    assert isinstance(data["results"], list)

    for laptop in data["results"]:
        assert "xps" in laptop["name"].lower()


# [EDGE CASE TESTING]
# _______________________________________________________________________________________ #
# [CREATION EDGE CASES]
def test_create_laptop_missing_fields():
    response = client.post("/laptops/", json={})
    assert response.status_code == 422


def test_create_laptop_invalid_price():
    invalid_laptop = TEST_SAMPLE.copy()
    invalid_laptop["sale_price"] = -100

    response = client.post("/laptops/", json=invalid_laptop)
    assert response.status_code == 422


def test_create_laptop_empty_fields():
    response = client.post("/laptops/", json={"brand": "", "name": "", "price": 1500})
    assert response.status_code == 422


def test_create_laptop_wrong_data_type():
    invalid_laptop = TEST_SAMPLE.copy()
    invalid_laptop["screen_size"] = "fifteen"

    response = client.post("/laptops/", json=invalid_laptop)
    assert response.status_code == 422


# [FETCHING EDGE CASES]
def test_get_non_existent_laptop():
    response = client.get("/laptops/id/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Laptop not found"


def test_get_latest_laptops_exceeding_limit():
    response = client.get("/laptops/latest?limit=500")
    assert response.status_code == 200
    json_data = response.json()
    assert "results" in json_data
    assert isinstance(json_data["results"], list)


# [UPDATE EDGE CASES]
def test_update_non_existent_laptop():
    response = client.put("/laptops/999999", json={"sale_price": 1200})
    assert response.status_code == 404
    assert response.json()["detail"] == "Laptop not found"


def test_update_laptop_invalid_values():
    response = client.put(f"/laptops/{laptop_id}", json={"sale_price": -500})
    assert response.status_code == 422


# [DELETION EDGE CASES]
def test_delete_non_existent_laptop():
    response = client.delete("/laptops/9999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Laptop not found"


# def test_delete_laptop_with_reviews():
#     response = client.delete("/laptops/1540")
#     assert response.status_code == 200
