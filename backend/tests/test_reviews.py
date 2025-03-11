import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_reviews():
    response = client.get("/reviews?rating=4&limit=3")
    assert response.status_code == 200
    assert isinstance(response.json(), list) 
    assert len(response.json()) == 3

# def test_create_review():
#     review_data = {
#         "laptop_id": 1,  
#         "user_name": "Dao Vu Tien Dat",
#         "rating": 5,
#         "review_text": "Laptop xịn xò!"
#     }
#     response = client.post("/reviews", json=review_data)
#     assert response.status_code == 200
#     assert response.json()["message"] == "Review added successfully"

# def test_create_review_non_existent_laptop():
#     review_data = {
#         "laptop_id": 99999999,  
#         "user_name": "Dao Vu Tien Dat",
#         "rating": 5,
#         "review_text": "Laptop hỏng"
#     }
#     response = client.post("/reviews", json=review_data)
#     assert response.status_code == 404
#     assert response.json()["detail"] == "Laptop not found"

# def test_create_review_invalid_rating():
#     review_data = {
#         "laptop_id": 1,
#         "user_name": "Dao Vu Tien Dat",
#         "rating": 10,  
#         "review_text": "Great laptop!"
#     }
#     response = client.post("/reviews", json=review_data)
#     assert response.status_code == 422  