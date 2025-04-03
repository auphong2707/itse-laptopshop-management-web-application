from fastapi.testclient import TestClient
from main import app
from elasticsearch import Elasticsearch

client = TestClient(app)

es = Elasticsearch("http://elasticsearch:9200")


def test_get_reviews():
    # 🧪 Insert mock review docs
    mock_reviews = [
        {
            "laptop_id": 1,
            "user_name": "Test A",
            "rating": 4,
            "review_text": "Very good",
        },
        {"laptop_id": 2, "user_name": "Test B", "rating": 4, "review_text": "Solid"},
        {"laptop_id": 3, "user_name": "Test C", "rating": 4, "review_text": "Nice!"},
    ]

    for i, doc in enumerate(mock_reviews):
        es.index(index="reviews", id=i + 1, document=doc)

    es.indices.refresh(index="reviews")

    response = client.get("/reviews?rating=4&limit=3")
    assert response.status_code == 200
    json_data = response.json()
    assert "results" in json_data
    assert isinstance(json_data["results"], list)
    assert len(json_data["results"]) <= 3


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
