import pytest
from fastapi.testclient import TestClient
from db.models import Laptop
from main import app

client= TestClient(app)

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
    "sale_price": 1800
}
def test_create_laptop(client):
    '''
    Test create laptop
    '''
    global laptop_id

    response = client.post("/laptops/", json=TEST_SAMPLE)
    assert response.status_code == 200
    response_data = response.json() 

    assert response_data["message"] == "Laptop added successfully"
    assert response_data["laptop"]["brand"] == TEST_SAMPLE["brand"]
    assert response_data["laptop"]["cpu"] == TEST_SAMPLE["cpu"]
    assert response_data["laptop"]["sale_price"] == TEST_SAMPLE["sale_price"]

    laptop_id = response_data["laptop"]["id"]
    assert laptop_id is not None

def test_get_laptop_by_id():
    response = client.get(f"/laptops/id/{laptop_id}")
    assert response.status_code == 200
    assert response.json()["id"] == laptop_id

def test_update_laptop():
    updated_data = {
        "sale_price": 20000000,
        "ram_amount": 32
    }

    response = client.put(f"/laptops/{laptop_id}", json=updated_data)
    assert response.status_code == 200
    response_data = response.json()

    assert response_data["message"] == "Laptop updated successfully"
    assert response_data["laptop"]["sale_price"] == updated_data["sale_price"]
    assert response_data["laptop"]["ram_amount"] == updated_data["ram_amount"]